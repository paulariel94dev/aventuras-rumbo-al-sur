"""Turn ImageGen's 5x3 character boards into aligned transparent Phaser sheets."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "assets" / "characters" / "source"
OUTPUT = ROOT / "public" / "assets" / "characters"
FRAME_SIZE = (128, 160)
GRID = (5, 3)


def is_background(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    # Image generation may render the transparency preview as a slightly blue
    # checkerboard with compression-like variations. Character colors are either
    # darker or appreciably warmer, so this removes only the connected pale grid.
    return max(pixel) - min(pixel) <= 22 and red + green + blue >= 525


def remove_connected_background(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    if rgba.getchannel("A").getextrema()[0] < 255:
        # ImageGen's new sheets carry real transparency. Keep it intact rather
        # than interpreting transparent RGB pixels as an opaque matte.
        return rgba
    rgb = cell.convert("RGB")
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
        if visited[index] or not is_background(rgb.getpixel((x, y))):
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
    alpha = Image.new("L", (width, height), 255)
    alpha.putdata([0 if value else 255 for value in visited])
    rgba.putalpha(alpha)
    return rgba


def normalize(source_name: str, output_name: str) -> None:
    source = Image.open(SOURCE / source_name)
    cell_width = source.width // GRID[0]
    cell_height = source.height // GRID[1]
    sheet = Image.new("RGBA", (FRAME_SIZE[0] * GRID[0], FRAME_SIZE[1] * GRID[1]))
    frames = []

    for row in range(GRID[1]):
        for column in range(GRID[0]):
            left = column * cell_width
            top = row * cell_height
            cell = source.crop((left, top, left + cell_width, top + cell_height))
            cell = remove_connected_background(cell)
            bounds = cell.getbbox()
            if not bounds:
                raise RuntimeError(f"Empty frame at {column}, {row}")
            frames.append((column, row, cell.crop(bounds)))

    # Keep idle poses steady with one another and all six walk poses steady
    # with one another; expressive actions can use their own framing.
    idle_scale = min(min(104 / frame.width, 146 / frame.height)
                     for column, row, frame in frames if row == 0 and column < 3)
    walk_scale = min(min(104 / frame.width, 146 / frame.height)
                     for column, row, frame in frames if (row == 0 and column >= 3) or row == 1 and column < 4)
    for column, row, character in frames:
        if row == 0 and column < 3:
            scale = idle_scale
        elif (row == 0 and column >= 3) or (row == 1 and column < 4):
            scale = walk_scale
        else:
            scale = min(104 / character.width, 146 / character.height)
        size = (max(1, round(character.width * scale)), max(1, round(character.height * scale)))
        character = character.resize(size, Image.Resampling.NEAREST)
        x = column * FRAME_SIZE[0] + (FRAME_SIZE[0] - size[0]) // 2
        y = row * FRAME_SIZE[1] + 154 - size[1]
        sheet.alpha_composite(character, (x, y))

    sheet.save(OUTPUT / output_name, optimize=True)


if __name__ == "__main__":
    normalize("pablo-sheet-source-v2.png", "pablo-sheet.png")
    normalize("lujan-sheet-source-v2.png", "lujan-sheet.png")
