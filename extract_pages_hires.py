import os
import pymupdf

os.makedirs('docs/source_pages_hires', exist_ok=True)
doc = pymupdf.open('C:/Users/xshan/Downloads/Art Board 3.pdf')
for i in range(16):
    img = doc.extract_image(doc[i].get_images()[0][0])
    out_path = f'docs/source_pages_hires/page_{i+1:02d}.jpg'
    with open(out_path, 'wb') as f:
        f.write(img['image'])
    w, h = img['width'], img['height']
    print(f'Extracted page {i+1} ({w}x{h}) -> {out_path}')
print("Extracted all 16 pages at native resolution.")
