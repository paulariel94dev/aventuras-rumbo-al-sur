"""Normalize generated wildlife boards into transparent 4x2 Phaser sheets."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "wildlife" / "source"
OUTPUT = ROOT / "public" / "assets" / "wildlife"
FRAME = 128
GRID = (4, 2)
LIMITS = {
    "fox": (118, 100),
    "guanaco": (104, 118),
    "condor": (122, 102),
    "woodpecker": (96, 118),
    "huemul": (114, 118),
}


def is_preview_background(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return max(pixel) - min(pixel) <= 22 and red + green + blue >= 525


def remove_preview_background(image: Image.Image) -> Image.Image:
    if image.mode == "RGBA" and image.getextrema()[3][0] == 0:
        return image
    rgb = image.convert("RGB")
    width, height = rgb.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index] or not is_preview_background(rgb.getpixel((x, y))):
            continue
        visited[index] = 1
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))
    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", rgb.size, 255)
    alpha.putdata([0 if value else 255 for value in visited])
    rgba.putalpha(alpha)
    return rgba


def normalize(name: str) -> None:
    source = remove_preview_background(Image.open(SOURCE / f"{name}-source.png"))
    sheet = Image.new("RGBA", (FRAME * GRID[0], FRAME * GRID[1]))
    max_width, max_height = LIMITS[name]
    for row in range(GRID[1]):
        for column in range(GRID[0]):
            left = round(column * source.width / GRID[0])
            right = round((column + 1) * source.width / GRID[0])
            top = round(row * source.height / GRID[1])
            bottom = round((row + 1) * source.height / GRID[1])
            cell = source.crop((left, top, right, bottom))
            bounds = cell.getbbox()
            if not bounds:
                raise RuntimeError(f"Empty {name} frame at {column}, {row}")
            animal = cell.crop(bounds)
            scale = min(max_width / animal.width, max_height / animal.height)
            size = (max(1, round(animal.width * scale)), max(1, round(animal.height * scale)))
            animal = animal.resize(size, Image.Resampling.NEAREST)
            x = column * FRAME + (FRAME - size[0]) // 2
            if name == "condor":
                y = row * FRAME + (FRAME - size[1]) // 2
            else:
                y = row * FRAME + 122 - size[1]
            sheet.alpha_composite(animal, (x, y))
    sheet.save(OUTPUT / f"{name}-sheet.png", optimize=True)


if __name__ == "__main__":
    for animal_name in LIMITS:
        normalize(animal_name)
