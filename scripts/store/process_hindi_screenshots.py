import os
from PIL import Image, ImageDraw

src_dir = r'C:\Users\hsdin\Downloads\Mobile Devices'
dst_dir = r'D:\PowerNeJa\PythonWorkspace\Project_Dev\Suidoku\store_assets\hi-IN'

os.makedirs(dst_dir, exist_ok=True)

# List of source screenshots in order
src_files = [
    'Screenshot_20260901_090007_Sudoku.jpg',
    'Screenshot_20260901_090014_Sudoku.jpg',
    'Screenshot_20260901_090020_Sudoku.jpg',
    'Screenshot_20260901_090030_Sudoku.jpg',
    'Screenshot_20260901_090035_Sudoku.jpg',
    'Screenshot_20260901_090042_Sudoku.jpg',
    'Screenshot_20260901_090049_Sudoku.jpg',
    'Screenshot_20260901_090219_Sudoku.jpg'
]

top_crop = 115
bot_crop = 135

print('[START] Processing Hindi store screenshots...')

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

    # 2. For Screenshot_20260901_090219_Sudoku.jpg, remove ad banner at bottom
    if filename == 'Screenshot_20260901_090219_Sudoku.jpg':
        draw = ImageDraw.Draw(cropped)
        # Background color for dark theme: #0F172A = (15, 23, 42)
        bg_dark = (15, 23, 42)
        draw.rectangle([(0, 1890), (cw, ch)], fill=bg_dark)
        print(f'  [CLEAN AD] Cleaned AdMob banner in {filename} (y: 1890..{ch}) with color {bg_dark}')

    dst_name = f'hi-IN_screenshot_real_{i:02d}.png'
    dst_path = os.path.join(dst_dir, dst_name)
    cropped.save(dst_path, 'PNG', optimize=True)
    print(f'  [SAVED] [{i}/8]: {dst_name} ({cw}x{ch})')

print('[DONE] All 8 Hindi screenshots processed and saved to hi-IN!')
