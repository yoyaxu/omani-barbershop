#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Report: Investigación de Precios - Sitio Web para Barbería en República Dominicana
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('LiberationSerif', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSerif-Bold', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('LiberationSerif', normal='LiberationSerif', bold='LiberationSerif-Bold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('DejaVuMono', normal='DejaVuMono', bold='DejaVuMono')

# ── Color Palette ──
ACCENT       = colors.HexColor('#4721b7')
TEXT_PRIMARY  = colors.HexColor('#1e1d1b')
TEXT_MUTED    = colors.HexColor('#918d85')
BG_SURFACE   = colors.HexColor('#e3e0d9')
BG_PAGE      = colors.HexColor('#eeede9')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 1.0 * inch
BOTTOM_MARGIN = 1.0 * inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ── Styles ──
body_style = ParagraphStyle(
    name='Body', fontName='LiberationSerif', fontSize=11,
    leading=18, alignment=TA_JUSTIFY, spaceAfter=8,
    textColor=TEXT_PRIMARY
)
body_left_style = ParagraphStyle(
    name='BodyLeft', fontName='LiberationSerif', fontSize=11,
    leading=18, alignment=TA_LEFT, spaceAfter=8,
    textColor=TEXT_PRIMARY
)
h1_style = ParagraphStyle(
    name='H1', fontName='LiberationSerif', fontSize=20,
    leading=28, alignment=TA_LEFT, spaceBefore=18, spaceAfter=12,
    textColor=ACCENT
)
h2_style = ParagraphStyle(
    name='H2', fontName='LiberationSerif', fontSize=15,
    leading=22, alignment=TA_LEFT, spaceBefore=14, spaceAfter=8,
    textColor=ACCENT
)
h3_style = ParagraphStyle(
    name='H3', fontName='LiberationSerif', fontSize=12,
    leading=18, alignment=TA_LEFT, spaceBefore=10, spaceAfter=6,
    textColor=TEXT_PRIMARY
)
header_cell_style = ParagraphStyle(
    name='HeaderCell', fontName='LiberationSerif', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=TABLE_HEADER_TEXT
)
cell_style = ParagraphStyle(
    name='Cell', fontName='LiberationSerif', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=TEXT_PRIMARY
)
cell_left_style = ParagraphStyle(
    name='CellLeft', fontName='LiberationSerif', fontSize=10,
    leading=14, alignment=TA_LEFT, textColor=TEXT_PRIMARY
)
caption_style = ParagraphStyle(
    name='Caption', fontName='LiberationSerif', fontSize=9,
    leading=13, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceBefore=3, spaceAfter=6
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='LiberationSerif', fontSize=11,
    leading=18, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=24, bulletIndent=12,
    textColor=TEXT_PRIMARY
)
callout_style = ParagraphStyle(
    name='Callout', fontName='LiberationSerif', fontSize=11,
    leading=18, alignment=TA_LEFT, spaceAfter=8,
    leftIndent=18, borderPadding=8,
    borderColor=ACCENT, borderWidth=2, borderPaddingLeft=12,
    textColor=TEXT_PRIMARY
)
muted_style = ParagraphStyle(
    name='Muted', fontName='LiberationSerif', fontSize=10,
    leading=15, alignment=TA_LEFT, spaceAfter=6,
    textColor=TEXT_MUTED
)

OUTPUT_PATH = '/home/z/my-project/download/investigacion_precio_web_barberia_rd.pdf'
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='Investigacion de Precios - Sitio Web para Barberia en Republica Dominicana',
    author='Z.ai',
    creator='Z.ai'
)

story = []

# ══════════════════════════════════════════
# COVER SECTION (inline, no separate file)
# ══════════════════════════════════════════
story.append(Spacer(1, 100))

cover_title_style = ParagraphStyle(
    name='CoverTitle', fontName='LiberationSerif', fontSize=32,
    leading=42, alignment=TA_CENTER, textColor=ACCENT,
    spaceAfter=20
)
cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle', fontName='LiberationSerif', fontSize=16,
    leading=24, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceAfter=12
)
cover_meta_style = ParagraphStyle(
    name='CoverMeta', fontName='LiberationSerif', fontSize=12,
    leading=18, alignment=TA_CENTER, textColor=TEXT_MUTED
)

story.append(Paragraph(
    '<b>Investigacion de Precios</b>',
    cover_title_style
))
story.append(Spacer(1, 12))
story.append(Paragraph(
    'Sitio Web para Barberia en<br/>Republica Dominicana',
    ParagraphStyle(
        name='CoverTitle2', fontName='LiberationSerif', fontSize=24,
        leading=32, alignment=TA_CENTER, textColor=TEXT_PRIMARY,
        spaceAfter=24
    )
))
story.append(Spacer(1, 24))
story.append(Paragraph(
    'Analisis comparativo del mercado de desarrollo web<br/>'
    'para el proyecto Omani Barbershop',
    cover_subtitle_style
))
story.append(Spacer(1, 36))
story.append(Paragraph(
    'Fecha: Mayo 2026',
    cover_meta_style
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Preparado por: Z.ai',
    cover_meta_style
))

