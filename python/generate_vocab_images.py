from openai import OpenAI
import openai
try:
    from google import genai as google_genai
except Exception:
    google_genai = None
import json, os, requests, base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

# ========== CẤU HÌNH ==========
API_KEY = os.environ.get("OPENAI_API_KEY")
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_JSON = os.path.join(SCRIPT_DIR, "vocab.json")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output_images")
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"  # đổi nếu dùng Windows/Linux
IMAGE_SIZE = "1024x1024"
BACKEND = os.environ.get("IMAGE_BACKEND", "sd")  # sd | openai | gemini | auto
SD_BASE_URL = os.environ.get("IMAGE_API_URL", "http://127.0.0.1:7860")  # AUTOMATIC1111 default

# ===============================

# Fallback: allow local key file for offline/local runs (no env needed)
if not API_KEY:
    key_file = os.path.join(SCRIPT_DIR, "openai.key")
    if os.path.exists(key_file):
        with open(key_file, "r", encoding="utf-8") as kf:
            API_KEY = kf.read().strip()

if not GEMINI_API_KEY:
    gkey_file = os.path.join(SCRIPT_DIR, "gemini.key")
    if os.path.exists(gkey_file):
        with open(gkey_file, "r", encoding="utf-8") as gf:
            GEMINI_API_KEY = gf.read().strip()

# Only require key if we will call OpenAI
client = None
if API_KEY:
    client = OpenAI(api_key=API_KEY)
genai_client = None
if GEMINI_API_KEY and google_genai is not None:
    try:
        genai_client = google_genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        genai_client = None
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Utils
def _get_fonts():
    try:
        font_large = ImageFont.truetype(FONT_PATH, 60)
        font_small = ImageFont.truetype(FONT_PATH, 40)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    return font_large, font_small

def _parse_size(size_str):
    try:
        w, h = size_str.lower().split("x")
        return int(w), int(h)
    except Exception:
        return 1024, 1024

def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> str:
    if not text:
        return ""
    words = text.split()
    lines, line = [], ""
    for w in words:
        t = (line + " " + w).strip()
        if draw.textlength(t, font=font) <= max_width:
            line = t
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return "\n".join(lines)

