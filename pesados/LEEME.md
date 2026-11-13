# Audios y archivos pesados

Lo que está en esta carpeta no va dentro del sitio compilado: se publica en R2 (bucket
`ricardolopezreyero-medios`) y el sitio lo pide en `/pesados/<nombre>`. Aquí van:

- **Todos los audios.** El reproductor necesita que el servidor entregue el archivo por partes
  (para adelantar, y Safari no reproduce sin eso). El sitio estático de Cloudflare no lo hace;
  el Worker sobre R2 sí.
- **Cualquier archivo de más de 25 MB**, que Cloudflare no acepta dentro del sitio.

| Archivo | Se usa en |
| --- | --- |
| `frecuencia-396hz.mp3` | Descargas → Audios |
| `imagination-bob-proctor.mp3` | Descargas → Audios |
| `the-will-bob-proctor.mp3` | Descargas → Audios |
| `percepcion-bob-proctor.mp3` | Descargas → Audios |
| `mundo-interno-vs-mundo-externo-neville-goddard.mpeg` | Descargas → Audios |
| `a-tus-ordenes-neville-goddard.m4a` | Descargas → Audios |
| `imaginacion-despierta-neville-goddard.m4a` | Descargas → Audios |
| `libros-leidos-y-recomendaciones-2024.pdf` | Libros y Descargas → Libros leídos |

Para subir un cambio: `npm run pesados`.

Para agregar uno nuevo: ponerlo aquí, anotarlo en `worker/index.js` (lista `PESADOS`) y en
`src/pesados.js`, y correr `npm run pesados` antes de `npm run deploy`.
