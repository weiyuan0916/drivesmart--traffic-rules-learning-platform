#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
import unicodedata
from pathlib import Path

import fitz


def _append_horizontal_line(
    lines: list[tuple[float, float, float, float]],
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    min_width: float = 3.0,
) -> None:
    if abs(y1 - y0) > 3.5:
        return
    if abs(x1 - x0) < min_width:
        return
    lines.append((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)))


def horizontal_underlines_from_drawings(page: fitz.Page) -> list[tuple[float, float, float, float]]:
    lines: list[tuple[float, float, float, float]] = []
    for path in page.get_drawings():
        for item in path.get("items") or []:
            if not item:
                continue
            cmd = item[0]
            if cmd == "l":
                p1, p2 = item[1], item[2]
                _append_horizontal_line(lines, p1.x, p1.y, p2.x, p2.y)
            elif cmd == "re":
                r = item[1]
                if hasattr(r, "width") and r.width >= 3 and r.height <= 6:
                    lines.append((r.x0, r.y0, r.x1, r.y1))
            elif cmd == "c":
                p0, p1, p2, p3 = item[1], item[2], item[3], item[4]
                _append_horizontal_line(
                    lines,
                    p0.x,
                    p0.y,
                    p3.x,
                    p3.y,
                    min_width=4.0,
                )
            elif cmd == "qu":
                q = item[1]
                ul, ur = q.ul, q.ur
                ll, lr = q.ll, q.lr
                htop = abs(ur.y - ul.y)
                hbot = abs(lr.y - ll.y)
                if max(htop, hbot) <= 6.0:
                    x0 = min(ul.x, ll.x, ur.x, lr.x)
                    x1 = max(ul.x, ll.x, ur.x, lr.x)
                    y0 = min(ul.y, ll.y, ur.y, lr.y)
                    y1 = max(ul.y, ll.y, ur.y, lr.y)
                    if x1 - x0 >= 3:
                        lines.append((x0, y0, x1, y1))
    return lines


def underline_rects_from_annots(page: fitz.Page) -> list[fitz.Rect]:
    rects: list[fitz.Rect] = []
    try:
        for annot in page.annots(types=(fitz.PDF_ANNOT_UNDERLINE,)):
            rects.append(fitz.Rect(annot.rect))
    except (AttributeError, RuntimeError, ValueError):
        pass
    return rects


def word_underlined(
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    underlines: list[tuple[float, float, float, float]],
    annot_rects: list[fitz.Rect],
    tol_y: float = 14.0,
    overlap_ratio: float = 0.22,
) -> bool:
    w = max(x1 - x0, 1e-6)
    for ar in annot_rects:
        ol = max(0.0, min(x1, ar.x1) - max(x0, ar.x0))
        if ol / w < overlap_ratio:
            continue
        if ar.y0 <= y1 + 10 and ar.y1 >= y0 - 4:
            return True
    for ux0, uy, ux1, uy2 in underlines:
        line_y = (uy + uy2) / 2
        if line_y < y1 - 1 or line_y > y1 + tol_y:
            continue
        ol = max(0.0, min(x1, ux1) - max(x0, ux0))
        if ol / w >= overlap_ratio:
            return True
    return False


def extract_page_lines_with_underline(doc: fitz.Document) -> list[dict]:
    rows: list[dict] = []
    for pi in range(len(doc)):
        page = doc[pi]
        underlines = horizontal_underlines_from_drawings(page)
        annot_rects = underline_rects_from_annots(page)
        words = page.get_text("words")
        for w in words:
            x0, y0, x1, y1, text, *_ = w
            u = word_underlined(x0, y0, x1, y1, underlines, annot_rects)
            rows.append(
                {
                    "page": pi + 1,
                    "text": text,
                    "underlined": u,
                    "x0": x0,
                    "y": y0,
                    "x1": x1,
                    "y1": y1,
                }
            )
    rows.sort(key=lambda r: (r["page"], -round(r["y"]), r["x0"]))
    return rows


def merge_words_to_line_text(
    parts: list[dict],
) -> tuple[str, bool, int, tuple[float, float, float, float]]:
    texts = [p["text"] for p in parts]
    under = any(p["underlined"] for p in parts)
    page = parts[0]["page"]
    x0 = min(p["x0"] for p in parts)
    y0 = min(p["y"] for p in parts)
    x1 = max(p["x1"] for p in parts)
    y1 = max(p["y1"] for p in parts)
    return (" ".join(texts).strip(), under, page, (x0, y0, x1, y1))


