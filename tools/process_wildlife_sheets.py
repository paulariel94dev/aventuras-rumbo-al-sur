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


def remove_tiny_specks(image: Image.Image, maximum: int = 180, keep_bottom: int = 45) -> Image.Image:
    """Drop detached one-pixel noise while retaining separate paws and tail tips."""
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    seen = bytearray(width * height)
    for start in range(width * height):
        x, y = start % width, start // width
        if seen[start] or alpha.getpixel((x, y)) == 0:
            continue
        stack = [start]
        seen[start] = 1
        component = []
        while stack:
            index = stack.pop()
            component.append(index)
            px, py = index % width, index // width
            for ny in range(max(0, py - 1), min(height, py + 2)):
                for nx in range(max(0, px - 1), min(width, px + 2)):
                    neighbor = ny * width + nx
                    if not seen[neighbor] and alpha.getpixel((nx, ny)):
                        seen[neighbor] = 1
                        stack.append(neighbor)
        bottommost = max(index // width for index in component)
        # A few naturally detached paw pixels can sit at the foot baseline.
        if len(component) <= maximum and bottommost < height - keep_bottom:
            for index in component:
                alpha.putpixel((index % width, index // width), 0)
    rgba.putalpha(alpha)
    return rgba


def clean_fox_edge_fringe(image: Image.Image) -> Image.Image:
    """Replace isolated bright matte colors on the silhouette with dark outline."""
    rgba = image.convert("RGBA")
    rgba.putalpha(rgba.getchannel("A").point(lambda value: 255 if value >= 160 else 0))
    pixels = rgba.load()
    width, height = rgba.size
    original = rgba.copy().load()
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = original[x, y]
            if alpha == 0:
                continue
            if not any(0 <= nx < width and 0 <= ny < height and original[nx, ny][3] == 0
                       for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
                continue
            bright_neutral = max(red, green, blue) - min(red, green, blue) < 24 and min(red, green, blue) > 155
            stray_red = red > 120 and green < 28 and blue < 65
            stray_yellow = red > 100 and green > 100 and blue < 24 and abs(red - green) < 32
            if not (bright_neutral or stray_red or stray_yellow):
                continue
            dark_neighbors = []
            for ny in range(max(0, y - 2), min(height, y + 3)):
                for nx in range(max(0, x - 2), min(width, x + 3)):
                    nr, ng, nb, na = original[nx, ny]
                    if na and max(nr, ng, nb) < 105:
                        dark_neighbors.append((nr + ng + nb, nr, ng, nb))
            if dark_neighbors:
                _, nr, ng, nb = min(dark_neighbors)
                pixels[x, y] = (nr, ng, nb, alpha)
    return rgba


def normalize(name: str) -> None:
    source_version = "v3" if name == "fox" else "v2" if name == "condor" else None
    source_name = f"{name}-source-{source_version}.png" if source_version else f"{name}-source.png"
    source = Image.open(SOURCE / source_name)
    sheet = Image.new("RGBA", (FRAME * GRID[0], FRAME * GRID[1]))
    max_width, max_height = LIMITS[name]
    cells = []
    for row in range(GRID[1]):
        for column in range(GRID[0]):
            left = round(column * source.width / GRID[0])
            right = round((column + 1) * source.width / GRID[0])
            top = round(row * source.height / GRID[1])
            bottom = round((row + 1) * source.height / GRID[1])
            cell = source.crop((left, top, right, bottom))
            if name == "fox":
                cell = remove_tiny_specks(cell)
                cell = clean_fox_edge_fringe(cell)
            else:
                cell = remove_preview_background(cell)
            bounds = cell.getbbox()
            if not bounds:
                raise RuntimeError(f"Empty {name} frame at {column}, {row}")
            animal = cell.crop(bounds)
            cells.append((column, row, animal))
    # Preserve body size through each grounded walk cycle instead of stretching
    # every pose to fill the frame. Condor wing spans intentionally vary.
    common_scale = min(min(max_width / animal.width, max_height / animal.height)
                       for _, _, animal in cells)
    for column, row, animal in cells:
        scale = min(max_width / animal.width, max_height / animal.height) if name == "condor" else common_scale
        size = (max(1, round(animal.width * scale)), max(1, round(animal.height * scale)))
        animal = animal.resize(size, Image.Resampling.NEAREST)
        x = column * FRAME + (FRAME - size[0]) // 2
        if name == "condor":
            y = row * FRAME + (FRAME - size[1]) // 2
        else:
            y = row * FRAME + 122 - size[1]
        sheet.alpha_composite(animal, (x, y))
    if name == "fox":
        # A final cleanup at runtime resolution catches detached specks that
        # looked harmless in the large source but became visible after scaling.
        for row in range(GRID[1]):
            for column in range(GRID[0]):
                box = (column * FRAME, row * FRAME, (column + 1) * FRAME, (row + 1) * FRAME)
                tile = sheet.crop(box)
                tile = clean_fox_edge_fringe(remove_tiny_specks(tile, maximum=70, keep_bottom=10))
                sheet.paste(tile, box)
    sheet.save(OUTPUT / f"{name}-sheet.png", optimize=True)


if __name__ == "__main__":
    for animal_name in LIMITS:
        normalize(animal_name)

