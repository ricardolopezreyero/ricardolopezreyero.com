// ricardolopezreyero.com · service worker · Ricardo López Reyero (RLR)
// Hace que la página abra sin internet (por ejemplo en un vuelo). Los audios guardados no pasan
// por aquí: la página los lee directo del almacenamiento del navegador (caja rlr-audios-v1).
//
//   · Páginas (/, /descargas, …): primero la red; sin red, la última copia guardada.
//   · /static/* (archivos con huella en el nombre): primero la copia; si no hay, la red.
//   · Lo demás del sitio y las tipografías de Google: la copia al instante y se refresca por detrás.
//   · /api/* y /pesados/*: no se tocan.
const CAJA = 'rlr-sitio-v1';
const PAGINA = '/index.html';
const SIN_GUARDAR = /\.(pdf|zip|mp3|m4a|mpeg|map)$/i;

self.addEventListener('install', (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CAJA)
      .then((caja) => fetch('/', { cache: 'no-store' }).then((r) => (r.ok ? caja.put(PAGINA, r) : null)))
      .catch(() => null)
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const cajas = await caches.keys();
    await Promise.all(
      cajas.filter((c) => c.startsWith('rlr-sitio-') && c !== CAJA).map((c) => caches.delete(c))
    );
    await self.clients.claim();
  })());
});

// RLR · guarda el JS y CSS de todo el sitio y tira lo de versiones viejas
async function calentar() {
  const caja = await caches.open(CAJA);
  const respuesta = await fetch('/asset-manifest.json', { cache: 'no-store' });
  if (!respuesta.ok) return;
  const manifiesto = await respuesta.json();
  const vigentes = Object.values(manifiesto.files || {})
    .filter((ruta) => /^\/static\/(js|css)\/.+\.(js|css)$/.test(ruta));

  await Promise.all(vigentes.map(async (ruta) => {
    if (await caja.match(ruta)) return;
    try {
      const r = await fetch(ruta);
      if (r.ok) await caja.put(ruta, r);
    } catch (e) { /* se intentará en la siguiente visita */ }
  }));

  const guardadas = await caja.keys();
  await Promise.all(guardadas.map((peticion) => {
    const ruta = new URL(peticion.url).pathname;
    const esCodigo = /^\/static\/(js|css)\//.test(ruta);
    return esCodigo && !vigentes.includes(ruta) ? caja.delete(peticion) : null;
  }));
}

self.addEventListener('message', (evento) => {
  if (evento.data === 'calentar') evento.waitUntil(calentar().catch(() => null));
});

async function redPrimero(peticion) {
  const caja = await caches.open(CAJA);
  try {
    const respuesta = await fetch(peticion);
    if (respuesta.ok) caja.put(PAGINA, respuesta.clone());
    return respuesta;
  } catch (e) {
    const copia = await caja.match(PAGINA);
    if (copia) return copia;
    throw e;
  }
}

async function copiaPrimero(peticion) {
  const caja = await caches.open(CAJA);
  const copia = await caja.match(peticion);
  if (copia) return copia;
  const respuesta = await fetch(peticion);
  if (respuesta.ok) caja.put(peticion, respuesta.clone());
  return respuesta;
}

async function copiaYRefresca(peticion) {
  const caja = await caches.open(CAJA);
  const copia = await caja.match(peticion);
  const deLaRed = fetch(peticion)
    .then((respuesta) => {
      if (respuesta.ok || respuesta.type === 'opaque') caja.put(peticion, respuesta.clone());
      return respuesta;
    })
    .catch(() => null);
  return copia || (await deLaRed) || Response.error();
}

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET') return;
  const url = new URL(peticion.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/pesados/')) return;
    if (url.pathname === '/sw.js' || url.pathname === '/asset-manifest.json') return;
    if (peticion.headers.has('range') || SIN_GUARDAR.test(url.pathname)) return;

    if (peticion.mode === 'navigate') {
      evento.respondWith(redPrimero(peticion));
    } else if (url.pathname.startsWith('/static/')) {
      evento.respondWith(copiaPrimero(peticion));
    } else {
      evento.respondWith(copiaYRefresca(peticion));
    }
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    evento.respondWith(copiaYRefresca(peticion));
  }
});
// RLR · fin
