from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "/vercel/share/v0-project/public/icons"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Brand colors
BRAND_START = (249, 115, 22)   # orange-500
BRAND_END = (234, 88, 12)      # orange-600

SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512]
MASKABLE_SIZES = [192, 512]


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def create_gradient(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(size - 1, 1)
        for x in range(size):
            tx = x / max(size - 1, 1)
            combined_t = (t + tx) / 2
            color = lerp_color(BRAND_START, BRAND_END, combined_t)
            draw.point((x, y), fill=color + (255,))
    return img


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    draw.rounded_rectangle(xy, radius=r, fill=fill)


def generate_icon(size, maskable=False):
    img = create_gradient(size)
    draw = ImageDraw.Draw(img)

    if not maskable:
        # Apply rounded corners by masking
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        radius = int(size * 0.18)
        mask_draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
        img.putalpha(mask)

    # Draw text "RH"
    font_size = int(size * 0.35)
    subtitle_size = int(size * 0.1)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", subtitle_size)
    except (OSError, IOError):
        font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Center "RH"
    bbox = draw.textbbox((0, 0), "RH", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2
    y = (size - th) // 2 - int(subtitle_size * 0.8)
    draw.text((x, y), "RH", fill=(255, 255, 255, 255), font=font)

    # Draw subtitle
    bbox2 = draw.textbbox((0, 0), "RESTROHUB", font=subtitle_font)
    stw = bbox2[2] - bbox2[0]
    sx = (size - stw) // 2
    sy = y + th + int(size * 0.02)
    draw.text((sx, sy), "RESTROHUB", fill=(255, 255, 255, 200), font=subtitle_font)

    suffix = "maskable-" if maskable else ""
    filename = f"icon-{suffix}{size}x{size}.png"
    img.save(os.path.join(OUTPUT_DIR, filename), "PNG")
    print(f"Generated: {filename}")


def generate_favicon(size):
    img = create_gradient(size)
    draw = ImageDraw.Draw(img)

    # Rounded corners
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = max(int(size * 0.18), 2)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    img.putalpha(mask)

    font_size = int(size * 0.6)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), "R", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2
    y = (size - th) // 2
    draw.text((x, y), "R", fill=(255, 255, 255, 255), font=font)

    filename = f"favicon-{size}x{size}.png"
    img.save(os.path.join(OUTPUT_DIR, filename), "PNG")
    print(f"Generated: {filename}")


# Generate standard icons
for s in SIZES:
    generate_icon(s, maskable=False)

# Generate maskable icons
for s in MASKABLE_SIZES:
    generate_icon(s, maskable=True)

# Generate favicons
generate_favicon(32)
generate_favicon(16)

print("\nAll PWA icons generated successfully!")
