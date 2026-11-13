#!/usr/bin/env python3
# ricardolopezreyero.com · importa los Escritos desde el blog anterior (GoHighLevel) · RLR
#
# Uso:  python3 scripts/importar-escritos.py [carpeta-de-cache]
#
# Lee la lista de escritos de https://escritos.ricardolopezreyero.com, baja cada texto con su
# portada e imágenes y deja todo dentro del sitio:
#   src/escritos/indice.json        lista (título, descripción, etiquetas, fecha, portada)
#   public/escritos/<slug>.json     el texto de cada escrito, ya limpio
#   public/escritos/img/*           portadas e imágenes en WebP
# Se corrió el 13-nov-2026 para traer los 43 escritos. Un escrito nuevo se puede agregar a mano
# con esos mismos tres archivos.
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import unicodedata
from datetime import datetime
from html.parser import HTMLParser

ORIGEN = "https://escritos.ricardolopezreyero.com"
PROXY = "https://images.leadconnectorhq.com/image/f_webp/q_80/r_{ancho}/u_{url}"
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, ".cache-escritos")
DEST_TEXTOS = os.path.join(RAIZ, "public", "escritos")
DEST_IMG = os.path.join(DEST_TEXTOS, "img")
DEST_INDICE = os.path.join(RAIZ, "src", "escritos", "indice.json")
PROPIAS = ("assets.cdn.filesafe.space", "storage.googleapis.com/msgsndr", "images.leadconnectorhq.com")

for carpeta in (CACHE, os.path.join(CACHE, "html"), DEST_IMG, os.path.dirname(DEST_INDICE)):
    os.makedirs(carpeta, exist_ok=True)


def bajar(url, destino, minimo=200):
    if os.path.exists(destino) and os.path.getsize(destino) >= minimo:
        return True
    subprocess.run(["curl", "-sL", "-m", "60", "-o", destino, url], check=False)
    return os.path.exists(destino) and os.path.getsize(destino) >= minimo


def plano(texto):
    texto = unicodedata.normalize("NFD", texto.lower())
    return re.sub(r"[^a-z0-9]+", "", "".join(c for c in texto if unicodedata.category(c) != "Mn"))


def imagen_local(url, nombre, ancho):
    """Baja la imagen en WebP y devuelve su ruta pública; si no es propia, se deja la liga."""
    if not any(p in url for p in PROPIAS):
        return url
    limpio = re.sub(r"^https://images\.leadconnectorhq\.com/image/[^u]*u_", "", url)
    destino = os.path.join(DEST_IMG, nombre + ".webp")
    if bajar(PROXY.format(ancho=ancho, url=limpio), destino, 500):
        return "/escritos/img/" + nombre + ".webp"
    return url


