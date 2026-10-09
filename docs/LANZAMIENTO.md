# Lista de verificación para el lanzamiento

Marcar cada punto recién cuando se comprobó. **No se lanza con puntos sin tildar** en las secciones de pagos, legales y seguridad.

## 1. Contenido y marca
- [ ] Nombre de la marca definido y escrito igual en todo el sitio (hoy conviven "IA NAILS", "Ia Nails" e "IaNails")
- [ ] Mail de contacto confirmado (`src/lib/site.ts`)
- [ ] Portadas de los 5 cursos (faltan Capping Polygel, Nail Art inicial y Nail Art nivel 2)
- [ ] Retrato de Iara para "Sobre mí" (hoy hay una selfie provisoria)
- [ ] Logo vectorial o PNG transparente de origen (el actual se limpió desde una imagen con fondo dibujado)
- [ ] Favicon e imagen para compartir en redes con la marca real (hoy son provisorios)
- [ ] `npm run check:launch` termina sin datos pendientes

## 2. Legal
- [ ] Datos del titular cargados: nombre o razón social, DNI o CUIT, condición fiscal
- [ ] Un abogado o contador revisó términos, privacidad y devoluciones
- [ ] Decidido cuándo se considera "usado" un curso (reembolsos)
- [ ] Consultado si hay que inscribir la base de datos y si corresponde el enlace de Defensa del Consumidor
- [ ] Botón de arrepentimiento en un lugar visible desde el primer acceso (hoy está en el pie de página: confirmar que alcanza)
- [ ] Decidido cómo se entrega el certificado virtual

## 3. Cuentas de servicios (a nombre de Iara)
- [ ] **Supabase en plan pago** (los proyectos gratuitos se pausan solos y no tienen copias automáticas)
- [ ] **Vercel en plan Pro** (el plan gratuito no permite uso comercial)
- [ ] Dominio registrado a nombre de Iara y apuntando a Vercel
- [ ] Cuentas de Mercado Pago, Resend y Bunny a nombre de Iara, con Luis como colaborador donde se pueda

## 4. Pagos (Mercado Pago)
- [ ] Credenciales **de producción** cargadas en Vercel (Production)
- [ ] Webhook configurado en **modo productivo** con la dirección real y su nueva clave secreta
- [ ] `MP_USE_SANDBOX` apagado o eliminado
- [ ] **Compra real de monto bajo** hecha de punta a punta: aprobada, curso habilitado, mail recibido
- [ ] Esa compra **reembolsada** desde el panel y el acceso se desactivó solo
- [ ] Recién después: `NEXT_PUBLIC_CHECKOUT_ENABLED=true` en Production

## 5. Cuentas y mails
- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio real
- [ ] Supabase → Authentication → URL Configuration: *Site URL* y *Redirect URLs* con el dominio real
- [ ] Plantillas de mail de Supabase con los links de `docs/AUTH_SETUP.md`
- [ ] SMTP de Supabase con Resend y dominio verificado
- [ ] `RESEND_API_KEY`, `EMAIL_FROM` y `NOTIFY_EMAIL` cargados
- [ ] Probados con mail real: registro, recuperar contraseña, compra y arrepentimiento

## 6. Videos
- [ ] Web publicada **antes** de activar la autenticación por token en Bunny
- [ ] Autenticación por token activada y dominio real en Allowed domains
- [ ] Clases y videos de cada curso cargados
- [ ] Reproducción comprobada con una cuenta que compró el curso
- [ ] Clases de ejemplo borradas (`demo-lessons.sql`)

## 7. Seguridad y calidad
- [ ] `npm test`, `npm run lint` y `npm run typecheck` en verde, y el CI de GitHub en verde
- [ ] Supabase → Advisors (seguridad) sin errores
- [ ] Ninguna clave se subió a GitHub ni se compartió por chat (si pasó, rotarla)
- [ ] Usuarios, compras y solicitudes de prueba eliminados (en este orden: `payments`, `enrollments`, `orders`)
- [ ] Captcha en el botón de arrepentimiento (**pendiente de construir**)
- [ ] Revisión de accesibilidad y contraste (**pendiente**)
- [ ] Probado todo desde un celular real

## 8. Buscadores
- [ ] Quitar el bloqueo: en `src/app/layout.tsx`, la línea `robots: { index: false, follow: false }` (tiene un TODO)
- [ ] Mapa del sitio y `robots.txt` (**pendientes de construir**)
- [ ] Que no quede ninguna página de prueba publicada

## 9. Día del lanzamiento y después
- [ ] Mirar Vercel → Logs durante las primeras horas
- [ ] Segunda ronda de ajustes de diseño
- [ ] Traspaso: guía entregada y cuentas a nombre de Iara
- [ ] Saldo final según la propuesta
