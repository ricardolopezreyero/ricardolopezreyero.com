-- ricardolopezreyero.com · contador de visitas (D1) · Ricardo López Reyero (RLR)
-- Una sola fila con el total. El arranque (1,218) es el conteo que traía el contador PHP
-- del hosting anterior el 13-nov-2026; al cambiar el dominio se ajusta al número del día.
CREATE TABLE IF NOT EXISTS contador (
  id    INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL
);
INSERT OR IGNORE INTO contador (id, total) VALUES (1, 1218);
