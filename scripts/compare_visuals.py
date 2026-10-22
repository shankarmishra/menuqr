#!/usr/bin/env python3
"""
scripts/compare_visuals.py
MENUQR Visual QA & Comparison Engine

Compares source PDF page images (from docs/source_pages_hires/) against
actual rendered website section screenshots (from qa-screenshots/mannat/).

Features:
- Aspect-ratio preserving resizing & canonical canvas alignment
- Side-by-side visual comparison with header annotations
- 50% opacity blend overlay for alignment verification
- Difference heatmap (OpenCV COLORMAP_JET / COLORMAP_TURBO)
- Structural Similarity Index (SSIM), PSNR, Content Match %, Color Hist Correlation
- Automated JSON metrics generation & Markdown comparison summary table
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def compute_ssim(img1: np.ndarray, img2: np.ndarray) -> float:
    """
    Computes Structural Similarity Index (SSIM) based on Wang et al. (2004).
    Input images should be grayscale or BGR, float64 or uint8.
    """
    if len(img1.shape) == 3:
        img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    if len(img2.shape) == 3:
        img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    img1 = img1.astype(np.float64)
    img2 = img2.astype(np.float64)

    c1 = (0.01 * 255.0) ** 2
    c2 = (0.03 * 255.0) ** 2

    kernel = cv2.getGaussianKernel(11, 1.5)
    window = np.outer(kernel, kernel.transpose())

    mu1 = cv2.filter2D(img1, -1, window)[5:-5, 5:-5]
    mu2 = cv2.filter2D(img2, -1, window)[5:-5, 5:-5]

    mu1_sq = mu1 ** 2
    mu2_sq = mu2 ** 2
    mu1_mu2 = mu1 * mu2

    sigma1_sq = cv2.filter2D(img1 ** 2, -1, window)[5:-5, 5:-5] - mu1_sq
    sigma2_sq = cv2.filter2D(img2 ** 2, -1, window)[5:-5, 5:-5] - mu2_sq
    sigma12 = cv2.filter2D(img1 * img2, -1, window)[5:-5, 5:-5] - mu1_mu2

    ssim_map = ((2 * mu1_mu2 + c1) * (2 * sigma12 + c2)) / (
        (mu1_sq + mu2_sq + c1) * (sigma1_sq + sigma2_sq + c2)
    )
    return float(np.clip(ssim_map.mean(), -1.0, 1.0))


def compute_psnr(img1: np.ndarray, img2: np.ndarray) -> float:
    """Computes Peak Signal-to-Noise Ratio (PSNR) in dB."""
    mse = np.mean((img1.astype(np.float64) - img2.astype(np.float64)) ** 2)
    if mse == 0:
        return 100.0
    max_pixel = 255.0
    psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
    return float(psnr)


def compute_content_match(img1: np.ndarray, img2: np.ndarray) -> float:
    """Computes mean pixel absolute difference inverted to 0-100% scale."""
    diff = np.abs(img1.astype(np.float64) - img2.astype(np.float64))
    mean_diff = np.mean(diff)
    match_pct = (1.0 - (mean_diff / 255.0)) * 100.0
    return float(np.clip(match_pct, 0.0, 100.0))


def compute_color_histogram_corr(img1: np.ndarray, img2: np.ndarray) -> float:
    """Computes correlation across color histograms in BGR space."""
    corrs = []
    for c in range(3):
        hist1 = cv2.calcHist([img1], [c], None, [64], [0, 256])
        hist2 = cv2.calcHist([img2], [c], None, [64], [0, 256])
        cv2.normalize(hist1, hist1, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        corr = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        corrs.append(corr)
    return float(np.mean(corrs))


def pad_to_aspect_canvas(
    img: np.ndarray, target_w: int, target_h: int, bg_color: Tuple[int, int, int] = (248, 246, 240)
) -> np.ndarray:
    """
    Scales image while preserving aspect ratio, centering on a target canvas.
    bg_color in BGR format (default is subtle cream Dhaba parchment).
    """
    h, w = img.shape[:2]
    scale = min(target_w / w, target_h / h)
    new_w = max(1, int(w * scale))
    new_h = max(1, int(h * scale))

    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    canvas = np.full((target_h, target_w, 3), bg_color, dtype=np.uint8)
    x_offset = (target_w - new_w) // 2
    y_offset = (target_h - new_h) // 2

    canvas[y_offset : y_offset + new_h, x_offset : x_offset + new_w] = resized
    return canvas


def create_header_banner(
    width: int, height: int, title: str, subtitle: str, metrics_str: str = ""
) -> np.ndarray:
    """Creates a dark luxury header banner with crisp text annotations."""
    banner = np.zeros((height, width, 3), dtype=np.uint8)
    banner[:] = (24, 30, 25) # Dhaba dark slate #191E18

    # Bottom accent line (Imperial Gold #FAB700)
    cv2.line(banner, (0, height - 3), (width, height - 3), (0, 183, 250), 3)

    # Convert to PIL for anti-aliased typography
    pil_img = Image.fromarray(cv2.cvtColor(banner, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)

    # Try system fonts or default
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()
    try:
        # Check standard Windows fonts
        for font_candidate in ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]:
            if os.path.exists(font_candidate):
                font_large = ImageFont.truetype(font_candidate, 22)
                font_small = ImageFont.truetype(font_candidate, 14)
                break
    except Exception:
        pass

    draw.text((20, 14), title, fill=(250, 183, 0), font=font_large) # Gold
    draw.text((20, 48), subtitle, fill=(200, 210, 205), font=font_small)

    if metrics_str:
        draw.text((width - 480, 20), metrics_str, fill=(80, 220, 140), font=font_small)

    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def compare_images(
    source_path: str,
    web_path: str,
    output_prefix: str,
    output_dir: str,
    canvas_w: int = 1200,
    canvas_h: int = 1697,
) -> Dict[str, Any]:
    """
    Compares source PDF page and website section screenshot.
    Generates side-by-side, 50% overlay, diff heatmap, and metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")
    if not os.path.exists(web_path):
        raise FileNotFoundError(f"Web screenshot file not found: {web_path}")

    # Load images with OpenCV
    src_raw = cv2.imread(source_path)
    web_raw = cv2.imread(web_path)

    if src_raw is None:
        raise ValueError(f"Could not decode image at {source_path}")
    if web_raw is None:
        raise ValueError(f"Could not decode image at {web_path}")

    src_orig_h, src_orig_w = src_raw.shape[:2]
    web_orig_h, web_orig_w = web_raw.shape[:2]

    # Canonical aligned canvases (aspect-ratio preserved padding)
    src_aligned = pad_to_aspect_canvas(src_raw, canvas_w, canvas_h)
    web_aligned = pad_to_aspect_canvas(web_raw, canvas_w, canvas_h)

    # Compute metrics on aligned images
    ssim_val = compute_ssim(src_aligned, web_aligned)
    psnr_val = compute_psnr(src_aligned, web_aligned)
    content_match_val = compute_content_match(src_aligned, web_aligned)
    hist_corr_val = compute_color_histogram_corr(src_aligned, web_aligned)

    metrics = {
        "output_prefix": output_prefix,
        "source_path": source_path,
        "web_path": web_path,
        "source_dimensions": {"width": src_orig_w, "height": src_orig_h},
        "web_dimensions": {"width": web_orig_w, "height": web_orig_h},
        "aligned_canvas": {"width": canvas_w, "height": canvas_h},
        "metrics": {
            "ssim": round(ssim_val, 4),
            "psnr_db": round(psnr_val, 2),
            "content_match_pct": round(content_match_val, 2),
            "color_hist_correlation": round(hist_corr_val, 4),
        },
    }

    metrics_str = f"SSIM: {ssim_val:.3f} | PSNR: {psnr_val:.1f}dB | Match: {content_match_val:.1f}% | HistCorr: {hist_corr_val:.3f}"

    # -------------------------------------------------------------------------
    # 1. 50% OPACITY BLEND OVERLAY
    # -------------------------------------------------------------------------
    blend_body = cv2.addWeighted(src_aligned, 0.5, web_aligned, 0.5, 0)
    overlay_header = create_header_banner(
        canvas_w,
        80,
        f"50% OPACITY BLEND OVERLAY — {output_prefix.upper()}",
        f"Source: {os.path.basename(source_path)} (50%) + Web: {os.path.basename(web_path)} (50%)",
        metrics_str,
    )
    overlay_full = np.vstack([overlay_header, blend_body])
    overlay_out_path = os.path.join(output_dir, f"{output_prefix}_overlay_50pct.png")
    cv2.imwrite(overlay_out_path, overlay_full)

    # -------------------------------------------------------------------------
    # 2. DIFFERENCE HEATMAP
    # -------------------------------------------------------------------------
    abs_diff = cv2.absdiff(src_aligned, web_aligned)
    gray_diff = cv2.cvtColor(abs_diff, cv2.COLOR_BGR2GRAY)
    
    # Normalize diff for high dynamic range visualization
    norm_diff = cv2.normalize(gray_diff, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
    heatmap_raw = cv2.applyColorMap(norm_diff, cv2.COLORMAP_JET)

    # Composite Heatmap: 70% Heatmap + 30% Desaturated Source for structural anchor
    gray_src_bgr = cv2.cvtColor(cv2.cvtColor(src_aligned, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
    heatmap_composite = cv2.addWeighted(heatmap_raw, 0.75, gray_src_bgr, 0.25, 0)

    heatmap_header = create_header_banner(
        canvas_w,
        80,
        f"DIFFERENCE HEATMAP — {output_prefix.upper()}",
        f"Blue = 0 Diff | Yellow = Text/Border Drift | Red = Graphic Divergence",
        metrics_str,
    )
    heatmap_full = np.vstack([heatmap_header, heatmap_composite])
    heatmap_out_path = os.path.join(output_dir, f"{output_prefix}_diff_heatmap.png")
    cv2.imwrite(heatmap_out_path, heatmap_full)

    # -------------------------------------------------------------------------
    # 3. SIDE-BY-SIDE COMPARISON
    # -------------------------------------------------------------------------
    # Standardize both to same height while keeping respective aspect ratios
    side_h = 1400
    scale_src = side_h / src_orig_h
    scale_web = side_h / web_orig_h
    src_side = cv2.resize(src_raw, (max(1, int(src_orig_w * scale_src)), side_h), interpolation=cv2.INTER_AREA)
    web_side = cv2.resize(web_raw, (max(1, int(web_orig_w * scale_web)), side_h), interpolation=cv2.INTER_AREA)

    divider = np.full((side_h, 8, 3), (0, 183, 250), dtype=np.uint8) # Imperial Gold divider line
    side_body = np.hstack([src_side, divider, web_side])
    total_w = side_body.shape[1]

    side_header = create_header_banner(
        total_w,
        90,
        f"SIDE-BY-SIDE VISUAL COMPARISON — {output_prefix.upper()}",
        f"Left: Authentic Source PDF ({os.path.basename(source_path)})  |  Right: Rendered Web Section ({os.path.basename(web_path)})",
        metrics_str,
    )
    side_by_side_full = np.vstack([side_header, side_body])
    side_out_path = os.path.join(output_dir, f"{output_prefix}_side_by_side.png")
    cv2.imwrite(side_out_path, side_by_side_full)

    # Save individual metrics JSON
    metrics_json_path = os.path.join(output_dir, f"{output_prefix}_metrics.json")
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    metrics["artifacts"] = {
        "side_by_side": side_out_path,
        "overlay_50pct": overlay_out_path,
        "diff_heatmap": heatmap_out_path,
        "metrics_json": metrics_json_path,
    }

    return metrics


def run_baseline_suite(output_dir: str = "docs/mannat-visual-comparison") -> Dict[str, Any]:
    """Runs baseline comparisons for Pages 4, 5, 6 against website section screenshots."""
    test_cases = [
        {
            "prefix": "page04_desktop_tandoori_snacks",
            "source": "docs/source_pages_hires/page_04.jpg",
            "web": "qa-screenshots/mannat/section_desktop_page04_tandoori.png",
            "title": "Page 4 — MTJ Tandoori Snacks (Desktop)",
        },
        {
            "prefix": "page04_mobile_tandoori_snacks",
            "source": "docs/source_pages_hires/page_04.jpg",
            "web": "qa-screenshots/mannat/section_page04_tandoori.png",
            "title": "Page 4 — MTJ Tandoori Snacks (Mobile)",
        },
        {
            "prefix": "page05_desktop_kebabs_platters",
            "source": "docs/source_pages_hires/page_05.jpg",
            "web": "qa-screenshots/mannat/section_desktop_page05_kebabs.png",
            "title": "Page 5 — Veg Kebabs & Signature Platters (Desktop)",
        },
        {
            "prefix": "page05_mobile_kebabs_platters",
            "source": "docs/source_pages_hires/page_05.jpg",
            "web": "qa-screenshots/mannat/section_page05_kebabs.png",
            "title": "Page 5 — Veg Kebabs & Signature Platters (Mobile)",
        },
        {
            "prefix": "page06_desktop_crunch_soups",
            "source": "docs/source_pages_hires/page_06.jpg",
            "web": "qa-screenshots/mannat/section_desktop_page06_crunch.png",
            "title": "Page 6 — MTJ Crunch House & Soups (Desktop)",
        },
        {
            "prefix": "page06_mobile_crunch_soups",
            "source": "docs/source_pages_hires/page_06.jpg",
            "web": "qa-screenshots/mannat/section_page06_crunch.png",
            "title": "Page 6 — MTJ Crunch House & Soups (Mobile)",
        },
    ]

    all_results = []
    print(f"\n=======================================================")
    print(f"  MENUQR VISUAL COMPARISON ENGINE — BASELINE AUDIT")
    print(f"=======================================================")

    for tc in test_cases:
        print(f"\nComparing {tc['title']}...")
        res = compare_images(
            source_path=tc["source"],
            web_path=tc["web"],
            output_prefix=tc["prefix"],
            output_dir=output_dir,
        )
        res["title"] = tc["title"]
        all_results.append(res)
        m = res["metrics"]
        print(f"  [OK] SSIM: {m['ssim']} | PSNR: {m['psnr_db']} dB | Match: {m['content_match_pct']}% | HistCorr: {m['color_hist_correlation']}")
        print(f"  [OK] Saved side-by-side: {res['artifacts']['side_by_side']}")
        print(f"  [OK] Saved 50% overlay:  {res['artifacts']['overlay_50pct']}")
        print(f"  [OK] Saved diff heatmap: {res['artifacts']['diff_heatmap']}")

    # Save summary JSON
    summary_path = os.path.join(output_dir, "summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)

    # Generate Markdown Summary
    md_path = os.path.join(output_dir, "README.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Mannat Tandoori Junction — Visual Comparison Engine Results\n\n")
        f.write(f"Generated automatically by `scripts/compare_visuals.py` on {np.datetime64('now')}.\n\n")
        f.write("## Baseline Metrics Matrix (Pages 4, 5, 6)\n\n")
        f.write("| Section / Page | Target PDF | Rendered Web Screenshot | SSIM | PSNR (dB) | Content Match | Hist Corr |\n")
        f.write("| :--- | :--- | :--- | :---: | :---: | :---: | :---: |\n")
        for r in all_results:
            m = r["metrics"]
            src_name = os.path.basename(r["source_path"])
            web_name = os.path.basename(r["web_path"])
            f.write(
                f"| **{r['title']}** | `{src_name}` | `{web_name}` | `{m['ssim']}` | `{m['psnr_db']} dB` | `{m['content_match_pct']}%` | `{m['color_hist_correlation']}` |\n"
            )
        f.write("\n## Generated Visual Artifacts\n\n")
        for r in all_results:
            f.write(f"### {r['title']}\n\n")
            f.write(f"- **Side-by-Side Comparison:** [`{os.path.basename(r['artifacts']['side_by_side'])}`](file:///{os.path.abspath(r['artifacts']['side_by_side']).replace(chr(92), '/')})\n")
            f.write(f"- **50% Opacity Overlay:** [`{os.path.basename(r['artifacts']['overlay_50pct'])}`](file:///{os.path.abspath(r['artifacts']['overlay_50pct']).replace(chr(92), '/')})\n")
            f.write(f"- **Difference Heatmap:** [`{os.path.basename(r['artifacts']['diff_heatmap'])}`](file:///{os.path.abspath(r['artifacts']['diff_heatmap']).replace(chr(92), '/')})\n")
            f.write(f"- **Metrics JSON:** [`{os.path.basename(r['artifacts']['metrics_json'])}`](file:///{os.path.abspath(r['artifacts']['metrics_json']).replace(chr(92), '/')})\n\n")

    print(f"\n=======================================================")
    print(f"[OK] Summary written to: {summary_path}")
    print(f"[OK] Markdown index written to: {md_path}")
    print(f"=======================================================\n")
    return {"results": all_results, "summary_path": summary_path, "md_path": md_path}


def main():
    parser = argparse.ArgumentParser(description="MENUQR Visual QA & Comparison Engine")
    parser.add_argument("--source", type=str, help="Path to source PDF page image")
    parser.add_argument("--web", type=str, help="Path to rendered website section screenshot")
    parser.add_argument("--out-prefix", type=str, default="comparison", help="Prefix for output artifact names")
    parser.add_argument("--out-dir", type=str, default="docs/mannat-visual-comparison", help="Output directory")
    parser.add_argument("--all", action="store_true", help="Run the baseline comparison suite (Pages 4, 5, 6)")

    args = parser.parse_args()

    if args.all or (not args.source and not args.web):
        run_baseline_suite(output_dir=args.out_dir)
    else:
        if not args.source or not args.web:
            parser.error("Both --source and --web must be specified when not running with --all")
        res = compare_images(
            source_path=args.source,
            web_path=args.web,
            output_prefix=args.out_prefix,
            output_dir=args.out_dir,
        )
        print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
