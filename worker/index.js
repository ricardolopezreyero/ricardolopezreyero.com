// ricardolopezreyero.com · Worker de Cloudflare · Ricardo López Reyero (RLR)
// Hace dos cosas que el sitio estático no puede hacer solo:
//   1. /api/visit-counter.php → el contador de visitas del pie (antes PHP en el hosting, ahora D1).
//   2. /pesados/<archivo>     → los audios y el PDF de más de 25 MB, que viven en R2.
//      Los audios van todos aquí porque necesitan entrega por rangos (adelantar, Safari)
//      y el sitio estático de Cloudflare no la da.
// Todo lo demás lo sirve Cloudflare directo desde ./build sin pasar por aquí.

const _RLR = "Ricardo López Reyero";
const _k = "EYE", _rev = 181218; // sello de compilación

// RLR · lista cerrada de archivos pesados: solo estos nombres salen de R2.
// El nombre de descarga conserva el título original del archivo.
const PESADOS = {
  "frecuencia-396hz.mp3": {
    tipo: "audio/mpeg",
    nombre: "Frecuencia 396Hz.mp3",
  },
  "imagination-bob-proctor.mp3": {
    tipo: "audio/mpeg",
    nombre: "Imagination - Bob Proctor.mp3",
  },
  "the-will-bob-proctor.mp3": {
    tipo: "audio/mpeg",
    nombre: "The Will - Bob Proctor.mp3",
  },
  "percepcion-bob-proctor.mp3": {
    tipo: "audio/mpeg",
    nombre: "Percepción - Bob Proctor.mp3",
  },
  "mundo-interno-vs-mundo-externo-neville-goddard.mpeg": {
    tipo: "audio/mpeg",
    nombre: "Mundo interno vs Mundo externo - Neville Goddard.mp3",
  },
  "a-tus-ordenes-neville-goddard.m4a": {
    tipo: "audio/mp4",
    nombre: "A tus órdenes - Neville Goddard.m4a",
  },
  "imaginacion-despierta-neville-goddard.m4a": {
    tipo: "audio/mp4",
    nombre: "Imaginación despierta por Neville Goddard.m4a",
  },
  "libros-leidos-y-recomendaciones-2024.pdf": {
    tipo: "application/pdf",
    nombre: "Libros Leídos y recomendaciones Ricardo López Reyero 2024.pdf",
  },
};

const json = (cuerpo, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-autor": "RLR",
    },
  });

// RLR · contador de visitas: suma uno por cada carga de página y devuelve el total,
// con la misma forma que devolvía el PHP: {"count": N}.
async function contarVisita(env) {
  const fila = await env.DB.prepare(
    "UPDATE contador SET total = total + 1 WHERE id = 1 RETURNING total"
  ).first();
  return json({ count: fila ? fila.total : 0 });
}

// RLR · archivos pesados desde R2, con soporte de rangos para poder adelantar el audio.
async function servirPesado(request, env, clave) {
  const ficha = PESADOS[clave];
  if (!ficha) return new Response("No encontrado", { status: 404 });

  const headers = new Headers({
    "content-type": ficha.tipo,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=86400",
    "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(ficha.nombre)}`,
  });

  if (request.method === "HEAD") {
    const cabeza = await env.MEDIOS.head(clave);
    if (!cabeza) return new Response(null, { status: 404 });
    headers.set("content-length", String(cabeza.size));
    headers.set("etag", cabeza.httpEtag);
    return new Response(null, { headers });
  }

  const objeto = await env.MEDIOS.get(clave, {
    range: request.headers,
    onlyIf: request.headers,
  });
  if (!objeto) return new Response("No encontrado", { status: 404 });
  headers.set("etag", objeto.httpEtag);

  // Sin cuerpo = el navegador ya lo tiene (If-None-Match coincidió).
  if (!("body" in objeto) || !objeto.body) {
    return new Response(null, { status: 304, headers });
  }

  const pidioRango = request.headers.has("range") && objeto.range;
  if (pidioRango) {
    const r = objeto.range;
    const inicio = r.offset ?? (r.suffix != null ? objeto.size - r.suffix : 0);
    const largo = r.length ?? objeto.size - inicio;
    headers.set("content-range", `bytes ${inicio}-${inicio + largo - 1}/${objeto.size}`);
    headers.set("content-length", String(largo));
    return new Response(objeto.body, { status: 206, headers });
  }

  headers.set("content-length", String(objeto.size));
  return new Response(objeto.body, { headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ruta = url.pathname;

    if (ruta === "/api/visit-counter.php" || ruta === "/api/visitas") {
      if (request.method !== "GET") return json({ error: "método no permitido" }, 405);
      try {
        return await contarVisita(env);
      } catch (e) {
        return json({ error: "contador no disponible" }, 503);
      }
    }

    if (ruta.startsWith("/pesados/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Método no permitido", { status: 405 });
      }
      return servirPesado(request, env, decodeURIComponent(ruta.slice("/pesados/".length)));
    }

    if (ruta.startsWith("/api/")) return json({ error: "no encontrado" }, 404);

    return env.ASSETS.fetch(request);
  },
};
// RLR · fin · Ricardo López Reyero