story.append(PageBreak())

# ══════════════════════════════════════════
# 1. RESUMEN EJECUTIVO
# ══════════════════════════════════════════
story.append(Paragraph('<b>1. Resumen Ejecutivo</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'Este informe presenta una investigacion detallada sobre los precios de desarrollo web en '
    'Republica Dominicana, especificamente orientado a un sitio web para barberia con funcionalidades '
    'de reserva de citas, integracion con WhatsApp, galeria de fotos y panel administrativo. Se '
    'consultaron multiples fuentes incluyendo agencias de desarrollo web dominicanas, foros de '
    'discusion, y plataformas de servicios digitales para obtener un panorama completo y actualizado '
    'del mercado local.',
    body_style
))
story.append(Paragraph(
    'El proyecto Omani Barbershop incluye las siguientes funcionalidades ya implementadas: pagina '
    'principal con secciones de Hero, Servicios, Galeria y Contacto; sistema de reserva de citas '
    'con verificacion de disponibilidad en tiempo real; boton flotante de WhatsApp integrado; galeria '
    'de fotos con enlace a Instagram; panel administrativo protegido con autenticacion JWT; gestion '
    'completa de citas (crear, editar, eliminar, cambiar estado); y cambio de contrasena desde el '
    'panel admin. El stack tecnologico utilizado es Next.js con TypeScript, Tailwind CSS, Prisma ORM '
    'con SQLite, y despliegue en Vercel.',
    body_style
))
story.append(Paragraph(
    'Basado en la investigacion realizada, el costo promedio de un sitio web con estas caracteristicas '
    'en Republica Dominicana oscila entre <b>RD$25,000 y RD$65,000</b> (aproximadamente '
    '<b>USD $400 - $1,100</b>), dependiendo de la agencia, el nivel de personalizacion y las '
    'funcionalidades adicionales. Este rango cubre desde opciones basicas con plantillas hasta '
    'desarrollos a medida con funcionalidades avanzadas.',
    body_style
))

# ══════════════════════════════════════════
# 2. PRECIOS POR TIPO DE SITIO WEB EN RD
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>2. Precios por Tipo de Sitio Web en Republica Dominicana</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'El mercado de desarrollo web en Republica Dominicana ofrece una amplia gama de precios segun '
    'el tipo de proyecto, la complejidad de las funcionalidades y el nivel de personalizacion '
    'requerido. A continuacion se presenta un resumen de los rangos de precios tipicos basados en '
    'datos recopilados de agencias locales y plataformas digitales en 2025-2026. Es importante '
    'destacar que estos precios reflejan el mercado dominicano, que es significativamente mas '
    'accesible que el mercado estadounidense o europeo, pero que tambien varia considerablemente '
    'entre agencias establecidas y freelancers independientes.',
    body_style
))

# Price range table
price_data = [
    [Paragraph('<b>Tipo de Sitio Web</b>', header_cell_style),
     Paragraph('<b>Rango de Precio (RD$)</b>', header_cell_style),
     Paragraph('<b>Rango USD</b>', header_cell_style),
     Paragraph('<b>Descripcion</b>', header_cell_style)],
    [Paragraph('Landing Page / Sitio Basico', cell_left_style),
     Paragraph('RD$15,000 - 25,000', cell_style),
     Paragraph('$250 - $420', cell_style),
     Paragraph('1-3 paginas, informativo, sin funcionalidades interactivas', cell_left_style)],
    [Paragraph('Sitio Web Corporativo', cell_left_style),
     Paragraph('RD$25,000 - 45,000', cell_style),
     Paragraph('$420 - $750', cell_style),
     Paragraph('5-10 paginas, formularios de contacto, diseno personalizado', cell_left_style)],
    [Paragraph('Sitio con Funcionalidades<br/>Interactivas', cell_left_style),
     Paragraph('RD$32,500 - 65,000', cell_style),
     Paragraph('$540 - $1,100', cell_style),
     Paragraph('Reservas, galeria, integracion WhatsApp, panel admin', cell_left_style)],
    [Paragraph('Tienda Online (E-commerce)', cell_left_style),
     Paragraph('RD$65,000 - 150,000', cell_style),
     Paragraph('$1,100 - $2,500', cell_style),
     Paragraph('Catalogo, carrito, pasarelas de pago, gestion de inventario', cell_left_style)],
    [Paragraph('Desarrollo a Medida / App Web', cell_left_style),
     Paragraph('RD$100,000+', cell_style),
     Paragraph('$1,700+', cell_style),
     Paragraph('Sistemas personalizados, integraciones complejas, API propia', cell_left_style)],
]