def build_linear_segments(
    rows: list[dict],
) -> list[tuple[str, bool, int, tuple[float, float, float, float]]]:
    if not rows:
        return []
    by_page: dict[int, list[dict]] = {}
    for r in rows:
        by_page.setdefault(r["page"], []).append(r)
    segments: list[tuple[str, bool, int, tuple[float, float, float, float]]] = []
    for page in sorted(by_page.keys()):
        page_rows = sorted(by_page[page], key=lambda r: (-round(r["y"]), r["x0"]))
        line_tol = 3.0
        current: list[dict] = []
        last_y: float | None = None
        for r in page_rows:
            if last_y is not None and abs(r["y"] - last_y) > line_tol and current:
                segments.append(merge_words_to_line_text(current))
                current = []
            current.append(r)
            last_y = r["y"]
        if current:
            segments.append(merge_words_to_line_text(current))
    return segments


CAU_RE = re.compile(
    r"^\s*(?:Câu|câu|CAU)\s*(\d+)\s*[.:)\-]?\s*",
    re.IGNORECASE,
)
OPT_RE = re.compile(
    r"^\s*([1-4])\s*[\.)]\s*(.+)$",
)
STANDALONE_Q_RE = re.compile(r"^\s*(\d{1,3})\s*\.\s*(.+)$")

_STANDALONE_INTRO_PREFIXES = (
    "chương",
    "thượng tá",
    "thiếu tá",
    "đại tá",
    "trung tá",
    "trung tướng",
    "thiếu tướng",
    "đại uý",
    "trung uý",
    "hội đồng",
    "ban biên",
    "lời nói đầu",
    "mục lục",
    "ngoài ra, bộ",
)


def _standalone_rest_is_intro(rest: str) -> bool:
    r = rest.strip()
    if len(r) < 4:
        return False
    low = r.lower()
    for p in _STANDALONE_INTRO_PREFIXES:
        if low.startswith(p):
            return True
    return False


_EMBEDDED_CAU_SPLIT = re.compile(r"(?<=\S)\s+(?=Câu\s+\d+\s*\.)", re.IGNORECASE)


def split_segments_embedded_cau(
    segments: list[tuple[str, bool, int, tuple[float, float, float, float]]],
) -> list[tuple[str, bool, int, tuple[float, float, float, float]]]:
    out: list[tuple[str, bool, int, tuple[float, float, float, float]]] = []
    for text, under, page, bbox in segments:
        t = unicodedata.normalize("NFC", text)
        parts = _EMBEDDED_CAU_SPLIT.split(t)
        if len(parts) == 1:
            out.append((t.strip(), under, page, bbox))
            continue
        for p in parts:
            p = p.strip()
            if p:
                out.append((p, under, page, bbox))
    return out


def merge_cau_split_segments(
    segments: list[tuple[str, bool, int, tuple[float, float, float, float]]],
) -> list[tuple[str, bool, int, tuple[float, float, float, float]]]:
    out: list[tuple[str, bool, int, tuple[float, float, float, float]]] = []
    i = 0
    while i < len(segments):
        text, under, page, bbox = segments[i]
        t = text.strip()
        if re.match(r"^(?:Câu|câu|CAU)\s*$", t, re.IGNORECASE) and i + 1 < len(segments):
            t2, u2, p2, b2 = segments[i + 1]
            merged = (t + " " + t2.strip()).strip()
            u_m = under or u2
            x0 = min(bbox[0], b2[0])
            y0 = min(bbox[1], b2[1])
            x1 = max(bbox[2], b2[2])
            y1 = max(bbox[3], b2[3])
            out.append((merged, u_m, page, (x0, y0, x1, y1)))
            i += 2
            continue
        out.append(segments[i])
        i += 1
    return out


def pixmap_underline_score(page: fitz.Page, rect: fitz.Rect) -> float:
    ext = fitz.Rect(rect.x0, rect.y0, rect.x1, min(rect.y1 + 20, page.rect.y1))
    ext &= page.rect
    if ext.is_empty or ext.width < 4:
        return 0.0
    z = 4.0
    mat = fitz.Matrix(z, z)
    try:
        pix = page.get_pixmap(clip=ext, matrix=mat, colorspace=fitz.csGRAY, alpha=False)
    except (RuntimeError, ValueError):
        return 0.0
    w, h = pix.width, pix.height
    if h < 10:
        return 0.0
    s = pix.samples
    rows: list[float] = []
    for j in range(h):
        b = j * w
        rows.append(sum(1 for i in range(w) if s[b + i] < 228) / max(w, 1))
    split = max(1, int(h * 0.52))
    head = rows[:split]
    tail = rows[split:]
    if not head or not tail:
        return 0.0
    base = float(statistics.median(head))
    peak = max(tail)
    return max(0.0, peak - base)


