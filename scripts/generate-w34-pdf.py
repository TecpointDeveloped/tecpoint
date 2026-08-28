import json
import hashlib
from pathlib import Path

from PIL import Image as PillowImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, LongTable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "TECPOINT_Catalogo_W34_Productos_Cargados.pdf"
THUMBNAILS = ROOT / "tmp" / "pdfs" / "w34-thumbnails"

inventory_file = json.loads((ROOT / "src" / "data" / "current-catalog-w34.json").read_text(encoding="utf-8"))
image_map = json.loads((ROOT / "src" / "data" / "approved-product-images.json").read_text(encoding="utf-8"))
inventory = {str(row["sku"]).strip(): row for row in inventory_file["records"]}
products = [inventory[sku] for sku in sorted(image_map) if sku in inventory]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
THUMBNAILS.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
small = ParagraphStyle("small", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.3, leading=9.2, textColor=colors.HexColor("#263033"))
tiny = ParagraphStyle("tiny", parent=small, fontSize=6.5, leading=8)
header = ParagraphStyle("header", parent=small, fontName="Helvetica-Bold", textColor=colors.white, alignment=TA_CENTER)


def money(value):
    return f"L {float(value or 0):,.2f}"


def image_for(sku):
    image_path = ROOT / "public" / image_map[sku].lstrip("/")
    thumbnail_path = THUMBNAILS / f"{hashlib.sha1(sku.encode('utf-8')).hexdigest()}.jpg"
    if not thumbnail_path.exists():
        with PillowImage.open(image_path) as source:
            source = source.convert("RGB")
            source.thumbnail((220, 220))
            canvas = PillowImage.new("RGB", (220, 220), "white")
            canvas.paste(source, ((220 - source.width) // 2, (220 - source.height) // 2))
            canvas.save(thumbnail_path, "JPEG", quality=74, optimize=True)
    return Image(str(thumbnail_path), width=22 * mm, height=22 * mm, kind="proportional")


def footer(canvas, document):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D8DEE0"))
    canvas.line(15 * mm, 10 * mm, landscape(letter)[0] - 15 * mm, 10 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#667174"))
    canvas.drawString(15 * mm, 6 * mm, "TECPOINT - Catalogo W34 validado")
    canvas.drawRightString(landscape(letter)[0] - 15 * mm, 6 * mm, f"Pagina {document.page}")
    canvas.restoreState()


doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=landscape(letter),
    rightMargin=15 * mm,
    leftMargin=15 * mm,
    topMargin=14 * mm,
    bottomMargin=15 * mm,
    title="TECPOINT - Productos W34 cargados al CRUD",
    author="TECPOINT",
)

story = [
    Spacer(1, 24 * mm),
    Paragraph("TECPOINT", ParagraphStyle("brand", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=54, leading=56, textColor=colors.HexColor("#111817"))),
    Spacer(1, 5 * mm),
    Paragraph("Productos W34 cargados al CRUD", ParagraphStyle("subtitle", parent=styles["Heading1"], fontName="Helvetica", fontSize=25, leading=30, textColor=colors.HexColor("#C8102E"))),
    Spacer(1, 10 * mm),
    Paragraph(f"Detalle de {len(products)} productos verificados con imagen exacta, SKU, UPC, existencia y precios registrados en la fuente W34.", ParagraphStyle("intro", parent=styles["BodyText"], fontSize=12, leading=18, textColor=colors.HexColor("#465154"))),
    Spacer(1, 5 * mm),
    Paragraph("Los precios y existencias corresponden al archivo W34 utilizado para la migracion. La fecha de ingreso permanece interna y no se muestra al cliente.", ParagraphStyle("note", parent=styles["BodyText"], fontSize=9, leading=14, textColor=colors.HexColor("#667174"))),
    PageBreak(),
]

rows = [[Paragraph("Imagen", header), Paragraph("Producto", header), Paragraph("SKU / UPC", header), Paragraph("Clasificacion", header), Paragraph("Precios", header), Paragraph("Stock", header)]]
for product in products:
    sku = str(product["sku"]).strip()
    rows.append([
        image_for(sku),
        Paragraph(str(product.get("description") or ""), small),
        Paragraph(f"<b>{sku}</b><br/>{product.get('upc') or ''}", tiny),
        Paragraph(f"<b>{product.get('brand') or ''}</b><br/>{product.get('category') or ''}<br/>{product.get('subcategory') or ''}", tiny),
        Paragraph(f"<b>Detalle:</b> {money(product.get('detailPrice'))}<br/><b>Mayoreo:</b> {money(product.get('bronzePrice'))}", tiny),
        Paragraph(str(product.get("stock") or 0), ParagraphStyle("stock", parent=small, alignment=TA_CENTER, fontName="Helvetica-Bold")),
    ])

table = LongTable(rows, repeatRows=1, colWidths=[28 * mm, 81 * mm, 34 * mm, 55 * mm, 40 * mm, 18 * mm], rowHeights=[10 * mm] + [28 * mm] * len(products))
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111817")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D8DEE0")),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F7F8")]),
    ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.append(table)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
