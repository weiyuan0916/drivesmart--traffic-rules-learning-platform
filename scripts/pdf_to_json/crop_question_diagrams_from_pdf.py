#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import fitz
from PIL import Image
from PIL import ImageChops


CAU_RE = re.compile(r"^\s*(?:Câu|câu|CAU)\s*(\d{1,3})\s*[.:)\-]?\s*", re.IGNORECASE)
OPT_RE = re.compile(r"^\s*([1-4])\s*[\.)]\s*(.+)$")


def build_line_segments(words: list[tuple], line_tol: float = 3.0) -> list[tuple[str, tuple[float, float, float, float]]]:
    rows: list[tuple[float, float, str, float, float, float, float]] = []
    for w in words:
        x0, y0, x1, y1, text, *_ = w
        t = (text or "").strip()
        if not t:
            continue
        rows.append((x0, y0, t, x0, y0, x1, y1))

    if not rows:
        return []

    rows.sort(key=lambda r: (-round(r[1]), r[0]))
    segments: list[tuple[str, tuple[float, float, float, float]]] = []

    current: list[tuple[str, float, float, float, float]] = []
    last_y: float | None = None
    cur_y0: float | None = None

    def flush() -> None:
        nonlocal current, cur_y0
        if not current:
            return
        texts = [p[0] for p in current]
        x0 = min(p[1] for p in current)
        y0 = min(p[2] for p in current)
        x1 = max(p[3] for p in current)
        y1 = max(p[4] for p in current)
        seg_text = " ".join(texts).strip()
        if seg_text:
            segments.append((seg_text, (x0, y0, x1, y1)))
        current = []
        cur_y0 = None

    for _, y0, text, lx0, ly0, lx1, ly1 in rows:
        if last_y is not None and abs(y0 - last_y) > line_tol and current:
            flush()
        current.append((text, lx0, ly0, lx1, ly1))
        last_y = y0
        cur_y0 = y0

    flush()
    return segments


def auto_trim_bbox_rgb(img: Image.Image, threshold: int, pad: int) -> tuple[int, int, int, int] | None:
    if img.mode != "RGB":
        img = img.convert("RGB")
    gray = img.convert("L")
    table = [255 if i < threshold else 0 for i in range(256)]
    mask = gray.point(table)
    bbox = mask.getbbox()
    if not bbox:
        return None
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    if x1 <= x0 or y1 <= y0:
        return None
    return x0, y0, x1, y1


def auto_trim_bbox_saturation(
    img: Image.Image,
    sat_threshold: int,
    v_min: int,
    pad: int,
) -> tuple[int, int, int, int] | None:
    if img.mode != "RGB":
        img = img.convert("RGB")
    hsv = img.convert("HSV")
    s = hsv.split()[1]
    v = hsv.split()[2]
    s_mask = s.point(lambda vv: 255 if vv >= sat_threshold else 0)
    # Exclude dark text by requiring value/brightness to be above threshold too.
    # Text is usually dark (low V), while colored diagrams/signs tend to have higher V.
    v_mask = v.point(lambda vv: 255 if vv >= v_min else 0)
    mask = ImageChops.multiply(s_mask, v_mask)
    bbox = mask.getbbox()
    if not bbox:
        return None
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    if x1 <= x0 or y1 <= y0:
        return None
    return x0, y0, x1, y1


def clamp_rect(rect: fitz.Rect, page_rect: fitz.Rect) -> fitz.Rect:
    r = fitz.Rect(rect.x0, rect.y0, rect.x1, rect.y1)
    r.x0 = max(page_rect.x0, r.x0)
    r.y0 = max(page_rect.y0, r.y0)
    r.x1 = min(page_rect.x1, r.x1)
    r.y1 = min(page_rect.y1, r.y1)
    return r


def crop_one(
    page: fitz.Page,
    rect: fitz.Rect,
    zoom: float,
    trim_threshold: int,
    trim_pad: int,
    trim_sat_threshold: int,
    trim_v_min: int,
) -> Image.Image | None:
    rect = clamp_rect(rect, page.rect)
    if rect.is_empty or rect.width < 10 or rect.height < 10:
        return None
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(clip=rect, matrix=mat, colorspace=fitz.csRGB, alpha=False)
    if pix.width < 20 or pix.height < 20:
        return None
    mode = "RGB"
    img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
    # First try color-based trim (diagrams are usually colored), then fallback to white-based trim.
    # If saturation trim collapses the image (too small), also fallback.
    tb_sat = auto_trim_bbox_saturation(
        img, sat_threshold=trim_sat_threshold, v_min=trim_v_min, pad=trim_pad
    )
    used_sat = False
    if tb_sat is not None:
        img_sat = img.crop(tb_sat)
        if img_sat.width >= 30 and img_sat.height >= 30:
            img = img_sat
            used_sat = True

    if not used_sat:
        tb = auto_trim_bbox_rgb(img, threshold=trim_threshold, pad=trim_pad)
        if tb is not None:
            img = img.crop(tb)
    if img.width < 30 or img.height < 30:
        return None
    return img