def pixmap_strip_below_text(page: fitz.Page, rect: fitz.Rect) -> float:
    r = fitz.Rect(rect.x0, rect.y1, rect.x1, min(rect.y1 + 16, page.rect.y1))
    r &= page.rect
    if r.is_empty or r.width < 3 or r.height < 1.5:
        return 0.0
    z = 4.0
    try:
        pix = page.get_pixmap(clip=r, matrix=fitz.Matrix(z, z), colorspace=fitz.csGRAY, alpha=False)
    except (RuntimeError, ValueError):
        return 0.0
    w, h = pix.width, pix.height
    if w < 2 or h < 2:
        return 0.0
    buf = pix.samples
    n = w * h
    dark = sum(1 for i in range(n) if buf[i] < 232)
    return dark / max(n, 1)


def combined_underline_score(page: fitz.Page, rect: fitz.Rect) -> float:
    a = pixmap_underline_score(page, rect)
    b = pixmap_strip_below_text(page, rect)
    c = pixmap_bottom_row_peak(page, rect)
    return max(a, b * 12.0, c * 2.5)


def pixmap_bottom_row_peak(page: fitz.Page, rect: fitz.Rect) -> float:
    ext = fitz.Rect(rect.x0, rect.y0, rect.x1, min(rect.y1 + 22, page.rect.y1))
    ext &= page.rect
    if ext.is_empty or ext.width < 4:
        return 0.0
    z = 4.0
    try:
        pix = page.get_pixmap(clip=ext, matrix=fitz.Matrix(z, z), colorspace=fitz.csGRAY, alpha=False)
    except (RuntimeError, ValueError):
        return 0.0
    w, h = pix.width, pix.height
    if h < 8:
        return 0.0
    s = pix.samples
    rows = [
        sum(1 for i in range(w) if s[j * w + i] < 228) / max(w, 1) for j in range(h)
    ]
    lo = max(0, int(h * 0.62))
    tail = rows[lo:]
    if not tail:
        return 0.0
    head = rows[: max(1, lo)]
    base = float(statistics.median(head))
    return max(0.0, max(tail) - base)


def pick_answer_from_pixmap_scores(doc: fitz.Document, opt_rects: list[list]) -> int | None:
    scores: list[float] = []
    strips: list[float] = []
    for item in opt_rects:
        pg, rr = item[0], item[1]
        if pg < 1 or pg > len(doc):
            scores.append(0.0)
            strips.append(0.0)
            continue
        page = doc[pg - 1]
        scores.append(combined_underline_score(page, rr))
        strips.append(pixmap_strip_below_text(page, rr))
    if not scores or len(scores) < 2:
        return None
    mx = max(scores)
    mi = min(scores)
    top = [i for i, s in enumerate(scores) if s >= mx - 1e-9]
    if len(top) == 1:
        idx = top[0]
    else:
        idx = max(top, key=lambda i: strips[i])
    sorted_s = sorted(scores, reverse=True)
    gap12 = sorted_s[0] - sorted_s[1] if len(sorted_s) > 1 else 0.0
    med = float(statistics.median(scores))
    mean_s = float(statistics.mean(scores))
    std_s = float(statistics.pstdev(scores)) if len(scores) > 1 else 0.0
    pick = scores.index(sorted_s[0])
    if gap12 >= 0.006 and sorted_s[0] >= 0.018:
        return pick
    if mx - mi >= 0.010:
        return idx
    if gap12 >= 0.004 and sorted_s[0] >= 0.028:
        return pick
    if sorted_s[0] >= 0.045 and gap12 >= 0.003:
        return pick
    if mx > med + 0.004 and gap12 >= 0.0025:
        return idx
    if std_s > 1e-9 and mx > mean_s + 0.85 * std_s and gap12 >= 0.0018:
        return idx
    if gap12 >= 0.0012 and mx > mi + 0.0045:
        return idx
    if mx > med + 0.0025 and gap12 >= 0.0008 and mx > mi + 0.002:
        return idx
    if mx > mi + 1e-12:
        return max(range(len(scores)), key=lambda i: (scores[i], strips[i]))
    return None


