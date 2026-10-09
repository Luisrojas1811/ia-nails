# Mails automáticos (Resend)

La web manda por mail, de forma automática:
- **A quien compra:** confirmación con el link directo a su curso (una sola vez por compra).
- **A quien se arrepiente:** su código de identificación (la norma pide confirmarlo dentro de las 24 horas).
- **A Iara (`NOTIFY_EMAIL`):** aviso de cada solicitud de arrepentimiento y alerta si un pago no coincide con la orden.

Si no están configuradas las variables de abajo, **la web funciona igual** pero no manda mails: el código del arrepentimiento solo se muestra en pantalla.

## 1. Cuenta y dominio (requiere el dominio)
1. Crear la cuenta en resend.com (plan gratuito; verificar los límites vigentes).
2. **Domains → Add Domain** con el dominio de la web. Resend muestra unos registros DNS (SPF y DKIM).
3. Cargar esos registros donde esté administrado el DNS del dominio y tocar **Verify**. Puede tardar un rato.
4. **API Keys → Create API Key** con permiso de envío ("Sending access"). Copiar la clave: se muestra una sola vez.

## 2. Variables (Vercel → Production, y `.env.local` si se prueba local) + Redeploy
- `RESEND_API_KEY`: la clave del paso 4.
- `EMAIL_FROM`: `IA Nails <hola@tudominio.com.ar>` (tiene que ser del dominio verificado).
- `NOTIFY_EMAIL`: el mail de Iara que recibe los avisos internos.

## 3. Mails de cuenta de Supabase (confirmar cuenta y recuperar contraseña)
Son otros mails: los manda Supabase, no la web. Para que salgan con el dominio propio y sin el límite de 2 por hora:
**Supabase → Authentication → SMTP Settings → Enable custom SMTP**
- Host: `smtp.resend.com`
- Puerto: `465` (o `587`)
- Usuario: `resend`
- Contraseña: la misma API key de Resend
- Remitente: `hola@tudominio.com.ar` y el nombre "IA Nails"

## 4. Cómo probar
1. **Arrepentimiento:** enviar el formulario de `/arrepentimiento` con un mail propio. Tienen que llegar dos mails: uno a la persona (con el código) y otro a `NOTIFY_EMAIL`. Después borrar la fila de prueba en `withdrawal_requests`.
2. **Compra:** con Mercado Pago en modo prueba, una compra aprobada manda la confirmación al mail de la cuenta compradora.
3. **Sin dominio todavía:** Resend permite probar con el remitente `onboarding@resend.dev`, pero según su documentación solo entrega al mail de la propia cuenta de Resend.

## Si algo no llega
- En Resend → **Emails** se ve cada envío y su estado.
- En los registros de Vercel (**Logs**) buscar `[email]`: `403`/`401` = clave inválida o dominio sin verificar.
- Revisar la carpeta de spam. Con el dominio bien verificado (SPF y DKIM) no debería caer ahí.
- Un mail que falla **nunca** frena una compra ni un formulario: la compra y el curso se habilitan igual.

## Seguridad
Todo lo que escribe una persona se escapa antes de ponerlo en un mail, y en los registros no se guarda el destinatario ni el contenido.