def main() -> None:
    ap = argparse.ArgumentParser(description="Crop per-question diagram images from PDF (keep color).")
    ap.add_argument("pdf", type=Path)
    ap.add_argument("-j", "--questions-json", type=Path, required=True)
    ap.add_argument("-o", "--images-dir", type=Path, required=True)
    ap.add_argument("--min-id", type=int, default=301)
    ap.add_argument("--max-id", type=int, default=600)
    ap.add_argument("--zoom", type=float, default=2.2)
    ap.add_argument("--trim-threshold", type=int, default=245)
    ap.add_argument("--trim-pad", type=int, default=6)
    ap.add_argument("--img-min-size", type=float, default=60.0)
    ap.add_argument("--draw-x-min", type=float, default=120.0)
    ap.add_argument("--diagram-top-pad", type=float, default=10.0)
    ap.add_argument("--diagram-bottom-pad", type=float, default=4.0)
    ap.add_argument("--diagram-pad", type=float, default=12.0)
    ap.add_argument("--trim-sat-threshold", type=int, default=140, help="Saturation threshold for color trim (HSV S channel).")
    ap.add_argument("--trim-v-min", type=int, default=90, help="Value threshold for color trim (HSV V channel).")
    ap.add_argument(
        "--min-area-ratio",
        type=float,
        default=0.55,
        help="Keep only image candidates whose area >= ratio * max_area (prevents capturing title/option text).",
    )
    ap.add_argument("--update-json", action="store_true")
    ap.add_argument("--json-image-prefix", type=str, default="images/")
    args = ap.parse_args()

    data = json.loads(args.questions_json.read_text(encoding="utf-8"))
    want_ids = {int(x["id"]) for x in data if isinstance(x.get("id"), int) and args.min_id <= x["id"] <= args.max_id}

    args.images_dir.mkdir(parents=True, exist_ok=True)
    out_paths: dict[int, str] = {}

    doc = fitz.open(str(args.pdf))
    try:
        for page_idx in range(doc.page_count):
            page_no = page_idx + 1
            page = doc[page_idx]
            words = page.get_text("words")
            segs = build_line_segments(words)
            if not segs:
                continue

            question_lines: list[tuple[int, float, float, float, float]] = []
            option_lines: list[tuple[int, float, float, float, float, str]] = []

            for text, bbox in segs:
                m = CAU_RE.match(text)
                if m:
                    qid = int(m.group(1))
                    if qid in want_ids:
                        x0, y0, x1, y1 = bbox
                        question_lines.append((qid, x0, y0, x1, y1))
                    continue
                m2 = OPT_RE.match(text)
                if m2:
                    opt_no = int(m2.group(1))
                    opt_text = m2.group(2).strip()
                    x0, y0, x1, y1 = bbox
                    option_lines.append((opt_no, x0, y0, x1, y1, opt_text))

            if not question_lines:
                continue

            question_lines.sort(key=lambda q: q[2])

            next_qtops: list[float] = []
            for i in range(len(question_lines)):
                if i + 1 < len(question_lines):
                    next_qtops.append(question_lines[i + 1][2])
                else:
                    next_qtops.append(page.rect.y1)

            imgs = page.get_images(full=True)
            if not imgs:
                continue

            for qi, qrow in enumerate(question_lines):
                qid, qx0, qy0, qx1, qy1 = qrow
                qnext_top = next_qtops[qi]

                opts_after = [o for o in option_lines if o[2] >= qy1 - 0.5 and o[2] < qnext_top + 1.0]
                if not opts_after:
                    y_option_min = qnext_top
                else:
                    y_option_min = min(o[2] for o in opts_after)

                diagram_y0 = max(page.rect.y0, qy0 - args.diagram_top_pad)
                diagram_y1 = min(page.rect.y1, y_option_min + args.diagram_bottom_pad)

                image_candidates: list[fitz.Rect] = []
                for im in imgs:
                    xref = im[0]
                    try:
                        rects = page.get_image_rects(xref)
                    except Exception:
                        rects = []
                    for r in rects:
                        rect = fitz.Rect(r)
                        if rect.width < args.img_min_size or rect.height < args.img_min_size:
                            continue
                        cx = (rect.x0 + rect.x1) / 2.0
                        cy = (rect.y0 + rect.y1) / 2.0
                        if cx < args.draw_x_min:
                            continue
                        if cy < diagram_y0 or cy > diagram_y1:
                            continue
                        image_candidates.append(rect)

                if not image_candidates:
                    continue

                # Some pages contain multiple raster regions inside the same vertical band.
                # Usually only the largest region is the actual diagram; smaller ones can be question/options text.
                areas = [r.width * r.height for r in image_candidates]
                max_area = max(areas) if areas else 0.0
                if max_area > 0:
                    kept = [r for r, a in zip(image_candidates, areas) if a >= args.min_area_ratio * max_area]
                else:
                    kept = image_candidates
                if not kept:
                    kept = image_candidates

                ux0 = min(r.x0 for r in kept)
                uy0 = min(r.y0 for r in kept)
                ux1 = max(r.x1 for r in kept)
                uy1 = max(r.y1 for r in kept)

                clip = fitz.Rect(
                    ux0 - args.diagram_pad,
                    uy0 - args.diagram_pad,
                    ux1 + args.diagram_pad,
                    uy1 + args.diagram_pad,
                )

                img = crop_one(
                    page=page,
                    rect=clip,
                    zoom=args.zoom,
                    trim_threshold=args.trim_threshold,
                    trim_pad=args.trim_pad,
                    trim_sat_threshold=args.trim_sat_threshold,
                    trim_v_min=args.trim_v_min,
                )
                if img is None:
                    continue

                out_path = args.images_dir / f"cau_{qid:03d}.jpg"
                img.convert("RGB").save(out_path, "JPEG", quality=92, optimize=True)
                out_paths[qid] = str(out_path)
                print(f"page {page_no}: wrote {out_path} (qid={qid})")

    finally:
        doc.close()

    if args.update_json:
        by_id = {x["id"]: x for x in data if isinstance(x.get("id"), int)}
        for qid, p in out_paths.items():
            rel = p
            if rel.startswith(str(args.json_image_prefix)):
                pass
            if "images/" in rel:
                idx = rel.index("images/")
                rel = rel[idx:]
            by_id[qid]["image"] = rel
        args.questions_json.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Done. Wrote {len(out_paths)} images for ids in [{args.min_id},{args.max_id}].")


if __name__ == "__main__":
    main()

