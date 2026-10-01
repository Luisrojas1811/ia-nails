# Configurar Supabase Auth (hacer en la videollamada con Iara)

1. **Claves:** copiar la URL y la clave pública a `.env.local` y a Vercel (Project → Settings → Environment Variables).
2. **Authentication → Providers → Email:** activado, con "Confirm email" prendido.
3. **Authentication → URL Configuration:**
   - Site URL: la URL de producción.
   - Redirect URLs: agregar `http://localhost:3000/**` y la URL de preview de Vercel.
4. **Authentication → Email Templates** (reemplazar el link de cada plantilla):
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
5. **Authentication → SMTP Settings:** conectar Resend (el envío por defecto de Supabase es solo para pruebas y muy limitado).
6. Antes del lanzamiento: revisar límites de intentos y evaluar un captcha en registro e ingreso.
