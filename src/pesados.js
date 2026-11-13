// RLR · Audios y archivos pesados · Ricardo López Reyero
// Viven en R2 y el Worker los entrega en /pesados/<nombre>:
//   · los audios, porque necesitan entrega por rangos (adelantar, Safari) y el sitio
//     estático de Cloudflare no la da;
//   · cualquier archivo de más de 25 MB, que Cloudflare no acepta dentro del sitio.
// Los originales están en la carpeta /pesados del repositorio; se suben con `npm run pesados`.
// En desarrollo local (npm start) se leen del sitio publicado.
const base =
  process.env.NODE_ENV === 'production' ? '/pesados' : 'https://ricardolopezreyero.com/pesados';

export const audioFrecuencia396 = `${base}/frecuencia-396hz.mp3`;
export const audioImagination = `${base}/imagination-bob-proctor.mp3`;
export const audioTheWill = `${base}/the-will-bob-proctor.mp3`;
export const audioPercepcion = `${base}/percepcion-bob-proctor.mp3`;
export const audioMundoInterno = `${base}/mundo-interno-vs-mundo-externo-neville-goddard.mpeg`;
export const audioATusOrdenes = `${base}/a-tus-ordenes-neville-goddard.m4a`;
export const audioImaginacionDespierta = `${base}/imaginacion-despierta-neville-goddard.m4a`;
export const pdfLibrosLeidos = `${base}/libros-leidos-y-recomendaciones-2024.pdf`;
