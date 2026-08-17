# Manual operativo TECPOINT

Fecha de corte: 17 de agosto de 2026

## 1. Alcance

Este documento explica cómo administrar la tienda `https://tecpoint.ws/` y el panel `https://crud-tecpoint.vercel.app/`, cómo publicar productos y campañas, cómo revisar las integraciones y qué configuraciones requieren acceso de propietario.

El sistema se divide en dos repositorios:

- Tienda pública: `TecpointDeveloped/tecpoint`
- Panel administrativo: `TecpointDeveloped/crud-tecpoint`

Nunca escriba contraseñas, claves privadas o tokens dentro de este manual, GitHub, Canva, Figma o mensajes. Guárdelos únicamente en el administrador de contraseñas autorizado por TECPOINT.

## 2. Estado validado

- La tienda y el CRUD compilan para producción.
- La vista móvil fue probada a 390 px sin desbordamiento horizontal.
- La búsqueda reconoce tildes, sinónimos y errores frecuentes como `cubito`, `cubo`, `cabeza`, `aifon` y `samsun`.
- Las fichas tienen tres paneles interactivos: razones para elegirlo, conozca el producto y ficha técnica.
- El CRUD utiliza logos oficiales y contiene controles para productos, calidad, banners, promociones, ubicaciones, WhatsApp e integraciones.
- El sitemap responde correctamente en `/sitemap.xml`.
- La configuración privada local está excluida de Git.

Auditoría del catálogo al 17 de agosto de 2026:

- 680 fichas registradas.
- 171 sin imagen principal.
- 116 sin UPC.
- 9 sin precio de detalle válido.
- 41 sin precio de mayoreo válido.
- 266 sin color.

Las fichas incompletas no deben publicarse hasta corregirse. No invente UPC, SKU, precio, stock, compatibilidad o especificaciones.

## 3. Acceso seguro al CRUD

Cuentas autorizadas actualmente:

- `administracion@tecpoint.ws`
- `marketing@tecpoint.ws`
- `tecpointdistribucion2@gmail.com`

Para ingresar:

1. Abra `https://crud-tecpoint.vercel.app/login`.
2. Use correo y contraseña o el botón de Google.
3. Si Google muestra `The requested action is invalid`, complete la configuración de Firebase descrita en la sección 10.
4. Si una cuenta válida no entra, confirme su registro en Firebase Authentication y su rol administrativo en Firestore.

## 4. Productos

Flujo recomendado:

1. Abra **Productos > Calidad y duplicados**.
2. Filtre por sin imagen, sin UPC, incompleto o duplicado.
3. Use **Corregir** para abrir la ficha exacta.
4. Complete únicamente datos confirmados por empaque, factura, proveedor o archivo maestro.
5. Verifique nombre, SKU, UPC, slug, descripción, categoría, marca, precio e imagen.
6. Revise la compatibilidad antes de publicar.

Reglas:

- Un SKU identifica una sola variante comercial.
- Un UPC no debe repetirse entre productos diferentes.
- Las variantes de color o modelo deben conservar su propio SKU y UPC cuando el proveedor los asigna.
- Una imagen debe mostrar exactamente el producto publicado.
- Los productos incompletos permanecen fuera del catálogo público.

## 5. Banners, videos y promociones flash

En **Contenido web > Banners y promociones** puede administrar:

- Banner de escritorio.
- Banner móvil.
- Video de campaña.
- Poster del video.
- Promoción flash.
- Enlace y llamada a la acción.
- Orden, fecha de inicio, fecha final y estado activo.

Buenas prácticas:

- Use una pieza independiente para escritorio y móvil.
- No coloque texto importante pegado a los bordes.
- Comprima las imágenes antes de subirlas.
- Para video use MP4 H.264, sin audio automático y con poster.
- Compruebe el enlace antes de activar.
- Desactive promociones vencidas en vez de reutilizar información incorrecta.

## 6. WhatsApp y ubicaciones

En **Integraciones y contacto** se pueden cambiar números, direcciones y enlaces de Google Maps sin editar código.

Antes de guardar:

- Use el número completo con código `504`, sin espacios.
- Pegue un enlace oficial de Google Maps.
- Confirme ciudad, centro comercial, nivel, calle y horario.
- Pruebe cada botón desde un teléfono.

La fotografía de Mayoreo y Pick Up debe sustituirse únicamente cuando exista una imagen comprobada de la sede de Barrio Los Andes.

## 7. Meta Pixel

Identificador configurado: `328989509304103`.

Eventos esperados:

- PageView
- ViewContent
- Search
- AddToCart
- InitiateCheckout
- Purchase
- ViewCategory como evento personalizado

Pasos que requieren acceso de propietario:

1. Abra Meta Events Manager.
2. Seleccione el conjunto de datos de TECPOINT.
3. En **Configuración > Permisos de tráfico**, permita `tecpoint.ws`.
4. Abra **Probar eventos**.
5. Visite la tienda, busque un producto, abra la ficha y agréguelo al carrito.
6. Confirme que los eventos aparezcan una sola vez y con el identificador correcto.
7. No active campañas de conversión hasta comprobar ViewContent, AddToCart y Purchase.

## 8. Google Analytics 4 y Search Console

GA4 configurado: `G-43E14570X3`.

Search Console: `https://tecpoint.ws/`.

Después de cada publicación importante:

1. Abra Search Console.
2. Inspeccione la página principal y una ficha nueva.
3. Solicite indexación si la URL aún no está registrada.
4. Revise que `/sitemap.xml` figure como procesado.
5. Revise Core Web Vitals con datos reales; una prueba local no sustituye medición de producción.
6. En GA4 Realtime confirme visitas, búsqueda, producto, carrito y compra.

## 9. Publicación y recuperación

Comandos de validación de la tienda:

```powershell
npm install
npm run lint
npm run build
npm run catalog:audit
```

Comandos de validación del CRUD:

```powershell
pnpm install
pnpm lint
pnpm build
```

Publicación normal:

1. Revise `git status` y `git diff`.
2. Haga un commit descriptivo.
3. Envíe `main` a GitHub.
4. Vercel desplegará el repositorio conectado.
5. Revise el deployment y pruebe móvil, escritorio, login, búsqueda, producto, carrito y CRUD.

Si el despliegue falla, no borre datos ni fuerce versiones. Revierta el commit o promueva el último deployment estable desde Vercel.

## 10. Firebase: pasos de propietario

Para reparar el acceso con Google:

1. Abra Firebase Console > proyecto `tecpoint-2024`.
2. Entre en Authentication > Settings > Authorized domains.
3. Agregue `crud-tecpoint.vercel.app` y el dominio final del CRUD si cambia.
4. Entre en Authentication > Sign-in method y habilite Google.
5. Seleccione el correo de soporte oficial.
6. Pruebe de nuevo en una ventana privada.

Para funciones administrativas del servidor:

1. Abra Vercel > proyecto TECPOINT > Settings > Environment Variables.
2. Confirme que las variables de Firebase Admin correspondan al mismo proyecto.
3. La clave privada debe conservar los saltos de línea correctamente; nunca la copie a Git.
4. Vuelva a desplegar y pruebe la operación administrativa.

## 11. Seguridad

- No comparta contraseñas por WhatsApp o correo sin cifrado.
- Active autenticación de dos factores en Google, Meta, GitHub, Firebase y Vercel.
- Dé acceso solo a las personas que lo necesitan.
- Retire accesos de exempleados inmediatamente.
- No ejecute `npm audit fix --force` ni migraciones mayores directamente en producción.
- Rote cualquier secreto que se haya mostrado accidentalmente.
- Mantenga un registro de quién publica productos, banners y configuraciones.

## 12. Prompt operativo para futuras mejoras

Use este texto al solicitar cambios técnicos:

> Actúa como desarrollador senior de TECPOINT. Inspecciona ambos repositorios antes de editar. Conserva los logos oficiales y los datos comerciales confirmados. No inventes SKU, UPC, precios, stock ni compatibilidades. Mantén blanco y rojo como colores predominantes y el negro como contraste. Corrige primero seguridad, datos, accesibilidad, responsive y rendimiento. Ejecuta lint y build en la tienda y el CRUD, prueba móvil y escritorio, separa la validación local de la publicación y documenta cualquier paso que requiera permisos de propietario. No publiques ni migres dependencias mayores sin revisar el impacto.

## 13. Lista de cierre

- [ ] Tienda y CRUD compilan.
- [ ] No hay imágenes rotas.
- [ ] No hay texto cortado ni contraste incorrecto.
- [ ] Banners se adaptan a móvil.
- [ ] Búsqueda encuentra sinónimos y errores comunes.
- [ ] Productos incompletos están ocultos.
- [ ] Enlaces de Maps y WhatsApp funcionan.
- [ ] Meta Test Events recibe eventos.
- [ ] GA4 Realtime recibe actividad.
- [ ] Sitemap procesado por Search Console.
- [ ] Variables privadas no están en Git.
- [ ] Deployment estable en Vercel.
