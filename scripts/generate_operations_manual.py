from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "TECPOINT_Manual_Operativo_Web_y_CRUD.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

RED = colors.HexColor("#CF1533")
DARK = colors.HexColor("#111817")
INK = colors.HexColor("#16243B")
MUTED = colors.HexColor("#667085")
LINE = colors.HexColor("#E4E7EC")
ICE = colors.HexColor("#F5F7F8")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=RED, spaceAfter=9, tracking=1.5))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=31, leading=33, textColor=DARK, spaceAfter=15))
styles.add(ParagraphStyle(name="CoverBody", fontName="Helvetica", fontSize=11, leading=17, textColor=MUTED))
styles.add(ParagraphStyle(name="H1x", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=DARK, spaceBefore=8, spaceAfter=12))
styles.add(ParagraphStyle(name="H2x", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=INK, spaceBefore=14, spaceAfter=7))
styles.add(ParagraphStyle(name="Bodyx", fontName="Helvetica", fontSize=9.3, leading=14, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", fontName="Helvetica", fontSize=7.8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="Bulletx", fontName="Helvetica", fontSize=9, leading=13, leftIndent=10, firstLineIndent=-7, textColor=INK, spaceAfter=3))
styles.add(ParagraphStyle(name="Calloutx", fontName="Helvetica-Bold", fontSize=9.2, leading=14, textColor=DARK, backColor=colors.HexColor("#FFF1F3"), borderColor=colors.HexColor("#FFD5DB"), borderWidth=0.7, borderPadding=8, spaceBefore=6, spaceAfter=10))
styles.add(ParagraphStyle(name="CodeX", fontName="Courier", fontSize=7.7, leading=11, textColor=DARK, backColor=ICE, borderPadding=7, spaceAfter=8))


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(DARK)
    canvas.rect(0, h - 12 * mm, w, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(17 * mm, h - 7.5 * mm, "TECPOINT")
    canvas.setFillColor(RED)
    canvas.circle(w - 18 * mm, h - 6 * mm, 2.2 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.line(17 * mm, 13 * mm, w - 17 * mm, 13 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(17 * mm, 8.5 * mm, "Manual operativo web y CRUD - Agosto 2026")
    canvas.drawRightString(w - 17 * mm, 8.5 * mm, f"Pagina {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(str(OUT), pagesize=A4, rightMargin=17 * mm, leftMargin=17 * mm, topMargin=21 * mm, bottomMargin=18 * mm, title="TECPOINT - Manual operativo web y CRUD", author="TECPOINT")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates([PageTemplate(id="tecpoint", frames=[frame], onPage=header_footer)])


def p(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def bullets(items):
    return [p(f"- {item}", "Bulletx") for item in items]


story = []
story += [Spacer(1, 24 * mm), p("TECPOINT · ADMINISTRACION DIGITAL", "CoverKicker"), p("Manual operativo<br/>Web y CRUD", "CoverTitle"), p("Guia segura para administrar productos, campañas, ubicaciones, medicion y publicaciones sin comprometer los datos comerciales ni las credenciales.", "CoverBody"), Spacer(1, 10 * mm)]
summary = Table([["TIENDA", "tecpoint.ws"], ["PANEL", "crud-tecpoint.vercel.app"], ["FECHA", "17 de agosto de 2026"]], colWidths=[35 * mm, 110 * mm])
summary.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, -1), RED), ("TEXTCOLOR", (0, 0), (0, -1), colors.white), ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"), ("FONTNAME", (1, 0), (1, -1), "Helvetica"), ("TEXTCOLOR", (1, 0), (1, -1), DARK), ("BACKGROUND", (1, 0), (1, -1), ICE), ("GRID", (0, 0), (-1, -1), 0.5, colors.white), ("PADDING", (0, 0), (-1, -1), 8)]))
story += [summary, Spacer(1, 17 * mm), p("SEGURIDAD PRIMERO", "CoverKicker"), p("Nunca coloque contraseñas, tokens o claves privadas en este PDF, GitHub, mensajes o archivos compartidos. Use el administrador de contraseñas autorizado.", "Calloutx"), PageBreak()]

sections = [
    ("1. Estado validado", ["Tienda y CRUD compilan para produccion.", "Vista movil comprobada a 390 px sin desbordamiento horizontal.", "Busqueda tolerante a tildes, sinonimos y errores frecuentes.", "Tres paneles interactivos en cada producto.", "Sitemap disponible y configuracion privada excluida de Git."]),
    ("2. Salud del catalogo", ["680 fichas registradas", "171 sin imagen principal", "116 sin UPC", "9 sin precio de detalle valido", "41 sin precio de mayoreo valido", "266 sin color"]),
    ("3. Acceso seguro al CRUD", ["Abra https://crud-tecpoint.vercel.app/login.", "Use la cuenta asignada o Google.", "Cuentas autorizadas: administracion@tecpoint.ws, marketing@tecpoint.ws y tecpointdistribucion2@gmail.com.", "Las contrasenas se recuperan desde Firebase; no se guardan en el codigo."]),
    ("4. Flujo de productos", ["Abra Productos > Calidad y duplicados.", "Filtre por faltantes o duplicados.", "Use Corregir para abrir la ficha exacta.", "Complete solo informacion respaldada por empaque, factura, proveedor o archivo maestro.", "No invente SKU, UPC, precio, stock, compatibilidad o especificaciones.", "Las fichas incompletas permanecen fuera del catalogo publico."]),
    ("5. Banners, video y promociones", ["Cargue piezas separadas para escritorio y movil.", "Para video use MP4 H.264, poster, sin audio automatico y enlace comprobado.", "Configure orden, fechas y estado activo.", "Comprima archivos y mantenga textos dentro de zonas seguras.", "Desactive promociones vencidas."]),
    ("6. WhatsApp y ubicaciones", ["Use numeros completos con codigo 504.", "Pegue enlaces oficiales de Google Maps.", "Compruebe ciudad, direccion y horario.", "Pruebe cada boton desde un telefono.", "Mayoreo requiere una foto comprobada de la sede de Los Andes antes de sustituir el patron oficial."]),
]

for title, items in sections:
    story.append(p(title, "H2x"))
    story.extend(bullets(items))

story += [PageBreak(), p("7. Integraciones de medicion", "H1x")]
story += [p("Meta Pixel", "H2x"), p("ID configurado: 328989509304103. Eventos esperados: PageView, ViewContent, Search, AddToCart, InitiateCheckout, Purchase y ViewCategory como evento personalizado.")]
story += bullets(["En Events Manager permita trafico desde tecpoint.ws.", "Use Probar eventos y recorra busqueda, producto, carrito y compra.", "Compruebe que cada evento aparezca una sola vez.", "No active optimizacion de conversiones hasta validar los eventos principales."])
story += [p("Google Analytics 4 y Search Console", "H2x"), p("GA4: G-43E14570X3. Propiedad Search Console: https://tecpoint.ws/.")]
story += bullets(["Revise Realtime despues de publicar.", "Inspeccione la pagina principal y una ficha nueva.", "Confirme que /sitemap.xml figure como procesado.", "Revise Core Web Vitals con datos reales de produccion."])

story += [p("8. Firebase - pasos de propietario", "H1x"), p("Estas acciones requieren acceso a Firebase Console y Vercel.", "Calloutx")]
story += bullets(["Firebase Authentication > Authorized domains: agregue crud-tecpoint.vercel.app y cualquier dominio definitivo.", "Authentication > Sign-in method: habilite Google y seleccione el correo de soporte oficial.", "Confirme que cada cuenta autorizada exista y tenga rol administrativo.", "En Vercel confirme las variables de Firebase Admin. La clave privada debe conservar correctamente sus saltos de linea.", "Nunca copie la clave privada a Git ni a este documento."])

story += [p("9. Publicacion y recuperacion", "H1x"), p("Tienda", "H2x"), p("npm install<br/>npm run lint<br/>npm run build<br/>npm run catalog:audit", "CodeX"), p("CRUD", "H2x"), p("pnpm install<br/>pnpm lint<br/>pnpm build", "CodeX")]
story += bullets(["Revise git status y git diff.", "Haga un commit descriptivo y envie main a GitHub.", "Vercel desplegara el repositorio conectado.", "Pruebe movil, escritorio, login, busqueda, ficha, carrito y panel.", "Si falla, revierta el commit o promueva el ultimo deployment estable; no borre datos."])

story += [PageBreak(), p("10. Prompt operativo", "H1x"), p("Actua como desarrollador senior de TECPOINT. Inspecciona ambos repositorios antes de editar. Conserva logos oficiales y datos comerciales confirmados. No inventes SKU, UPC, precios, stock ni compatibilidades. Mantiene blanco y rojo como colores predominantes y negro como contraste. Corrige primero seguridad, datos, accesibilidad, responsive y rendimiento. Ejecuta lint y build en tienda y CRUD, prueba movil y escritorio, separa validacion local de publicacion y documenta cualquier paso que requiera permisos de propietario. No publiques ni migres dependencias mayores sin revisar el impacto.", "Calloutx")]

checks = ["Compilaciones aprobadas", "Imagenes cargan", "Sin desbordamientos", "Banners responsive", "Busqueda tolerante", "Incompletos ocultos", "Maps y WhatsApp funcionan", "Meta Test Events recibe datos", "GA4 Realtime recibe datos", "Sitemap procesado", "Variables privadas fuera de Git", "Deployment estable"]
data = [["", "CONTROL FINAL"]] + [["[ ]", item] for item in checks]
table = Table(data, colWidths=[12 * mm, 145 * mm], repeatRows=1)
table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), DARK), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("PADDING", (0, 0), (-1, -1), 6), ("TEXTCOLOR", (0, 1), (0, -1), RED), ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold")]))
story += [Spacer(1, 5 * mm), table]

doc.build(story)
print(OUT)