col_widths = [0.25 * CONTENT_W, 0.22 * CONTENT_W, 0.17 * CONTENT_W, 0.36 * CONTENT_W]
price_table = Table(price_data, colWidths=col_widths, hAlign='CENTER')
price_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 18))
story.append(price_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 1: Rangos de precios por tipo de sitio web en Republica Dominicana (2025-2026). '
    'Precios basados en cotizaciones de agencias locales. Tipo de cambio aproximado: 1 USD = 60 RD$.',
    caption_style
))
story.append(Spacer(1, 18))

story.append(Paragraph(
    'Como se puede observar en la tabla anterior, el proyecto Omani Barbershop encaja en la categoria '
    'de "Sitio con Funcionalidades Interactivas", ya que incluye sistema de reservas con verificacion '
    'de disponibilidad en tiempo real, integracion directa con WhatsApp para contacto inmediato, '
    'galeria de fotos vinculada a Instagram, y un panel administrativo completo con autenticacion '
    'segura mediante JWT. Estas funcionalidades van mas alla de un sitio web corporativo estandar '
    'y requieren un desarrollo mas complejo y personalizado.',
    body_style
))

# ══════════════════════════════════════════
# 3. COMPARATIVA DE AGENCIAS
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>3. Comparativa de Agencias y Proveedores en RD</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'Se investigaron las principales agencias de desarrollo web en Republica Dominicana para '
    'obtener informacion sobre sus precios y servicios. A continuacion se presenta un analisis '
    'detallado de cada una de las fuentes consultadas, incluyendo los precios publicados en sus '
    'sitios web oficiales y la informacion obtenida de sus paginas de servicios.',
    body_style
))

# 3.1 WebStore Dominicana
story.append(Paragraph('<b>3.1 WebStore Dominicana (webstore.do)</b>', h2_style))
story.append(Paragraph(
    'WebStore Dominicana es una de las agencias mas establecidas en el pais, con mas de 12 anos '
    'de experiencia en el mercado. Su portfolio incluye proyectos para empresas como Intelca, '
    'Tecmep, The Designer Shop, y otras instituciones dominicanas. Ofrecen un proceso de trabajo '
    'estructurado que incluye analisis del negocio, diseno enfocado en experiencia de usuario, '
    'desarrollo con optimizacion SEO, y capacitacion para gestion del sitio.',
    body_style
))

ws_data = [
    [Paragraph('<b>Servicio</b>', header_cell_style),
     Paragraph('<b>Precio Desde</b>', header_cell_style),
     Paragraph('<b>Incluye</b>', header_cell_style)],
    [Paragraph('Sitio Web Corporativo', cell_left_style),
     Paragraph('RD$ 32,500', cell_style),
     Paragraph('Diseno personalizado y responsive, estructura orientada a conversion, SEO basico, '
               'formularios de contacto, integracion WhatsApp y redes sociales, capacitacion', cell_left_style)],
    [Paragraph('Catalogos / Integraciones', cell_left_style),
     Paragraph('RD$ 45,000', cell_style),
     Paragraph('Todo lo anterior mas catalogo de productos, integraciones con sistemas externos, '
               'formularios avanzados', cell_left_style)],
    [Paragraph('Tienda Online', cell_left_style),
     Paragraph('RD$ 65,000', cell_style),
     Paragraph('E-commerce completo con pasarelas de pago, gestion de productos, pedidos y clientes', cell_left_style)],
]

ws_widths = [0.25 * CONTENT_W, 0.18 * CONTENT_W, 0.57 * CONTENT_W]
ws_table = Table(ws_data, colWidths=ws_widths, hAlign='CENTER')
ws_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(ws_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 2: Precios de WebStore Dominicana (webstore.do). Fuente: Sitio web oficial, mayo 2026.',
    caption_style
))
story.append(Spacer(1, 12))

# 3.2 Prowebrd
story.append(Paragraph('<b>3.2 Prowebrd (prowebrd.com)</b>', h2_style))
story.append(Paragraph(
    'Prowebrd es otra agencia dominicana que ofrece servicios de diseno de paginas web, manejo '
    'de redes sociales, posicionamiento SEO, streaming y aplicaciones moviles. Su plan Basico '
    'comienza en RD$ 25,000 e incluye hasta 8 paginas de contenido, dominio y hosting gratuito, '
    'y diseno personalizado. Esta agencia se posiciona como una opcion mas accesible que WebStore, '
    'aunque con un enfoque ligeramente mas orientado a plantillas personalizadas en lugar de '
    'desarrollos completamente a medida.',
    body_style
))

pw_data = [
    [Paragraph('<b>Plan</b>', header_cell_style),
     Paragraph('<b>Precio</b>', header_cell_style),
     Paragraph('<b>Descripcion</b>', header_cell_style)],
    [Paragraph('Basico', cell_left_style),
     Paragraph('RD$ 25,000', cell_style),
     Paragraph('Hasta 8 paginas de contenido, dominio y hosting gratis, diseno personalizado', cell_left_style)],
]

