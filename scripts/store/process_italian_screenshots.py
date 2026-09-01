import os
from PIL import Image, ImageDraw

src_dir = r'C:\Users\hsdin\Downloads\Mobile Devices'
dst_dir = r'D:\PowerNeJa\PythonWorkspace\Project_Dev\Suidoku\store_assets\it-IT'

os.makedirs(dst_dir, exist_ok=True)

# List of source screenshots in chronological order
src_files = [
    'Screenshot_20260901_152719_Sudoku.jpg',
    'Screenshot_20260901_152724_Sudoku.jpg',
    'Screenshot_20260901_152731_Sudoku.jpg',
    'Screenshot_20260901_152737_Sudoku.jpg',
    'Screenshot_20260901_152741_Sudoku.jpg',
    'Screenshot_20260901_152745_Sudoku.jpg',
    'Screenshot_20260901_152749_Sudoku.jpg',
    'Screenshot_20260901_152754_Sudoku.jpg'
]

top_crop = 115
bot_crop = 135

print('[START] Processing Italian (it-IT) store screenshots...')

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

    # 2. For Screenshot_20260901_152724_Sudoku.jpg, remove ad banner at bottom
    if filename == 'Screenshot_20260901_152724_Sudoku.jpg':
        draw = ImageDraw.Draw(cropped)
        # Background color for dark theme: #0F172A = (15, 23, 42)
        bg_dark = (15, 23, 42)
        draw.rectangle([(0, 1890), (cw, ch)], fill=bg_dark)
        print(f'  [CLEAN AD] Cleaned AdMob banner in {filename} (y: 1890..{ch}) with color {bg_dark}')

    dst_name = f'it-IT_screenshot_real_{i:02d}.png'
    dst_path = os.path.join(dst_dir, dst_name)
    cropped.save(dst_path, 'PNG', optimize=True)
    print(f'  [SAVED] [{i}/8]: {dst_name} ({cw}x{ch})')

    # Remove source file
    try:
        os.remove(src_path)
        print(f'  [DELETED] Source removed from Downloads: {filename}')
    except Exception as e:
        print(f'  [WARNING] Could not delete source: {e}')

print('[DONE] All 8 Italian screenshots processed, saved to it-IT, and cleaned from Downloads!')
