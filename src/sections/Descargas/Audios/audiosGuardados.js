// RLR · Audios guardados en el navegador · Ricardo López Reyero
// Guarda el archivo completo en el almacenamiento del navegador (Cache Storage) para poder
// escucharlo sin internet. No depende del service worker: la página lee y escribe directo.

const CAJA = 'rlr-audios-v1';
const CLAVE_AVANCE = 'rlr-audios-avance';

export const sePuedeGuardar = () =>
  typeof window !== 'undefined' && 'caches' in window && typeof ReadableStream !== 'undefined';

// La llave es la ruta (/pesados/archivo.mp3), igual en producción y en desarrollo.
export const llaveDe = (url) => new URL(url, window.location.href).pathname;

// RLR · rutas de los audios que ya están guardados
export async function listarGuardados() {
  if (!sePuedeGuardar()) return [];
  const caja = await caches.open(CAJA);
  const llaves = await caja.keys();
  return llaves.map((peticion) => new URL(peticion.url).pathname);
}

// RLR · descarga el audio avisando el avance (0 a 1) y lo deja guardado
export async function guardarAudio(url, alAvanzar, senal, bytesEsperados) {
  const respuesta = await fetch(url, { signal: senal });
  if (!respuesta.ok || !respuesta.body) throw new Error('descarga');

  const total = Number(respuesta.headers.get('content-length')) || bytesEsperados || 0;
  const lector = respuesta.body.getReader();
  const partes = [];
  let recibido = 0;

  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    partes.push(value);
    recibido += value.length;
    if (total && alAvanzar) alAvanzar(Math.min(recibido / total, 1));
  }

  const tipo = respuesta.headers.get('content-type') || 'audio/mpeg';
  const archivo = new Blob(partes, { type: tipo });
  const caja = await caches.open(CAJA);
  await caja.put(
    llaveDe(url),
    new Response(archivo, {
      headers: { 'content-type': tipo, 'content-length': String(archivo.size) },
    })
  );

  // Pide al navegador que no borre lo guardado cuando le falte espacio.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
  return archivo;
}

export async function leerGuardado(url) {
  if (!sePuedeGuardar()) return null;
  const caja = await caches.open(CAJA);
  const respuesta = await caja.match(llaveDe(url));
  return respuesta ? respuesta.blob() : null;
}

export async function quitarAudio(url) {
  if (!sePuedeGuardar()) return;
  const caja = await caches.open(CAJA);
  await caja.delete(llaveDe(url));
}

// RLR · avance de cada audio (segundos), para retomarlo donde se quedó
export function leerAvances() {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE_AVANCE)) || {};
  } catch (e) {
    return {};
  }
}

export function escribirAvances(avances) {
  try {
    window.localStorage.setItem(CLAVE_AVANCE, JSON.stringify(avances));
  } catch (e) {
    /* almacenamiento lleno o bloqueado: se sigue sin recordar el avance */
  }
}