pw_widths = [0.20 * CONTENT_W, 0.20 * CONTENT_W, 0.60 * CONTENT_W]
pw_table = Table(pw_data, colWidths=pw_widths, hAlign='CENTER')
pw_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(pw_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 3: Precios de Prowebrd (prowebrd.com). Fuente: Sitio web oficial, mayo 2026.',
    caption_style
))
story.append(Spacer(1, 12))

# 3.3 BYAR Marketing
story.append(Paragraph('<b>3.3 BYAR Marketing (byarmarketing.com)</b>', h2_style))
story.append(Paragraph(
    'BYAR Marketing es una agencia que publica guias de precios actualizadas. Segun su articulo '
    'de 2025, los precios de diseno web en Republica Dominicana se dividen en las siguientes '
    'categorias, lo cual resulta particularmente util como referencia del mercado general. Es '
    'importante notar que sus precios estan expresados en dolares americanos, lo cual es comun '
    'en agencias que atienden tanto al mercado local como internacional.',
    body_style
))

byar_data = [
    [Paragraph('<b>Tipo de Sitio</b>', header_cell_style),
     Paragraph('<b>Rango USD</b>', header_cell_style),
     Paragraph('<b>Equivalente RD$</b>', header_cell_style)],
    [Paragraph('Sitio Web Basico', cell_left_style),
     Paragraph('$200 - $500', cell_style),
     Paragraph('RD$ 12,000 - 30,000', cell_style)],
    [Paragraph('Sitio Corporativo', cell_left_style),
     Paragraph('$600 - $1,500', cell_style),
     Paragraph('RD$ 36,000 - 90,000', cell_style)],
    [Paragraph('Tienda Online', cell_left_style),
     Paragraph('$800 - $3,000', cell_style),
     Paragraph('RD$ 48,000 - 180,000', cell_style)],
    [Paragraph('Desarrollo a Medida', cell_left_style),
     Paragraph('$2,500+', cell_style),
     Paragraph('RD$ 150,000+', cell_style)],
]

byar_widths = [0.35 * CONTENT_W, 0.30 * CONTENT_W, 0.35 * CONTENT_W]
byar_table = Table(byar_data, colWidths=byar_widths, hAlign='CENTER')
byar_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(byar_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 4: Precios de BYAR Marketing (byarmarketing.com). Fuente: Articulo publicado febrero 2025.',
    caption_style
))
story.append(Spacer(1, 12))

# 3.4 GMedia
story.append(Paragraph('<b>3.4 GMedia (gmedia.do)</b>', h2_style))
story.append(Paragraph(
    'GMedia es una agencia de marketing digital con mas de 16 anos de experiencia en Republica '
    'Dominicana. Se especializan en diseno y desarrollo web, desarrollo de aplicaciones moviles, '
    'social media marketing, SEO y estrategia digital. Su enfoque se centra en crear soluciones '
    'integrales que combinan presencia web con estrategias de marketing digital efectivas. No '
    'publican precios directamente en su sitio web, sino que trabajan con cotizaciones '
    'personalizadas segun las necesidades del cliente. Esto es una practica comun entre las agencias '
    'mas establecidas, ya que cada proyecto tiene requerimientos unicos que dificultan la publicacion '
    'de tarifas fijas.',
    body_style
))

# 3.5 PixelCity
story.append(Paragraph('<b>3.5 PixelCity (pixelcity.com.do)</b>', h2_style))
story.append(Paragraph(
    'PixelCity es otra agencia dominicana que ofrece servicios de diseno web. Segun su sitio web, '
    'los precios se calculan dependiendo de los requisitos del proyecto, y un sitio web sencillo '
    'de pocas paginas comienza desde aproximadamente USD $300 (alrededor de RD$ 18,000). Esta '
    'agencia representa el segmento mas accesible del mercado, ideal para negocios pequenos que '
    'buscan una presencia web profesional sin una inversion significativa. Sin embargo, sus '
    'proyectos mas complejos pueden alcanzar precios similares a los de WebStore o BYAR Marketing.',
    body_style
))

# 3.6 Reddit Community
story.append(Paragraph('<b>3.6 Comunidad Reddit (r/Dominican)</b>', h2_style))
story.append(Paragraph(
    'En el foro de Reddit r/Dominican, un hilo de discusion sobre costos de paginas web '
    'profesionales arrojo datos interesantes desde la perspectiva de los usuarios y desarrolladores '
    'freelance. Segun las respuestas de la comunidad, una pagina informativa puede costar entre '
    'USD $500-750, mientras que una pagina con funcionalidades de e-commerce puede llegar hasta '
    'los USD $1,500. Estos precios reflejan mas el mercado de freelancers y desarrolladores '
    'independientes, que suelen ser mas accesibles que las agencias formales pero pueden ofrecer '
    'un nivel de soporte y garantia mas limitado.',
    body_style
))