def parse_from_segments(
    segments: list[tuple[str, bool, int, tuple[float, float, float, float]]],
) -> list[dict]:
    questions: list[dict] = []
    current: dict | None = None
    buf_question: list[str] = []
    collecting_question = False

    def flush_question_body():
        nonlocal buf_question, current
        if current is None:
            buf_question = []
            return
        qtext = " ".join(buf_question).strip()
        if qtext:
            current["question"] = (current.get("question") or "").strip()
            if current["question"]:
                current["question"] = current["question"] + " " + qtext
            else:
                current["question"] = qtext
        buf_question = []

    for line, under, page, bbox in segments:
        line = unicodedata.normalize("NFC", line.strip())
        if not line:
            continue
        m_cau = CAU_RE.match(line)
        qnum = None
        qrest = None
        if m_cau:
            qnum = int(m_cau.group(1))
            qrest = line[m_cau.end() :].strip()
        else:
            m_sq = STANDALONE_Q_RE.match(line)
            if m_sq:
                n = int(m_sq.group(1))
                rest0 = m_sq.group(2).strip()
                if 10 <= n <= 600 and not _standalone_rest_is_intro(rest0):
                    qnum = n
                    qrest = rest0
        if qnum is not None:
            flush_question_body()
            if current and current.get("options"):
                questions.append(current)
            current = {
                "id": qnum,
                "question": qrest,
                "image": None,
                "options": [],
                "answer": None,
                "chapter": None,
                "isCritical": False,
                "explanation": "",
                "_under_flags": [],
                "_opt_rects": [],
            }
            collecting_question = True
            buf_question = []
            continue
        if current is None:
            continue
        m_opt = OPT_RE.match(line)
        if m_opt:
            flush_question_body()
            collecting_question = False
            opt_text = m_opt.group(2).strip()
            current["options"].append(opt_text)
            current["_under_flags"].append(under)
            current["_opt_rects"].append([page, fitz.Rect(bbox)])
            continue
        if collecting_question:
            buf_question.append(line)
        else:
            if current["options"]:
                last = current["options"][-1]
                current["options"][-1] = (last + " " + line).strip()
                current["_under_flags"][-1] = current["_under_flags"][-1] or under
                pg, rr = current["_opt_rects"][-1]
                if pg == page:
                    current["_opt_rects"][-1][1] = rr | fitz.Rect(bbox)
                else:
                    current["_opt_rects"][-1] = [page, fitz.Rect(bbox)]
            else:
                buf_question.append(line)

    flush_question_body()
    if current and current.get("options"):
        questions.append(current)

    for q in questions:
        flags = q.pop("_under_flags", [])
        opts = q["options"]
        if len(flags) == len(opts):
            true_idx = [i for i, f in enumerate(flags) if f]
            if len(true_idx) == 1:
                q["answer"] = true_idx[0]
            elif len(true_idx) == 0:
                q["answer"] = None
            else:
                q["answer"] = None
                q["_answer_ambiguous"] = true_idx
        else:
            q["answer"] = None
    return questions


def resolve_answers_pixmap(doc: fitz.Document, questions: list[dict]) -> None:
    for q in questions:
        if q.get("answer") is not None:
            continue
        opts = q.get("options") or []
        rects = q.get("_opt_rects") or []
        if len(rects) != len(opts) or len(opts) < 2:
            continue
        idx = pick_answer_from_pixmap_scores(doc, rects)
        if idx is not None:
            q["answer"] = idx


def strip_internal_fields(questions: list[dict]) -> None:
    for q in questions:
        q.pop("_opt_rects", None)
        q.pop("_answer_ambiguous", None)


def text_fallback(doc: fitz.Document) -> str:
    return "\n".join(page.get_text() for page in doc)


def main() -> int:
    ap = argparse.ArgumentParser(description="PDF bo cau hoi -> JSON (underline heuristic)")
    ap.add_argument("pdf", type=Path, help="Duong dan file PDF")
    ap.add_argument("-o", "--out", type=Path, default=Path("questions_extracted.json"))
    ap.add_argument("--raw-text", type=Path, help="Ghi toan bo text ra file de debug")
    ap.add_argument(
        "--no-pixmap",
        action="store_true",
        help="Khong dung render pixmap de do gach chan (chi vector/annot)",
    )
    args = ap.parse_args()
    if not args.pdf.is_file():
        print(f"Khong tim thay: {args.pdf}", file=sys.stderr)
        return 1
    doc = fitz.open(args.pdf)
    try:
        rows = extract_page_lines_with_underline(doc)
        segments = split_segments_embedded_cau(
            merge_cau_split_segments(build_linear_segments(rows)),
        )
        items = parse_from_segments(segments)
        if not args.no_pixmap:
            resolve_answers_pixmap(doc, items)
        strip_internal_fields(items)
        if args.raw_text:
            args.raw_text.parent.mkdir(parents=True, exist_ok=True)
            args.raw_text.write_text(text_fallback(doc), encoding="utf-8")
    finally:
        doc.close()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Ghi {len(items)} cau -> {args.out}")
    missing_ids = sorted(x["id"] for x in items if x.get("answer") is None)
    if missing_ids:
        ids_str = ", ".join(str(i) for i in missing_ids)
        print(
            f"Canh bao: {len(missing_ids)} cau khong xac dinh duoc answer (gach chan hoac format). Id: {ids_str}",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
