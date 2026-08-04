# Centro comercial TECPOINT

## Objetivo

Centralizar conversaciones y pedidos para que cada contacto pueda ser asignado
a un asesor, atendido y medido sin compartir contraseñas personales.

## Estado actual

- La ruta `/admin/comercial` ya contiene la interfaz inicial.
- El acceso exige una cuenta de Firebase con el claim `role` igual a `admin` o
  `advisor`.
- La interfaz escucha las colecciones `sales_conversations` y `sales_orders`.
- No se reciben mensajes reales hasta conectar los canales oficiales mediante
  webhooks seguros.

## Colecciones

### `referral_codes`

- El identificador del documento es el código normalizado en mayúsculas.
- `ownerName`: empleado, influencer o responsable del código.
- `ownerType`: `employee`, `influencer` o `tecpoint`.
- `discountPercent`: actualmente fijo en `15`.
- `active`: permite pausar el código sin eliminar su historial.
- `uses`: contador acumulado de usos registrados.
- `updatedAt`: timestamp del servidor.

Los códigos iniciales son `JORGE15`, `BENJAMIN15`, `EDGAR15`, `JOHANNA15`,
`GLADIS15`, `ANGELO15`, `IRANIA15` y `SANDY15`. Se inicializan desde
`/admin/codigos`; repetir la inicialización no reinicia los contadores.

### `referral_redemptions`

- `code`, `ownerName` y `ownerType`.
- `discountPercent`, `subtotal`, `discount` y `total` calculados en el servidor.
- `items`: nombre, SKU, cantidad y precio verificados contra el catálogo actual.
- `channel` y `location`.
- `status`: inicialmente `ordered`.
- `timezone`: `America/Tegucigalpa`.
- `createdAt`: fecha y hora del servidor.

La pantalla `/admin/codigos` permite crear, activar o pausar códigos y consultar
los últimos 100 usos. Solamente acepta cuentas con el claim `role: admin`.

### `sales_conversations`

- `channel`: `whatsapp`, `instagram`, `messenger` o `web`.
- `customerName`: nombre visible del cliente.
- `customerId`: identificador entregado por el canal.
- `lastMessage`: último texto resumido.
- `status`: `new`, `assigned`, `waiting` o `closed`.
- `assignedTo`: UID del asesor.
- `assignedName`: nombre visible del asesor.
- `updatedAt`: timestamp del servidor.

### `sales_orders`

- `customerName`
- `customerId`
- `advisorId`
- `conversationId`
- `status`: `draft`, `confirmed`, `paid`, `completed` o `cancelled`.
- `items`: productos, SKU, cantidad y precio vigente.
- `total`
- `createdAt`
- `updatedAt`

## Seguridad obligatoria antes de activarlo

1. Configurar roles mediante Firebase Admin; nunca desde el navegador.
2. Crear reglas de Firestore que permitan leer y escribir estas colecciones
   solamente a `admin` y `advisor`.
3. Recibir mensajes de Meta en una función de servidor que valide la firma del
   webhook.
4. Guardar tokens y secretos únicamente como variables cifradas en Vercel.
5. Registrar en cada cambio el asesor, la fecha y el estado anterior.
6. No guardar números de tarjeta, contraseñas ni documentos sensibles.

## Integraciones previstas

- WhatsApp Business Platform para conversaciones oficiales.
- Instagram Messaging y Messenger mediante la cuenta empresarial de Meta.
- Pedidos del carrito web.
- Meta Pixel y Google Analytics para eventos del navegador.
- Conversions API y eventos de servidor cuando exista confirmación real del
  pedido o pago.

## Variables que se agregarán en Vercel

- `META_APP_ID`
- `META_APP_SECRET`
- `META_VERIFY_TOKEN`
- `META_ACCESS_TOKEN`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Los valores no deben copiarse al repositorio ni enviarse por chat. Se cargan
directamente en la configuración segura del proyecto en Vercel.

## Criterio de conversión

- Abrir WhatsApp desde el carrito: `begin_checkout` / `InitiateCheckout`.
- Pedido confirmado por asesor: evento de lead o pedido confirmado.
- Pago verificado por el proveedor: `purchase` / `Purchase`.

Nunca se registra una compra por visitar una página o presionar un botón.
