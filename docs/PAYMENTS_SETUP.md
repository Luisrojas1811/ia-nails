# Configurar Mercado Pago (hacer con Iara en la videollamada)

## 1. Cuenta y aplicación
1. La cuenta de Mercado Pago es de Iara, verificada (identidad y cuenta bancaria).
2. Entrar a **mercadopago.com.ar/developers → Tus integraciones → Crear aplicación**.
   Producto: **Checkout Pro**.
3. Las credenciales **no se mandan por chat ni se suben al repositorio**: se pegan directo en Vercel y en `.env.local`.

## 2. Pruebas (antes de cobrar de verdad)
1. Usar las credenciales de **prueba** y crear usuarios de prueba (vendedor y comprador) desde el panel.
2. Cargar en Vercel (entorno Preview): `MP_ACCESS_TOKEN` (de prueba), `MP_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` (URL https del preview) y `NEXT_PUBLIC_CHECKOUT_ENABLED=true`.
3. Panel de MP → **Webhooks → Configurar notificaciones**: URL `https://<preview>/api/webhooks/mercadopago`, evento **Pagos**. Copiar la **clave secreta** a `MP_WEBHOOK_SECRET`.
4. Casos a probar con tarjetas de prueba: pago aprobado, rechazado y pendiente. Verificar en cada uno:
   - la orden cambia de estado en la tabla `orders`;
   - con pago aprobado aparece la fila en `enrollments` y el curso en Mis cursos;
   - si se repite el aviso (botón "Simular" del panel), no se duplica nada.
5. Probar un reembolso desde el panel de MP: el acceso se revoca.

## 3. Salida a producción
- Credenciales **de producción** en Vercel (entorno Production) y el webhook apuntando al dominio real.
- `NEXT_PUBLIC_SITE_URL` = dominio real. Redeploy.
- Una compra real de monto bajo para confirmar todo el circuito, y reembolsarla.
- Recién ahí: `NEXT_PUBLIC_CHECKOUT_ENABLED=true` en Production.

## Notas
- Los avisos (webhooks) solo llegan a una URL pública https: en `localhost` no funcionan. Probar siempre sobre el preview de Vercel.
- La web nunca confía en lo que trae el aviso: consulta el pago a la API de MP y compara monto y moneda con la orden.
- Si en los logs aparece "monto o moneda no coinciden", hay dinero recibido sin acceso otorgado: revisar a mano.