# ══════════════════════════════════════════
# 4. ANALISIS DEL PROYECTO OMANI BARBERSHOP
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>4. Analisis del Proyecto Omani Barbershop</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>4.1 Funcionalidades Implementadas</b>', h2_style))
story.append(Paragraph(
    'El sitio web de Omani Barbershop ya se encuentra desarrollado y desplegado en produccion. '
    'A continuacion se detallan las funcionalidades que fueron implementadas en el proyecto, las '
    'cuales representan un valor significativo en terminos de desarrollo y que deben ser consideradas '
    'al evaluar el costo equivalente en el mercado dominicano.',
    body_style
))

features_data = [
    [Paragraph('<b>Funcionalidad</b>', header_cell_style),
     Paragraph('<b>Descripcion</b>', header_cell_style),
     Paragraph('<b>Valor Estimado</b>', header_cell_style)],
    [Paragraph('Pagina Principal<br/>Completa', cell_left_style),
     Paragraph('Hero section con animaciones, seccion de servicios (4 tipos de corte), galeria de fotos, '
               'formulario de contacto, ubicacion con Google Maps', cell_left_style),
     Paragraph('RD$ 8,000 - 15,000', cell_style)],
    [Paragraph('Sistema de Reservas', cell_left_style),
     Paragraph('Formulario de citas con verificacion de disponibilidad en tiempo real, seleccion de '
               'servicio, fecha y hora, campos de nombre, telefono y notas', cell_left_style),
     Paragraph('RD$ 10,000 - 20,000', cell_style)],
    [Paragraph('Integracion WhatsApp', cell_left_style),
     Paragraph('Boton flotante de WhatsApp con enlace directo al numero del negocio, '
               'integracion en secciones de contacto', cell_left_style),
     Paragraph('RD$ 2,000 - 5,000', cell_style)],
    [Paragraph('Panel Administrativo', cell_left_style),
     Paragraph('Dashboard protegido con login JWT, gestion completa de citas (CRUD), filtros por '
               'estado, contacto directo via WhatsApp, cambio de contrasena', cell_left_style),
     Paragraph('RD$ 12,000 - 25,000', cell_style)],
    [Paragraph('Autenticacion Segura', cell_left_style),
     Paragraph('Sistema de autenticacion con JWT y cookies httpOnly, verificacion de sesion, '
               'proteccion de rutas de API', cell_left_style),
     Paragraph('RD$ 5,000 - 10,000', cell_style)],
    [Paragraph('Diseno Responsivo', cell_left_style),
     Paragraph('Tema oscuro/dorado personalizado para barberia, animaciones con Framer Motion, '
               'adaptacion completa a moviles y escritorio', cell_left_style),
     Paragraph('RD$ 5,000 - 10,000', cell_style)],
    [Paragraph('Despliegue y Hosting', cell_left_style),
     Paragraph('Configuracion de Vercel, dominio personalizado, variables de entorno, '
               'base de datos con adaptacion para serverless', cell_left_style),
     Paragraph('RD$ 3,000 - 6,000', cell_style)],
]

feat_widths = [0.22 * CONTENT_W, 0.50 * CONTENT_W, 0.28 * CONTENT_W]
feat_table = Table(features_data, colWidths=feat_widths, hAlign='CENTER')
feat_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(feat_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 5: Desglose de funcionalidades del proyecto Omani Barbershop y su valor estimado en el mercado dominicano.',
    caption_style
))
story.append(Spacer(1, 12))

# 4.2 Valor Total Estimado
story.append(Paragraph('<b>4.2 Valor Total Estimado del Proyecto</b>', h2_style))
story.append(Paragraph(
    'Sumando los valores estimados de cada funcionalidad implementada en el proyecto Omani '
    'Barbershop, el valor total del desarrollo se ubica en el siguiente rango, el cual es '
    'consistente con los precios de mercado para sitios web con funcionalidades interactivas '
    'en Republica Dominicana. Es importante destacar que este valor refleja el costo que un '
    'cliente tendria que pagar si contratara a una agencia o freelancer para desarrollar un '
    'proyecto equivalente desde cero.',
    body_style
))

total_data = [
    [Paragraph('<b>Concepto</b>', header_cell_style),
     Paragraph('<b>Rango Minimo</b>', header_cell_style),
     Paragraph('<b>Rango Maximo</b>', header_cell_style)],
    [Paragraph('Suma de funcionalidades', cell_left_style),
     Paragraph('RD$ 45,000', cell_style),
     Paragraph('RD$ 91,000', cell_style)],
    [Paragraph('Equivalente en USD', cell_left_style),
     Paragraph('USD $750', cell_style),
     Paragraph('USD $1,517', cell_style)],
]

