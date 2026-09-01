import json
from pathlib import Path
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Marketing Tecpoint\Downloads\items eliezer w35.xlsx")
OUTPUT = ROOT / "output" / "pdf" / "auditoria-productos-w35-precios-stock.pdf"
IMAGES = ROOT / "src" / "data" / "approved-product-images.json"

df = pd.read_excel(SOURCE, dtype={"SKU": str, "UPC": str}).fillna("")
image_map = json.loads(IMAGES.read_text(encoding="utf-8"))

def num(value):
    try: return float(value)
    except: return 0.0

rows = []
for _, item in df.iterrows():
    sku = str(item.get("SKU", "")).strip()
    upc = str(item.get("UPC", "")).replace(".0", "").strip()
    name = " ".join(str(item.get("Descripcion", "")).split())
    stock = int(num(item.get("Existencia")))
    detail = num(item.get("Precio Detalle"))
    wholesale = num(item.get("Precio Bronce"))
    issues = []
    if not sku: issues.append("Sin SKU")
    if not upc: issues.append("Sin UPC")
    if not name: issues.append("Sin nombre")
    if detail <= 0: issues.append("Sin precio detalle")
    if wholesale <= 0: issues.append("Sin precio mayoreo")
    if sku not in image_map: issues.append("Sin imagen")
    rows.append(dict(sku=sku, name=name, stock=stock, detail=detail, wholesale=wholesale, issues=issues))

in_stock = [r for r in rows if r["stock"] > 0]
complete = [r for r in in_stock if not r["issues"]]
incomplete = [r for r in rows if r["issues"]]
out = [r for r in rows if r["stock"] <= 0]
low = [r for r in in_stock if r["stock"] <= 5]

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
title = ParagraphStyle("TitleX", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=27, textColor=colors.HexColor("#111817"))
sub = ParagraphStyle("SubX", parent=styles["BodyText"], fontSize=9, leading=13, textColor=colors.HexColor("#596365"))
cell = ParagraphStyle("CellX", parent=styles["BodyText"], fontSize=6.4, leading=8)
head = ParagraphStyle("HeadX", parent=cell, fontName="Helvetica-Bold", textColor=colors.white, alignment=TA_CENTER)

def money(v): return f"L {v:,.2f}"
def table_for(items):
    data = [[Paragraph(x, head) for x in ["SKU", "Producto", "Stock", "Detalle", "Mayoreo", "Estado"]]]
    for r in items:
        status = "Agotado" if r["stock"] <= 0 else ("Ultimas piezas" if r["stock"] <= 5 else "Disponible")
        if r["issues"]: status += " | " + ", ".join(r["issues"])
        data.append([
            Paragraph(r["sku"], cell), Paragraph(r["name"][:120], cell), Paragraph(str(r["stock"]), cell),
            Paragraph(money(r["detail"]), cell), Paragraph(money(r["wholesale"]), cell), Paragraph(status, cell)
        ])
    table = Table(data, colWidths=[58, 330, 42, 70, 70, 150], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#c8102e")), ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("GRID", (0,0), (-1,-1), .25, colors.HexColor("#d8dddf")), ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f5f7f8")]),
        ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5), ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return table

def footer(canvas, doc):
    canvas.saveState(); canvas.setFont("Helvetica", 7); canvas.setFillColor(colors.HexColor("#687274"))
    canvas.drawString(30, 18, "TECPOINT - Fuente: items eliezer w35.xlsx")
    canvas.drawRightString(landscape(A4)[0]-30, 18, f"Pagina {doc.page}"); canvas.restoreState()

story = [Paragraph("Auditoria W35: precios, stock e imagenes", title), Spacer(1,8), Paragraph("Comparacion operativa para detalle y mayoreo. Los precios corresponden exactamente a Precio Detalle y Precio Bronce del Excel W35.", sub), Spacer(1,16)]
summary = [["Productos", len(rows)], ["Con stock", len(in_stock)], ["Agotados", len(out)], ["Ultimas piezas (1-5)", len(low)], ["Completos con imagen", len(complete)], ["Con faltantes", len(incomplete)]]
t = Table(summary, colWidths=[160,80]); t.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),colors.HexColor("#111817")),("TEXTCOLOR",(0,0),(0,-1),colors.white),("FONTNAME",(0,0),(-1,-1),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),.3,colors.HexColor("#cbd1d3")),("PADDING",(0,0),(-1,-1),8)])); story += [t]
sections = [("Productos completos con stock", complete), ("Productos incompletos o sin imagen", incomplete), ("Productos agotados", out)]
for name, items in sections:
    story += [PageBreak(), Paragraph(f"{name} ({len(items)})", title), Spacer(1,10), table_for(items)]

doc = SimpleDocTemplate(str(OUTPUT), pagesize=landscape(A4), rightMargin=28, leftMargin=28, topMargin=32, bottomMargin=30, title="Auditoria de productos W35")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(json.dumps({"output": str(OUTPUT), "total": len(rows), "complete": len(complete), "incomplete": len(incomplete), "outOfStock": len(out), "lowStock": len(low)}, ensure_ascii=False))
