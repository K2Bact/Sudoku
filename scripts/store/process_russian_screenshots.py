import os
from PIL import Image, ImageDraw

src_dir = r'C:\Users\hsdin\Downloads\Mobile Devices'
dst_dir = r'D:\PowerNeJa\PythonWorkspace\Project_Dev\Suidoku\store_assets\ru-RU'

os.makedirs(dst_dir, exist_ok=True)

# List of source screenshots in chronological order
src_files = [
    'Screenshot_20260901_171805_Sudoku.jpg',
    'Screenshot_20260901_171810_Sudoku.jpg',
    'Screenshot_20260901_171819_Sudoku.jpg',
    'Screenshot_20260901_171824_Sudoku.jpg',
    'Screenshot_20260901_171828_Sudoku.jpg',
    'Screenshot_20260901_171833_Sudoku.jpg',
    'Screenshot_20260901_171837_Sudoku.jpg',
    'Screenshot_20260901_171840_Sudoku.jpg'
]

top_crop = 115
bot_crop = 135

print('[START] Processing Russian (ru-RU) store screenshots...')

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

    # 2. For Screenshot_20260901_171810_Sudoku.jpg, remove ad banner at bottom
    if filename == 'Screenshot_20260901_171810_Sudoku.jpg':
        draw = ImageDraw.Draw(cropped)
        # Background color for dark theme: #0F172A = (15, 23, 42)
        bg_dark = (15, 23, 42)
        draw.rectangle([(0, 1890), (cw, ch)], fill=bg_dark)
        print(f'  [CLEAN AD] Cleaned AdMob banner in {filename} (y: 1890..{ch}) with color {bg_dark}')

    # Save as both ru-RU_screenshot_real_XX.png and screenshot_real_XX.png for maximum compatibility
    dst_name_prefixed = f'ru-RU_screenshot_real_{i:02d}.png'
    dst_name_plain = f'screenshot_real_{i:02d}.png'

    dst_path_prefixed = os.path.join(dst_dir, dst_name_prefixed)
    dst_path_plain = os.path.join(dst_dir, dst_name_plain)

    cropped.save(dst_path_prefixed, 'PNG', optimize=True)
    cropped.save(dst_path_plain, 'PNG', optimize=True)
    print(f'  [SAVED] [{i}/8]: {dst_name_prefixed} & {dst_name_plain} ({cw}x{ch})')

    # Remove source file
    try:
        os.remove(src_path)
        print(f'  [DELETED] Source removed from Downloads: {filename}')
    except Exception as e:
        print(f'  [WARNING] Could not delete source: {e}')

print('[DONE] All 8 Russian screenshots processed, saved to ru-RU, and cleaned from Downloads!')