total_widths = [0.40 * CONTENT_W, 0.30 * CONTENT_W, 0.30 * CONTENT_W]
total_table = Table(total_data, colWidths=total_widths, hAlign='CENTER')
total_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(total_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 6: Valor total estimado del proyecto Omani Barbershop. Tipo de cambio: 1 USD = 60 RD$.',
    caption_style
))
story.append(Spacer(1, 18))

story.append(Paragraph(
    'El valor total estimado del proyecto Omani Barbershop se ubica entre <b>RD$ 45,000 y '
    'RD$ 91,000</b> (USD $750 - $1,517). Este rango es coherente con los precios publicados '
    'por las agencias consultadas: WebStore Dominicana cobra desde RD$ 32,500 por un sitio '
    'corporativo y RD$ 45,000 por sitios con integraciones, mientras que BYAR Marketing situa '
    'los sitios corporativos entre USD $600-1,500. La diferencia de precio dentro del rango '
    'depende de si se contrata con un freelancer independiente (extremo inferior) o con una '
    'agencia establecida con soporte continuo (extremo superior).',
    body_style
))

# ══════════════════════════════════════════
# 5. FACTORES QUE AFECTAN EL PRECIO
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>5. Factores que Afectan el Precio en el Mercado Dominicano</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'El costo de desarrollar un sitio web en Republica Dominicana no es un valor fijo, sino que '
    'depende de una serie de factores que pueden hacer que el precio varie significativamente de '
    'un proyecto a otro. Comprender estos factores es esencial para cualquier negocio que busque '
    'cotizar un proyecto de desarrollo web, ya que permite tomar decisiones informadas sobre que '
    'elementos priorizar y donde se puede optimizar la inversion sin sacrificar calidad.',
    body_style
))

story.append(Paragraph('<b>5.1 Nivel de Personalizacion del Diseno</b>', h2_style))
story.append(Paragraph(
    'Un diseno basado en plantillas predefinidas (como las de Wix o WordPress) es considerablemente '
    'mas economico que un diseno 100% personalizado. Las plantillas ofrecen una base visual '
    'funcional que se adapta con colores y logos del cliente, pero no permiten una identidad visual '
    'unica. En contraste, un diseno a medida como el de Omani Barbershop (con su tema oscuro/dorado '
    'personalizado, animaciones con Framer Motion, y layout adaptado a la marca) requiere mas horas '
    'de trabajo de un diseador y desarrollador, lo cual incrementa el costo. La diferencia de precio '
    'entre una plantilla y un diseno a medida puede ser del 50% al 200% adicional.',
    body_style
))

story.append(Paragraph('<b>5.2 Complejidad de las Funcionalidades</b>', h2_style))
story.append(Paragraph(
    'Las funcionalidades interactivas como sistemas de reservas, autenticacion de usuarios, y '
    'paneles administrativos representan la mayor parte del costo de desarrollo. Un sitio web '
    'informativo con paginas estaticas puede desarrollarse en 1-2 semanas, mientras que un sitio '
    'con un sistema de reservas completo, verificacion de disponibilidad en tiempo real, y un '
    'panel administrativo con CRUD completo puede tomar de 3 a 8 semanas dependiendo de la '
    'complejidad. Cada funcionalidad adicional (como la integracion con WhatsApp o el cambio '
    'de contrasena desde el panel) agrega tiempo de desarrollo y por ende costo al proyecto.',
    body_style
))

story.append(Paragraph('<b>5.3 Tipo de Proveedor: Agencia vs Freelancer</b>', h2_style))
story.append(Paragraph(
    'Las agencias establecidas como WebStore, GMedia o BYAR Marketing cobran mas que los '
    'freelancers independientes, pero ofrecen ventajas como soporte continuo, equipo '
    'multidisciplinario, garantia sobre el trabajo, y procesos de trabajo mas estructurados. '
    'Un freelancer puede ofrecer precios 30-50% menores, pero con riesgos como falta de soporte '
    'post-entrega, retrasos por compromisos multiples, o limitaciones tecnicas. Para un negocio '
    'como una barberia que depende del sitio web para recibir citas, la confiabilidad y el soporte '
    'son factores criticos a considerar.',
    body_style
))

story.append(Paragraph('<b>5.4 Hosting y Mantenimiento Continuo</b>', h2_style))
story.append(Paragraph(
    'El costo del hosting y mantenimiento es un gasto recurrente que muchas veces se pasa por alto '
    'al evaluar el precio de un sitio web. En el caso de Omani Barbershop, el hosting en Vercel '
    'es gratuito para el plan basico, pero las agencias dominicanas tipicamente incluyen hosting '
    'propio con un costo mensual de RD$ 500 - 3,000 (USD $8-50). Ademas, el mantenimiento '
    'anual (actualizaciones de seguridad, cambios menores, soporte tecnico) puede costar entre '
    'RD$ 10,000 y 30,000 al ano. Estos costos recurrentes deben considerarse en el presupuesto '
    'total del proyecto a largo plazo.',
    body_style
))

