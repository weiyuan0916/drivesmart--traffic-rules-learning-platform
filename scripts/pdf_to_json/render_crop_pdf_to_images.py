#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

import fitz
from PIL import Image


def auto_trim_bbox(gray: Image.Image, threshold: int, pad: int) -> tuple[int, int, int, int] | None:
    table = [255 if i < threshold else 0 for i in range(256)]
    mask = gray.point(table)
    bbox = mask.getbbox()
    if not bbox:
        return None

    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(gray.width, x1 + pad)
    y1 = min(gray.height, y1 + pad)
    if x1 <= x0 or y1 <= y0:
        return None
    return x0, y0, x1, y1


def main() -> None:
    ap = argparse.ArgumentParser(description="Render PDF pages to JPG and auto-trim whitespace.")
    ap.add_argument("pdf", type=Path, help="Path to input PDF")
    ap.add_argument("-o", "--out-dir", type=Path, required=True, help="Output directory for cropped JPGs")
    ap.add_argument("--zoom", type=float, default=2.0, help="Render zoom factor (2.0 = 2x)")
    ap.add_argument("--threshold", type=int, default=245, help="Near-white threshold for trimming")
    ap.add_argument("--pad", type=int, default=8, help="Padding (px) around detected content")
    ap.add_argument("--from-page", type=int, default=1, help="First page to render (1-indexed)")
    ap.add_argument("--to-page", type=int, default=0, help="Last page to render (inclusive). 0 = end")
    ap.add_argument("--jpeg-quality", type=int, default=92, help="JPEG quality")
    args = ap.parse_args()

    doc = fitz.open(args.pdf)
    try:
        out_dir: Path = args.out_dir
        out_dir.mkdir(parents=True, exist_ok=True)

        to_page = args.to_page if args.to_page > 0 else doc.page_count
        start = max(1, args.from_page)
        end = min(doc.page_count, to_page)

        mat = fitz.Matrix(args.zoom, args.zoom)
        for i in range(start, end + 1):
            page = doc[i - 1]
            pix = page.get_pixmap(matrix=mat, colorspace=fitz.csGRAY, alpha=False)
            img = Image.frombytes("L", (pix.width, pix.height), pix.samples)

            bbox = auto_trim_bbox(img, threshold=args.threshold, pad=args.pad)
            if bbox is not None:
                img_c = img.crop(bbox)
            else:
                img_c = img

            out_path = out_dir / f"page_{i:03d}.jpg"
            img_c.convert("RGB").save(out_path, "JPEG", quality=args.jpeg_quality, optimize=True)
            print(f"{i}/{doc.page_count} -> {out_path}")
    finally:
        doc.close()


if __name__ == "__main__":
    main()

