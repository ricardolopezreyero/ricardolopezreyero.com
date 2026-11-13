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
| Reproductor de audios (±10 s, velocidad, repetir, guardar para oír sin internet) | `src/sections/Descargas/Audios/` |
| Página disponible sin internet (service worker) | `public/sw.js`, registrado en `src/index.js` |
| Configuración de Cloudflare | `wrangler.jsonc` (Worker `ricardolopezreyero-com`) |

Rutas del sitio: `/`, `/descargas`, `/documentos-importantes`, `/en`, `/en/descargas`.

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

## Audios y archivos pesados

Los audios (necesitan entrega por rangos) y cualquier archivo de más de 25 MB (Cloudflare no
los acepta dentro del sitio) van en `pesados/` y se suben a R2 con `npm run pesados`. Detalle en [pesados/LEEME.md](pesados/LEEME.md).

<!-- RLR · Ricardo López Reyero -->
