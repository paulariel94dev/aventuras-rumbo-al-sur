from PIL import Image, ImageDraw
import random
from pathlib import Path

random.seed(16)
out = Path('public/assets/environment')
out.mkdir(parents=True, exist_ok=True)

def rect(d, box, color):
    d.rectangle(tuple(int(v) for v in box), fill=color)

# Transparent foliage strip: chunky pixel clusters, varied silhouettes, no geometric trees.
w, h = 1536, 360
img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
for x in range(-30, w + 30, 190):
    tree_type = (x // 190) % 3
    trunk_h = random.randint(175, 280)
    trunk_w = random.randint(8, 14)
    base = h - random.randint(8, 30)
    rect(d, (x, base - trunk_h, x + trunk_w, base), (67, 54, 43, 255))
    rect(d, (x + 3, base - trunk_h + 10, x + trunk_w - 2, base - 8), (100, 72, 47, 255))
    crown_y = base - trunk_h - random.randint(12, 35)
    # Three silhouettes echo the background art: rounded lenga, narrow ñire,
    # and a crooked old tree with an offset crown.
    colors = [(24, 55, 55, 255), (30, 76, 61, 255), (47, 100, 61, 255), (83, 126, 58, 255), (153, 139, 54, 255)]
    if tree_type == 0:
        for layer in range(5):
            yy = crown_y + layer * 20 + random.randint(-5, 5)
            span = 70 - layer * 11
            for _ in range(7):
                cx = x + trunk_w // 2 + random.randint(-span, span)
                cy = yy + random.randint(-11, 11)
                rw, rh = random.randint(13, 28), random.randint(12, 24)
                rect(d, (cx-rw, cy-rh, cx+rw, cy+rh), colors[layer])
                if layer > 1 and random.random() < .85: rect(d, (cx-rw//2, cy-rh-4, cx+rw//3, cy-rh+6), colors[min(4, layer+1)])
    elif tree_type == 1:
        for layer in range(6):
            yy = crown_y + layer * 23
            span = 36 + layer * 9
            rect(d, (x + trunk_w//2-span, yy, x + trunk_w//2+span, yy+23), colors[min(3, layer)])
            rect(d, (x + trunk_w//2-span//2, yy-11, x + trunk_w//2+span//3, yy+2), colors[min(3, layer)])
        rect(d, (x-4, crown_y-21, x+trunk_w+11, crown_y+8), colors[0])
    else:
        branch_x = x + random.randint(-18, 20)
        bx0, bx1 = sorted((x + trunk_w//2, branch_x + trunk_w//2 + 8))
        rect(d, (bx0, base-trunk_h+28, bx1, base-trunk_h+40), (91, 62, 43, 255))
        for layer in range(3):
            cx = branch_x + layer * 10
            cy = crown_y + layer * 24
            for _ in range(4):
                rw, rh = random.randint(14, 29), random.randint(12, 23)
                rect(d, (cx-rw, cy-rh, cx+rw, cy+rh), colors[(layer+1) % 4])
                if random.random() < .8: rect(d, (cx-rw//2, cy-rh-3, cx+rw//4, cy-rh+5), (170, 151, 67, 255))
    # Small leaf clusters and warm highlights give the foreground the same
    # hand-pixeled texture as the wide scenic backgrounds.
    for _ in range(42):
        cx = x + trunk_w//2 + random.randint(-86, 86)
        cy = crown_y + random.randint(-8, 145)
        rw, rh = random.randint(4, 12), random.randint(4, 10)
        col = random.choice(colors[1:])
        rect(d, (cx-rw, cy-rh, cx+rw, cy+rh), col)
        if random.random() < .18:
            rect(d, (cx-rw//2, cy-rh, cx+rw//2, cy-rh+4), (218, 145, 55, 255))
# foreground grasses and shrubs
for x in range(0, w, 13):
    y = h - random.randint(18, 44)
    col = random.choice([(38, 91, 57, 255), (55, 112, 57, 255), (106, 132, 54, 255)])
    rect(d, (x, y, x + random.randint(4, 9), h), col)
    if random.random() < .7:
        rect(d, (x - 5, y + 5, x + 13, y + 12), col)
img.save(out / 'foreground-vegetation.png')

# Opaque ground strip with irregular grass edge and layered soil.
w, h = 768, 144
ground = Image.new('RGBA', (w, h), (92, 69, 49, 255))
d = ImageDraw.Draw(ground)
grass = [(47, 104, 59, 255), (71, 125, 63, 255), (119, 139, 61, 255)]
for x in range(0, w, 12):
    top = random.randint(6, 16)
    rect(d, (x, top, x + random.randint(10, 24), 26), random.choice(grass))
    if random.random() < .45:
        rect(d, (x + 2, max(0, top-6), x + 6, top+5), (41, 96, 56, 255))
for y in range(30, h, 18):
    for x in range(random.randint(-15, 5), w, 31):
        col = random.choice([(111, 79, 54, 255), (126, 88, 54, 255), (75, 67, 53, 255), (145, 104, 61, 255)])
        y0 = y + random.randint(-3, 4)
        rect(d, (x, y0, x + random.randint(8, 23), y0 + random.randint(3, 8)), col)
for _ in range(38):
    x = random.randrange(w); y = random.randrange(28, h-8)
    rect(d, (x, y, x + random.randint(3, 8), y + random.randint(2, 5)), random.choice([(45, 55, 48, 255), (165, 122, 68, 255), (68, 82, 55, 255)]))
ground.save(out / 'ground-strip.png')
