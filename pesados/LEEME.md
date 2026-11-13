# Archivos pesados

Cloudflare no acepta archivos de más de 25 MB dentro del sitio. Los que pasan de ese tamaño
se guardan aquí y se publican en R2 (bucket `ricardolopezreyero-medios`); el sitio los pide en
`/pesados/<nombre>`.

| Archivo | Se usa en |
| --- | --- |
| `frecuencia-396hz.mp3` | Descargas → Audios |
| `imaginacion-despierta-neville-goddard.m4a` | Descargas → Audios |
| `libros-leidos-y-recomendaciones-2024.pdf` | Libros y Descargas → Libros leídos |

Para subir un cambio: `npm run pesados`.

Para agregar uno nuevo: ponerlo aquí, anotarlo en `worker/index.js` (lista `PESADOS`) y en
`src/pesados.js`, y correr `npm run pesados` antes de `npm run deploy`.
