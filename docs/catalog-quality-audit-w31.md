# Auditoría de calidad del catálogo W31

Fuente: `ITEMS W31 ELIEZER.xlsx`, incorporada como `src/data/current-catalog-w31.json`.

## Grano y alcance

- 1,494 registros de inventario.
- 1,494 SKU distintos: no existen SKU duplicados.
- 1,164 UPC informados y 330 registros sin UPC.
- 1,114 productos con precio de detalle mayor que cero.
- 1,127 productos con existencia mayor que cero.
- 92 registros Rock Space, de los cuales 88 tienen existencia.

## Duplicados y variantes

- Se encontraron 307 grupos con descripciones repetidas.
- 306 grupos corresponden a pares de SKU operativos donde una referencia utiliza el prefijo `MP-`. No se eliminan porque son registros distintos y pueden representar canales o condiciones comerciales diferentes.
- Un grupo restante contiene dos SKU HyperGear distintos (`HG-15758` y `HG-16313`) con la misma descripción, UPC, precio y existencias diferentes. Se conservan ambos SKU y se evita mostrarlos como duplicados técnicos cuando la fuente de la tienda repite el mismo SKU.
- Se encontraron 35 UPC compartidos, principalmente dentro de pares con y sin prefijo `MP-`. Se conservan hasta que administración confirme si deben consolidarse.

## Reglas aplicadas en la web

- La clave principal para consolidar documentos repetidos es el SKU.
- Si Firebase contiene más de un documento con el mismo SKU, se conserva el registro más completo.
- Los productos con SKU distintos no se eliminan automáticamente, aunque compartan descripción o UPC.
- Precio y disponibilidad se actualizan desde el inventario W31 cuando existe coincidencia de SKU.
- Los slugs se mantienen únicos; las excepciones que incluyen SKU evitan colisiones entre variantes legítimas.

## Controles recomendados

- SKU único y obligatorio.
- UPC válido cuando sea informado, permitiendo excepciones documentadas para pares `MP-`.
- Precio de detalle mayor que cero antes de habilitar compra directa.
- Existencia mayor que cero para habilitar “Agregar al carrito”.
- Revisión manual de los 330 registros sin UPC y los 380 sin precio de detalle.