story.append(Paragraph('<b>5.5 Tecnologias Utilizadas</b>', h2_style))
story.append(Paragraph(
    'La eleccion de la plataforma tecnologica afecta directamente el precio. Los sitios construidos '
    'con WordPress y temas predeterminados son los mas economicos, mientras que los desarrollos a '
    'medida con frameworks modernos como Next.js, React, o Vue.js tienen un costo mayor pero '
    'ofrecen mejor rendimiento, seguridad y escalabilidad. El proyecto Omani Barbershop utiliza '
    'Next.js con TypeScript, Prisma ORM, y Tailwind CSS, un stack tecnologico moderno que '
    'representa un desarrollo de mayor calidad y valor que un sitio WordPress estandar. El uso de '
    'autenticacion JWT en lugar de sesiones de base de datos tambien demuestra una implementacion '
    'tecnica superior que se reflejaria en un precio mas alto del mercado.',
    body_style
))

# ══════════════════════════════════════════
# 6. ALTERNATIVAS DE SOFTWARE PARA BARBERIAS
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>6. Alternativas de Software para Barberias en RD</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'Ademas del desarrollo de un sitio web a medida, existen soluciones SaaS (Software as a Service) '
    'especificamente disenadas para barberias que operan en Republica Dominicana. Estas plataformas '
    'ofrecen funcionalidades de reserva de citas y gestion de clientes, pero con un modelo de '
    'suscripcion mensual en lugar de un pago unico por desarrollo. Es importante comparar estas '
    'alternativas para entender el valor que un sitio web propio aporta versus una solucion '
    'de terceros.',
    body_style
))

alt_data = [
    [Paragraph('<b>Plataforma</b>', header_cell_style),
     Paragraph('<b>Modelo de Precio</b>', header_cell_style),
     Paragraph('<b>Funcionalidades</b>', header_cell_style),
     Paragraph('<b>Limitaciones</b>', header_cell_style)],
    [Paragraph('ReservaSimple', cell_left_style),
     Paragraph('Suscripcion mensual', cell_style),
     Paragraph('Agenda 24/7, recordatorios WhatsApp, cobro anticipado', cell_left_style),
     Paragraph('Sin sitio web propio, dependes de la plataforma', cell_left_style)],
    [Paragraph('Booksy', cell_left_style),
     Paragraph('Suscripcion mensual', cell_style),
     Paragraph('Reservas online, gestion de clientes, app movil', cell_left_style),
     Paragraph('Comision por reserva, sin personalizacion de marca', cell_left_style)],
    [Paragraph('Barber Shop RD', cell_left_style),
     Paragraph('Gratis / Premium', cell_style),
     Paragraph('Busqueda de barberias, reservas, app Android', cell_left_style),
     Paragraph('Marketplace, no es tu sitio web propio', cell_left_style)],
    [Paragraph('Yeasy', cell_left_style),
     Paragraph('Suscripcion mensual', cell_style),
     Paragraph('Busqueda de barberos, reservas sin llamadas', cell_left_style),
     Paragraph('Marketplace, competiras con otras barberias', cell_left_style)],
    [Paragraph('Sitio Web Propio', cell_left_style),
     Paragraph('Pago unico', cell_style),
     Paragraph('Marca propia, SEO en Google, WhatsApp, panel admin, sin comisiones', cell_left_style),
     Paragraph('Requiere inversion inicial, mantenimiento propio', cell_left_style)],
]

alt_widths = [0.18 * CONTENT_W, 0.17 * CONTENT_W, 0.35 * CONTENT_W, 0.30 * CONTENT_W]
alt_table = Table(alt_data, colWidths=alt_widths, hAlign='CENTER')
alt_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(alt_table)
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Tabla 7: Comparativa de alternativas de software para barberias en Republica Dominicana.',
    caption_style
))
story.append(Spacer(1, 12))

story.append(Paragraph(
    'La ventaja principal de tener un sitio web propio es la independencia de plataformas terceras, '
    'la personalizacion completa de la marca, el posicionamiento en Google con tu propio dominio, '
    'y la ausencia de comisiones por cada reserva. Las plataformas SaaS como Booksy o ReservaSimple '
    'cobran entre USD $20-50 mensuales (RD$ 1,200-3,000), lo cual en 2-3 anos iguala o supera '
    'la inversion de un sitio web propio. Ademas, en los marketplaces como Barber Shop RD o Yeasy, '
    'tu barberia compite directamente con otras por la atencion del cliente, mientras que un sitio '
    'web propio es un espacio exclusivo de tu marca.',
    body_style
))

# ══════════════════════════════════════════
# 7. CONCLUSIONES
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>7. Conclusiones</b>', h1_style))
story.append(Spacer(1, 6))

