// RLR · Archivos pesados (más de 25 MB) · Ricardo López Reyero
// Cloudflare no acepta archivos de más de 25 MB dentro del sitio, así que estos tres
// viven en R2 y el Worker los entrega en /pesados/<nombre>. Los originales están en la
// carpeta /pesados del repositorio; se suben con `npm run pesados`.
// En desarrollo local (npm start) se leen del sitio publicado.
const base =
  process.env.NODE_ENV === 'production' ? '/pesados' : 'https://ricardolopezreyero.com/pesados';

export const audioFrecuencia396 = `${base}/frecuencia-396hz.mp3`;
export const audioImaginacionDespierta = `${base}/imaginacion-despierta-neville-goddard.m4a`;
export const pdfLibrosLeidos = `${base}/libros-leidos-y-recomendaciones-2024.pdf`;
