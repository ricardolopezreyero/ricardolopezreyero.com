#!/bin/bash
# ricardolopezreyero.com · sube a R2 los archivos de más de 25 MB · Ricardo López Reyero (RLR)
# Uso: npm run pesados   (solo hace falta cuando cambia o se agrega un archivo en /pesados)
# Si agregas uno nuevo, anótalo también en worker/index.js (PESADOS) y en src/pesados.js.
set -euo pipefail
cd "$(dirname "$0")/.."

tipo() {
  case "$1" in
    *.mp3) echo "audio/mpeg" ;;
    *.m4a) echo "audio/mp4" ;;
    *.pdf) echo "application/pdf" ;;
    *.zip) echo "application/zip" ;;
    *)     echo "application/octet-stream" ;;
  esac
}

for archivo in pesados/*; do
  nombre="$(basename "$archivo")"
  [ "$nombre" = "LEEME.md" ] && continue
  echo "→ $nombre"
  npx wrangler r2 object put "ricardolopezreyero-medios/$nombre" \
    --file "$archivo" --content-type "$(tipo "$nombre")" --remote
done
echo "Listo: archivos pesados en R2."