story.append(Paragraph(
    'Basado en la investigacion realizada consultando multiples agencias de desarrollo web en '
    'Republica Dominicana (WebStore Dominicana, Prowebrd, BYAR Marketing, GMedia, PixelCity), '
    'foros de la comunidad (Reddit r/Dominican), y plataformas de software para barberias, se '
    'pueden establecer las siguientes conclusiones sobre el valor del trabajo realizado para el '
    'proyecto Omani Barbershop.',
    body_style
))

story.append(Paragraph(
    '<b>Valor del proyecto:</b> El sitio web de Omani Barbershop, con todas sus funcionalidades '
    'implementadas (pagina principal completa, sistema de reservas con disponibilidad en tiempo '
    'real, integracion WhatsApp, panel administrativo con CRUD, autenticacion JWT, diseno '
    'responsivo personalizado, y despliegue en produccion), tiene un valor estimado en el mercado '
    'dominicano de entre <b>RD$ 45,000 y RD$ 91,000</b> (USD $750 - $1,517). Este rango se '
    'corresponde con lo que las agencias establecidas cobran por un sitio web con funcionalidades '
    'interactivas y un panel administrativo personalizado.',
    body_style
))

story.append(Paragraph(
    '<b>Comparativa de mercado:</b> WebStore Dominicana, la agencia con precios mas transparentes, '
    'cobra desde RD$ 32,500 por un sitio corporativo basico y RD$ 45,000 por sitios con '
    'integraciones. El proyecto Omani Barbershop supera estas ofertas basicas con funcionalidades '
    'avanzadas como la verificacion de disponibilidad en tiempo real y el panel administrativo '
    'completo con autenticacion segura, lo que justifica un precio en el rango superior del mercado.',
    body_style
))

story.append(Paragraph(
    '<b>Ventaja vs. SaaS:</b> Comparado con las soluciones de suscripcion mensual como Booksy '
    '(USD $20-50/mes) o ReservaSimple, el sitio web propio se paga una sola vez y no genera '
    'comisiones por reserva. En un periodo de 2-3 anos, la inversion en el sitio web propio '
    'es mas rentable que las alternativas SaaS, ademas de ofrecer ventajas unicas como '
    'posicionamiento SEO propio, marca personalizada, y total independencia de terceros.',
    body_style
))

story.append(Paragraph(
    '<b>Calidad tecnica:</b> El uso de Next.js con TypeScript, Prisma ORM, JWT para autenticacion, '
    'y despliegue en Vercel representa un stack tecnologico moderno y profesional que pocas agencias '
    'en Republica Dominicana ofrecen en este rango de precios. La mayoria de las agencias locales '
    'trabajan con WordPress, que si bien es funcional, no ofrece el mismo nivel de rendimiento, '
    'seguridad y escalabilidad que un desarrollo a medida con frameworks modernos.',
    body_style
))

# ══════════════════════════════════════════
# 8. FUENTES CONSULTADAS
# ══════════════════════════════════════════
story.append(Spacer(1, 12))
story.append(Paragraph('<b>8. Fuentes Consultadas</b>', h1_style))
story.append(Spacer(1, 6))

sources = [
    'WebStore Dominicana - Diseno de paginas web profesionales en Republica Dominicana. '
    'https://webstore.do/servicios-diseno-web',

    'BYAR Marketing - Cuanto cuesta un diseno web en Republica Dominicana en 2025. '
    'https://byarmarketing.com/cuanto-cuesta-un-diseno-web-en-republica-dominicana-en-2025',

    'Prowebrd - Diseno de Paginas Web en Republica Dominicana. '
    'https://prowebrd.com/servicios/diseno-de-paginas-web',

    'GMedia - Diseno Web en Republica Dominicana. '
    'https://gmedia.do/diseno-web-republica-dominicana',

    'PixelCity - Precios paginas web en Republica Dominicana. '
    'https://pixelcity.com.do/precios-paginas-web-en-republica-dominicana',

    'FullStackW - Diseno de paginas web en Republica Dominicana: La Guia Definitiva 2025. '
    'https://fullstackw.com/diseno-de-paginas-web-en-republica-dominicana-la-guia-definitiva-2025',

    'Reddit r/Dominican - Cual es el costo para una pagina web profesional para mi negocio. '
    'https://www.reddit.com/r/Dominican/comments/kvcgdd/',

    'ReservaSimple - App Citas Barberia Republica Dominicana 2026. '
    'https://www.reservasimple.com/app-citas-barberia-republica-dominicana',
]

for i, source in enumerate(sources, 1):
    story.append(Paragraph(
        f'{i}. {source}',
        ParagraphStyle(
            name=f'Source{i}', fontName='LiberationSerif', fontSize=10,
            leading=15, alignment=TA_LEFT, spaceAfter=6,
            leftIndent=24, firstLineIndent=-24,
            textColor=TEXT_PRIMARY
        )
    ))

# ── Build PDF ──
doc.build(story)
print(f'PDF generado exitosamente: {OUTPUT_PATH}')
