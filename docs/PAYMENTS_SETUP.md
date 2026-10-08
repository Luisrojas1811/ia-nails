# Configurar Mercado Pago (hacer con Iara en la videollamada)

Panel: mercadopago.com.ar/developers → **Tus integraciones**. Dentro de cada aplicación el menú tiene
Credenciales, Pruebas (Cuentas de prueba y Tarjetas de prueba) y Webhooks.

## 1. Crear la aplicación (Iara, con su cuenta verificada)
1. **Tus integraciones → Crear aplicación.** Nombre: "IA Nails web". Producto: **Checkout Pro**.
2. Las aplicaciones nuevas de Checkout Pro reciben **credenciales de prueba automáticas** (Access Token y Public Key de prueba).
3. Las credenciales **de producción** las maneja solo Iara y nunca se mandan por chat. Las de prueba se pueden copiar directo a Vercel durante la llamada.

## 2. Cuentas de prueba
1. Aplicación → **Pruebas → Cuentas de prueba → + Crear cuenta de prueba**: crear **dos**, una **vendedor** y una **comprador** (hasta 15, no se pueden borrar).
2. Si al entrar con una cuenta de prueba pide un código de 6 dígitos, está en Tus integraciones → tu aplicación → Pruebas → Cuentas de prueba.
3. **Pruebas → Tarjetas de prueba:** ahí figuran los números y el nombre de titular que fuerza cada resultado (aprobado, rechazado, pendiente).

## 3. Webhook
1. Aplicación → **Webhooks → Configurar notificaciones.**
2. URL del modo de pruebas: `https://ia-nails-lpwe.vercel.app/api/webhooks/mercadopago` (después, la del dominio real en modo productivo).
3. Evento: **Pagos**. Guardar y revelar la **clave secreta** → va a `MP_WEBHOOK_SECRET`.

## 4. Variables en Vercel (Production) y redeploy
`MP_ACCESS_TOKEN` (de prueba), `MP_WEBHOOK_SECRET`, `NEXT_PUBLIC_CHECKOUT_ENABLED=true`. Redeploy: se aplican solo a despliegues nuevos.
Si la página de pago de prueba no abre bien: `MP_USE_SANDBOX=true` y redeploy.

## 5. Casos a probar (comprando con un usuario normal de la web, pagando con la cuenta de prueba compradora)
- **Aprobado:** `orders` pasa a `paid`, aparece la fila en `payments` y en `enrollments`.
- **Rechazado:** `orders` pasa a `failed` y **no** hay `enrollments`.
- **Pendiente:** la orden queda `pending`, sin acceso.
- **Aviso repetido** (botón de reenviar del panel de Webhooks): no se duplica nada.
- **Reembolso** desde el panel: `orders` pasa a `refunded` y el `enrollment` queda `revoked`.

## 6. Al terminar las pruebas
Poner `NEXT_PUBLIC_CHECKOUT_ENABLED=false` y redeploy, hasta el lanzamiento.

## Salida a producción
- Credenciales **de producción** en Vercel (Production), webhook en modo productivo con el dominio real, `NEXT_PUBLIC_SITE_URL` real y redeploy.
- Una compra real de monto bajo para confirmar todo el circuito, y reembolsarla.
- Recién ahí: `NEXT_PUBLIC_CHECKOUT_ENABLED=true`.

## Notas
- Los avisos solo llegan a una URL pública https: en `localhost` no funcionan.
- La web nunca confía en lo que trae el aviso: consulta el pago a la API de MP y compara monto y moneda con la orden.
- Si en los logs aparece "monto o moneda no coinciden", hay dinero recibido sin acceso otorgado: revisar a mano.
