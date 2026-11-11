from pathlib import Path
from io import BytesIO
import sys

import pdfplumber
from PIL import Image, ImageChops


ROWS = {
    0: [
        (124.2, "FN-40101"),
        (240.6, "FN-40102"),
        (357.0, "FN-40103"),
        (473.4, "FN-40104"),
        (589.8, "FN-40105"),
    ],
    1: [
        (27.0, "FN-40106"),
        (143.4, "FN-40107"),
        (259.8, "FN-40108"),
    ],
}


def decoded_image(entry):
    width, height = entry["srcsize"]
    data = entry["stream"].get_data()
    image_filter = str(entry["stream"].attrs.get("Filter", ""))
    if "DCTDecode" in image_filter or "JPXDecode" in image_filter:
        return Image.open(BytesIO(data)).convert("RGB")
    mode = "RGB" if len(data) == width * height * 3 else "L"
    image = Image.frombytes(mode, (width, height), data)
    return image.convert("RGB")


def image_area(entry):
    width, height = entry["srcsize"]
    return width * height


def save_square(image, destination):
    side = 700
    channels = [
        channel.point(lambda value: 255 if value < 235 else 0)
        for channel in image.split()
    ]
    foreground = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
    bounds = foreground.getbbox()
    if bounds:
        image = image.crop(bounds)
    image.thumbnail((side * 84 // 100, side * 84 // 100), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (side, side), "white")
    canvas.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
    canvas.save(destination, "WEBP", quality=90, method=6)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Uso: extract-foneng-pdf-images.py <entrada.pdf> <directorio-salida>")
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)

    generated = []
    with pdfplumber.open(source) as pdf:
        for page_index, rows in ROWS.items():
            images = pdf.pages[page_index].images
            for top, sku in rows:
                candidates = [entry for entry in images if abs(float(entry["top"]) - top) < 8]
                primary = max((entry for entry in candidates if float(entry["x0"]) < 180), key=image_area)
                secondary = max((entry for entry in candidates if float(entry["x0"]) >= 180), key=image_area)
                for suffix, entry in (("", primary), ("-02", secondary)):
                    destination = output / f"{sku}{suffix}.webp"
                    save_square(decoded_image(entry), destination)
                    generated.append(destination)

    print(f"Imágenes generadas: {len(generated)}")
    for item in generated:
        print(item)


if __name__ == "__main__":
    main()
