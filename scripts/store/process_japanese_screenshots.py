import os
from PIL import Image, ImageDraw

src_dir = r'C:\Users\hsdin\Downloads\Mobile Devices'
dst_dir = r'D:\PowerNeJa\PythonWorkspace\Project_Dev\Suidoku\store_assets\ja-JP'

os.makedirs(dst_dir, exist_ok=True)

# List of Japanese source screenshots in chronological order
src_files = [
    'Screenshot_20260901_100543_Sudoku.jpg',
    'Screenshot_20260901_100550_Sudoku.jpg',
    'Screenshot_20260901_100557_Sudoku.jpg',
    'Screenshot_20260901_100602_Sudoku.jpg',
    'Screenshot_20260901_100609_Sudoku.jpg',
    'Screenshot_20260901_100615_Sudoku.jpg',
    'Screenshot_20260901_100620_Sudoku.jpg',
    'Screenshot_20260901_100625_Sudoku.jpg'
]

top_crop = 115
bot_crop = 135

print('[START] Processing Japanese (ja-JP) store screenshots...')

for i, filename in enumerate(src_files, 1):
    src_path = os.path.join(src_dir, filename)
    if not os.path.exists(src_path):
        print(f'[ERROR] File not found: {src_path}')
        continue

    img = Image.open(src_path)
    w, h = img.size

    # 1. Crop top 115px and bottom 135px
    cropped = img.crop((0, top_crop, w, h - bot_crop))
    cw, ch = cropped.size

    # 2. For Screenshot_20260901_100550_Sudoku.jpg, remove ad banner at bottom
    if filename == 'Screenshot_20260901_100550_Sudoku.jpg':
        draw = ImageDraw.Draw(cropped)
        # Background color for dark theme: #0F172A = (15, 23, 42)
        bg_dark = (15, 23, 42)
        draw.rectangle([(0, 1890), (cw, ch)], fill=bg_dark)
        print(f'  [CLEAN AD] Cleaned AdMob banner in {filename} (y: 1890..{ch}) with color {bg_dark}')

    dst_name = f'ja-JP_screenshot_real_{i:02d}.png'
    dst_path = os.path.join(dst_dir, dst_name)
    cropped.save(dst_path, 'PNG', optimize=True)
    print(f'  [SAVED] [{i}/8]: {dst_name} ({cw}x{ch})')

print('[DONE] All 8 Japanese screenshots processed and saved to ja-JP!')