class Limpiador(HTMLParser):
    """Deja solo el marcado de lectura: sin estilos en línea, sin clases, sin scripts."""

    PERMITIDAS = {"p", "a", "blockquote", "br", "em", "strong", "u", "h2", "h3", "hr",
                  "img", "ul", "ol", "li", "video", "figure", "figcaption"}
    SIN_CIERRE = {"br", "hr", "img"}
    CAMBIOS = {"h1": "h2", "b": "strong", "i": "em", "h4": "h3"}
    IGNORAR = {"script", "style", "iframe", "object"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.partes = []
        self.saltando = 0

    def handle_starttag(self, etiqueta, atributos):
        if etiqueta in self.IGNORAR:
            self.saltando += 1
            return
        if self.saltando:
            return
        etiqueta = self.CAMBIOS.get(etiqueta, etiqueta)
        if etiqueta not in self.PERMITIDAS:
            return
        a = dict(atributos)
        extra = ""
        if etiqueta == "a":
            destino = (a.get("href") or "").strip()
            if not re.match(r"^(https?:|mailto:|/|#)", destino):
                destino = "#"
            extra = ' href="%s"' % html.escape(destino, quote=True)
            if destino.startswith("http"):
                extra += ' target="_blank" rel="noopener noreferrer"'
        elif etiqueta == "img":
            origen = a.get("src") or ""
            nombre = "i-" + hashlib.sha1(origen.encode()).hexdigest()[:12]
            extra = ' src="%s" alt="%s" loading="lazy" decoding="async"' % (
                html.escape(imagen_local(origen, nombre, 1200), quote=True),
                html.escape(a.get("alt") or "", quote=True))
        elif etiqueta == "video":
            extra = ' src="%s" controls preload="none" playsinline' % html.escape(a.get("src") or "", quote=True)
        self.partes.append("<%s%s>" % (etiqueta, extra))

    def handle_endtag(self, etiqueta):
        if etiqueta in self.IGNORAR:
            self.saltando = max(0, self.saltando - 1)
            return
        if self.saltando:
            return
        etiqueta = self.CAMBIOS.get(etiqueta, etiqueta)
        if etiqueta in self.PERMITIDAS and etiqueta not in self.SIN_CIERRE:
            self.partes.append("</%s>" % etiqueta)

    def handle_data(self, datos):
        if not self.saltando:
            self.partes.append(html.escape(datos, quote=False))


def limpiar(contenido, titulo):
    limpiador = Limpiador()
    limpiador.feed(contenido)
    texto = "".join(limpiador.partes)
    texto = re.sub(r"<p>(\s|&nbsp;|<br>)*</p>", "", texto)
    texto = re.sub(r"<(strong|em|u)>\s*</\1>", "", texto)
    # El primer renglón suele repetir el título: se quita, porque el título ya va arriba.
    primero = re.match(r"\s*<(p|h2|h3)>(.*?)</\1>", texto, flags=re.S)
    if primero and plano(re.sub(r"<[^>]+>", "", primero.group(2))) == plano(titulo):
        texto = texto[primero.end():]
    return texto.strip()


portada_home = os.path.join(CACHE, "home.html")
bajar(ORIGEN + "/", portada_home, 5000)
pagina = open(portada_home, encoding="utf-8", errors="replace").read()
lista = json.loads(re.search(r"const posts = (\[.*?\]);\s*\n", pagina, flags=re.S).group(1))

indice = []
for orden, post in enumerate(lista):
    slug_original = post["url"].split("/post/")[1]
    slug = slug_original.lower()
    archivo = os.path.join(CACHE, "html", slug_original + ".html")
    bajar(post["url"], archivo, 5000)
    h = open(archivo, encoding="utf-8", errors="replace").read()

    def meta(patron, defecto=""):
        m = re.search(patron, h, flags=re.S)
        return html.unescape(m.group(1)).strip() if m else defecto

    titulo = meta(r'<meta property="og:title" content="([^"]*)"', post["titulo"])
    descripcion = meta(r'<meta name="description" content="([^"]*)"')
    fecha_texto = meta(r'class="blog-date">([^<]+)')
    try:
        fecha = datetime.strptime(fecha_texto, "%B %d, %Y").strftime("%Y-%m-%d")
    except ValueError:
        fecha = ""
    cuerpo = re.search(r'<div class="blog-html" id="blogPostContent">(.*?)</div>\s*<div', h, flags=re.S)
    contenido = limpiar(cuerpo.group(1) if cuerpo else "", titulo)
    palabras = len(re.sub(r"<[^>]+>", " ", contenido).split())

    portada = imagen_local(post.get("imagen") or "", "portada-" + slug, 900) if post.get("imagen") else ""

    with open(os.path.join(DEST_TEXTOS, slug + ".json"), "w", encoding="utf-8") as salida:
        json.dump({"slug": slug, "html": contenido}, salida, ensure_ascii=False)

    indice.append({
        "slug": slug,
        "titulo": titulo,
        "descripcion": descripcion,
        "etiquetas": post.get("tags") or [],
        "fecha": fecha,
        "minutos": max(1, round(palabras / 220)),
        "portada": portada,
        "origen": post["url"],
    })
    print("%-58s %5d palabras" % (slug, palabras))

with open(DEST_INDICE, "w", encoding="utf-8") as salida:
    json.dump(indice, salida, ensure_ascii=False, indent=1)
    salida.write("\n")
print("Listo:", len(indice), "escritos")
