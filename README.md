# ricardolopezreyero.com

**Ver en vivo: [ricardolopezreyero.com](https://ricardolopezreyero.com)**

Sitio personal de Ricardo López Reyero. Aplicación React (Create React App) publicada en
Cloudflare. Diseño y desarrollo original: Grecia ([grecia-prog/Ricardo-Lopez-Reyero](https://github.com/grecia-prog/Ricardo-Lopez-Reyero)).

## Cómo está armado

| Pieza | Dónde vive |
| --- | --- |
| Sitio (páginas, imágenes y documentos de hasta 25 MB) | `src/` y `public/` → se compila a `build/` y lo sirve Cloudflare |
| Contador de visitas del pie (`/api/visit-counter.php`) | `worker/index.js` + base D1 `ricardolopezreyero-visitas` |
| Audios y archivos de más de 25 MB (`/pesados/…`) | carpeta `pesados/` → bucket R2 `ricardolopezreyero-medios` |
| Página de Audios y su reproductor (±10 s, velocidad, repetir, guardar para oír sin internet) | `src/pages/Audios.jsx` y `src/sections/Descargas/Audios/` |
| Página disponible sin internet (service worker) | `public/sw.js`, registrado en `src/index.js` |
| Escritos (43 textos traídos del blog anterior) | lista en `src/escritos/indice.json`, textos en `public/escritos/<slug>.json`, imágenes en `public/escritos/img/`; páginas en `src/pages/Escritos.jsx` y `Escrito.jsx` |
| Menú | `src/components/Header/Header.js` (orden en la lista `SECCIONES`) |
| Transiciones entre páginas y secciones | `src/transiciones.css`, `src/App.js` (`Paginas`) y `src/components/aparicion.js` |
| Configuración de Cloudflare | `wrangler.jsonc` (Worker `ricardolopezreyero-com`) |

Rutas del sitio: `/`, `/escritos`, `/escritos/<escrito>`, `/audios`, `/descargas`, `/documentos-importantes`, y las mismas con `/en` delante para el sitio en inglés.

## Clonar

Los audios `.mp3` y los `.zip` están en Git LFS:

```bash
git lfs install
```

```bash
git clone https://github.com/ricardolopezreyero/ricardolopezreyero.com.git
```

## Trabajar en local

```bash
npm ci
```

```bash
npm start
```

## Publicar

```bash
npm run deploy
```

Compila y sube a Cloudflare. Si la terminal trae un `CLOUDFLARE_API_TOKEN` sin permisos, usar
`env -u CLOUDFLARE_API_TOKEN -u CLOUDFLARE_ACCOUNT_ID npm run deploy`.

Cada push a `main` compila el sitio en GitHub Actions para comprobar que arma; si el repositorio
tiene el secreto `CLOUDFLARE_API_TOKEN`, además lo publica solo.

## Agregar un escrito

1. Agregar su ficha al inicio de `src/escritos/indice.json` (slug, título, descripción, etiquetas, fecha, minutos, portada).
2. Crear `public/escritos/<slug>.json` con el texto en HTML sencillo: `{"slug": "...", "html": "<p>…</p>"}`.
3. Poner la portada en `public/escritos/img/` (WebP, 16:9).

`scripts/importar-escritos.py` es el script que trajo los 43 escritos del blog anterior.

## Audios y archivos pesados

Los audios (necesitan entrega por rangos) y cualquier archivo de más de 25 MB (Cloudflare no
los acepta dentro del sitio) van en `pesados/` y se suben a R2 con `npm run pesados`. Detalle en [pesados/LEEME.md](pesados/LEEME.md).

<!-- RLR · Ricardo López Reyero -->
