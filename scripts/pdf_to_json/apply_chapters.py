#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "bo-600-cau-hoi.json"

CHAPTER_RANGES: list[tuple[int, int, str]] = [
    (
        1,
        180,
        "Chương I. Quy định chung và quy tắc giao thông đường bộ",
    ),
    (
        181,
        205,
        "Chương II. Văn hóa giao thông, đạo đức người lái xe, kỹ năng phòng cháy, chữa cháy và cứu hộ, cứu nạn",
    ),
    (206, 263, "Chương III. Kỹ thuật lái xe"),
    (264, 300, "Chương IV. Cấu tạo và sửa chữa"),
    (301, 485, "Chương V. Báo hiệu đường bộ"),
    (
        486,
        600,
        "Chương VI. Giải thế sa hình và kỹ năng xử lý tình huống giao thông",
    ),
]


def chapter_for_id(qid: int) -> str | None:
    for lo, hi, title in CHAPTER_RANGES:
        if lo <= qid <= hi:
            return title
    return None


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for row in data:
        cid = row.get("id")
        if not isinstance(cid, int):
            continue
        row["chapter"] = chapter_for_id(cid)
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    missing = [row["id"] for row in data if row.get("chapter") is None]
    print(f"Updated chapters -> {JSON_PATH}")
    if missing:
        print(f"Ids without chapter mapping: {missing}")


if __name__ == "__main__":
    main()