def _rounded_rectangle(draw: ImageDraw.ImageDraw, xy, radius: int, fill, outline=None, width: int = 1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def _fit_cover(img: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    tw, th = target_size
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    new = img.resize((int(iw * scale), int(ih * scale)), Image.LANCZOS)
    left = (new.width - tw) // 2
    top = (new.height - th) // 2
    return new.crop((left, top, left + tw, top + th))

def _mask_round_corners(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size[0], size[1]], radius=radius, fill=255)
    return mask

def render_flashcard(base_img: Image.Image, word: str, kanji: str, meaning: str, example: str) -> Image.Image:
    card_w, card_h = 1280, 960
    card = Image.new("RGB", (card_w, card_h), (240, 250, 255))
    draw = ImageDraw.Draw(card)
    # Header
    header_h = 90
    _rounded_rectangle(draw, (0, 0, card_w, header_h), radius=0, fill=(27, 160, 187))
    title_font = ImageFont.truetype(FONT_PATH, 42) if os.path.exists(FONT_PATH) else ImageFont.load_default()
    header_text = "Anime Style  Nihongo Memory Stories"
    draw.text((30, 24), header_text, fill="white", font=title_font)

    # Main image (rounded)
    img_w, img_h = 900, 520
    img_x = (card_w - img_w) // 2
    img_y = 120
    img = _fit_cover(base_img.convert("RGB"), (img_w, img_h))
    mask = _mask_round_corners((img_w, img_h), radius=40)
    card.paste(img, (img_x, img_y), mask)

    # Title box
    box_w, box_h = 1080, 230
    box_x = (card_w - box_w) // 2
    box_y = img_y + img_h + 20
    _rounded_rectangle(draw, (box_x, box_y, box_x + box_w, box_y + box_h), radius=36, fill=(213, 224, 255))

    # Text inside title box
    word_font = ImageFont.truetype(FONT_PATH, 70) if os.path.exists(FONT_PATH) else ImageFont.load_default()
    meaning_font = ImageFont.truetype(FONT_PATH, 48) if os.path.exists(FONT_PATH) else ImageFont.load_default()
    example_font = ImageFont.truetype(FONT_PATH, 36) if os.path.exists(FONT_PATH) else ImageFont.load_default()

    top_y = box_y + 26
    # Kana + Kanji
    kana_text = word.strip()
    kanji_text = f" ({kanji})" if kanji else ""
    draw.text((box_x + 40, top_y), kana_text, fill=(7, 130, 60), font=word_font)
    kana_w = draw.textlength(kana_text, font=word_font)
    draw.text((box_x + 40 + kana_w, top_y), kanji_text, fill=(170, 40, 40), font=word_font)
    # Meaning centered-ish below
    draw.text((box_x + 40, top_y + 82), meaning, fill=(0, 0, 0), font=meaning_font)

    # Bottom example line
    example_area_w = box_w - 80
    wrapped = _wrap_text(draw, example, example_font, example_area_w)
    draw.multiline_text((box_x + 40, top_y + 140), wrapped, fill=(60, 60, 60), font=example_font, spacing=6)

    return card

def create_placeholder_flashcard(word, kanji, meaning, example):
    width, height = _parse_size(IMAGE_SIZE)
    img = Image.new("RGB", (width, height), color="white")
    draw = ImageDraw.Draw(img)
    font_large, font_small = _get_fonts()

    overlay_height = 200
    draw.rectangle(
        [(0, height - overlay_height), (width, height)],
        fill=(240, 240, 240)
    )

    y = height - overlay_height + 20
    draw.text((40, y), f"{word} ({kanji})", fill="black", font=font_large)
    y += 70
    draw.text((40, y), f"{meaning}", fill="black", font=font_small)
    y += 50
    draw.text((40, y), f"{example}", fill="gray", font=font_small)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{word}_flashcard.png")
    img.save(output_path)
    print(f"📝 Placeholder saved: {output_path}")

def generate_local_background(width: int, height: int) -> Image.Image:
    # Nice gradient background with decorative circles
    img = Image.new("RGB", (width, height), (245, 248, 255))
    draw = ImageDraw.Draw(img)
    top = (173, 216, 230)
    bottom = (240, 248, 255)
    for y in range(height):
        r = int(top[0] + (bottom[0]-top[0]) * y / max(1, height-1))
        g = int(top[1] + (bottom[1]-top[1]) * y / max(1, height-1))
        b = int(top[2] + (bottom[2]-top[2]) * y / max(1, height-1))
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    # Decorative translucent circles
    for cx, cy, rad, col in [
        (int(width*0.2), int(height*0.3), 160, (255,255,255,90)),
        (int(width*0.8), int(height*0.25), 120, (255,255,255,70)),
        (int(width*0.6), int(height*0.6), 200, (255,255,255,60)),
    ]:
        ov = Image.new("RGBA", (width, height), (0,0,0,0))
        d2 = ImageDraw.Draw(ov)
        d2.ellipse([(cx-rad, cy-rad), (cx+rad, cy+rad)], fill=col)
        img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
    return img

def generate_with_sd(prompt: str, size_str: str) -> Image.Image:
    width, height = _parse_size(size_str)
    payload = {
        "prompt": prompt.strip(),
        "width": width,
        "height": height,
        "steps": 25,
        "cfg_scale": 7,
        "sampler_name": "Euler a",
    }
    url = f"{SD_BASE_URL.rstrip('/')}/sdapi/v1/txt2img"
    resp = requests.post(url, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("images"):
        raise RuntimeError("SD API returned no images")
    b64_img = data["images"][0]
    binary = base64.b64decode(b64_img.split(",")[-1])
    return Image.open(BytesIO(binary))

def generate_with_gemini(prompt: str, size_str: str) -> Image.Image:
    if not GEMINI_API_KEY or google_genai is None:
        raise RuntimeError("Gemini client not available or missing GOOGLE_API_KEY")
    model_name = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
    try:
        # Ensure client is configured with the key
        client = google_genai.Client(api_key=GEMINI_API_KEY)
        resp = client.models.generate_content(
            model=model_name,
            contents=[prompt.strip()],
        )
        # Parse parts for inline_data
        candidates = getattr(resp, "candidates", []) or []
        for cand in candidates:
            content = getattr(cand, "content", None)
            parts = getattr(content, "parts", []) if content else []
            for part in parts:
                inline = getattr(part, "inline_data", None) or getattr(part, "inlineData", None)
                if inline and getattr(inline, "data", None):
                    binary = base64.b64decode(inline.data)
                    return Image.open(BytesIO(binary))
        raise RuntimeError("Gemini returned no inline image data")
    except Exception as e:
        raise RuntimeError(f"Gemini image generation failed: {e}")

# Đọc danh sách từ vựng
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    vocab_list = json.load(f)

# Sinh ảnh + tải + chèn chữ
for v in vocab_list:
    word = v["word"]
    kanji = v.get("kanji", "")
    meaning = v.get("meaning", "")
    example = v.get("example", "")

    # prompt tạo ảnh anime
    prompt = f"""
    Anime style educational flashcard for Japanese learners.
    The word is '{word}' ({kanji}), meaning '{meaning}'.
    Scene: {example}
    Make it in anime classroom or daily life style, soft color, clear emotion, suitable for studying.
    """

    print(f"🖼️ Generating: {word} ({kanji}) ...")

    # chọn backend
    img = None
    if BACKEND in ("sd", "auto"):
        try:
            img = generate_with_sd(prompt, IMAGE_SIZE)
            print("🧪 SD image generated locally.")
        except Exception as e:
            if BACKEND == "sd":
                print(f"⚠️ SD backend failed: {e}")
            else:
                print(f"ℹ️ SD failed in auto mode, trying OpenAI: {e}")

    if img is None and BACKEND in ("gemini", "auto") and genai_client is not None:
        try:
            img = generate_with_gemini(prompt, IMAGE_SIZE)
            print("✨ Gemini image generated.")
        except Exception as e:
            if BACKEND == "gemini":
                print(f"⚠️ Gemini backend failed: {e}")
            else:
                print(f"ℹ️ Gemini failed in auto mode, trying OpenAI: {e}")

    if img is None and BACKEND in ("openai", "auto") and client is not None:
        try:
            result = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size=IMAGE_SIZE
            )
            image_url = result.data[0].url
            img_data = requests.get(image_url).content
            img = Image.open(BytesIO(img_data))
            print("☁️ OpenAI image generated.")
        except openai.BadRequestError as e:
            message = str(e)
            if "Billing hard limit has been reached" in message or getattr(e, "code", None) == "billing_hard_limit_reached":
                print("❌ Billing hard limit has been reached. Creating placeholder instead.")
                create_placeholder_flashcard(word, kanji, meaning, example)
                continue
            raise

    if img is None:
        # Create a local decorative background as "image"
        w, h = _parse_size(IMAGE_SIZE)
        img = generate_local_background(w, h)
        print("🎨 Used local background (no API).")

    # render card kiểu mẫu
    card = render_flashcard(img, word, kanji, meaning, example)
    # Lưu ảnh cuối cùng
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{word}_flashcard.png")
    card.save(output_path)
    print(f"✅ Saved: {output_path}")

print("\n🎉 Hoàn tất! Tất cả ảnh đã được lưu trong thư mục 'output_images'.")
