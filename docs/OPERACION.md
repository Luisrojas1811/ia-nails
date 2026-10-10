# Operación del día a día

Todo lo que sigue se hace desde el **SQL Editor** de Supabase (menú izquierdo → SQL Editor → `+`), salvo donde diga lo contrario. Antes de correr algo que modifica datos, mirá bien el `where`.

## Tareas frecuentes

### Cambiar el precio de un curso — OJO: son 3 lugares
El precio que **se muestra** y el que **se cobra** salen de lugares distintos. Si no se cambian los tres, la web dice un precio y cobra otro.
1. `src/lib/courses.ts` → campo `price` (lo que se ve en el sitio).
2. `supabase/seed.sql` → el mismo número (un test falla si no coincide con el paso 1).
3. En Supabase (lo que **realmente se cobra**):
```sql
update public.courses set price_ars = 18000 where slug = 'soft-gel-inicial';
```
Las compras anteriores no cambian: cada orden guarda el precio al que se compró.

### Agregar un curso nuevo
1. `src/lib/courses.ts`: agregar el curso (slug sin tildes ni espacios, nombre, precio, nivel, textos).
2. Portada en `public/images/cursos/<slug>.jpg` (vertical, formato 4:5) y el campo `cover`.
3. `supabase/seed.sql`: agregar la fila.
4. En Supabase:
```sql
insert into public.courses (slug, name, summary, price_ars, is_published, sort_order)
values ('slug-del-curso', 'Nombre del curso', 'Resumen corto', 20000, true, 6);
```
5. Correr `npm test` (los tests detectan si el catálogo y el seed no coinciden o si falta la imagen) y subir.
6. Cargar sus clases y videos: ver [`VIDEOS_SETUP.md`](VIDEOS_SETUP.md).

### Dejar de vender un curso
Quitarlo de `src/lib/courses.ts` y de `supabase/seed.sql`, y en Supabase:
```sql
update public.courses set is_published = false where slug = 'slug-del-curso';
```
Las alumnas que ya lo compraron conservan su acceso.

### Dar acceso a un curso sin compra (cortesía)
```sql
insert into public.enrollments (user_id, course_id, status)
select u.id, c.id, 'active'
from auth.users u, public.courses c
where u.email = 'mail@dealumna.com' and c.slug = 'slug-del-curso'
on conflict (user_id, course_id) do update set status = 'active', revoked_at = null;
```

### Sacar el acceso a un curso
```sql
update public.enrollments set status = 'revoked', revoked_at = now()
where user_id = (select id from auth.users where email = 'mail@dealumna.com')
  and course_id = (select id from public.courses where slug = 'slug-del-curso');
```

### Ver las últimas compras
```sql
select o.created_at, o.status as orden, o.amount, u.email, c.slug, p.provider_payment_id, p.status as pago
from public.orders o
join auth.users u on u.id = o.user_id
join public.courses c on c.id = o.course_id
left join public.payments p on p.order_id = o.id
order by o.created_at desc
limit 20;
```

### Ver las solicitudes de arrepentimiento
```sql
select created_at, code, full_name, email, course_slugs, reference, status
from public.withdrawal_requests
order by created_at desc;
```
Para reintegrar: hacerlo desde el panel de Mercado Pago. Cuando el pago figura como reembolsado, la web desactiva el acceso al curso sola.

### Cambiar datos que no están en la base
| Qué | Dónde |
|---|---|
| WhatsApp, mail, Instagram, horarios, dirección, menú | `src/lib/site.ts` |
| Textos legales | `src/content/legal.ts` |
| Fotos de trabajos y carrusel | `src/lib/works.ts` + `public/images/trabajos/` |
| Colores y tipografías | `src/app/globals.css` y `src/app/layout.tsx` |

### Si una persona real queda bloqueada en el botón de arrepentimiento
El formulario limita a **3 solicitudes por mail por día** y **20 por hora en total** (`src/lib/withdrawal-limits.ts`). Si alguien llega al límite, ve un mensaje que le ofrece WhatsApp. Se libera solo pasadas 24 horas; mientras tanto se puede registrar su solicitud a mano desde el Table Editor (tabla `withdrawal_requests`), con un código de la forma `ARR-AAAAMMDD-XXXXXX`.

## Si algo falla
| Síntoma | Qué mirar |
|---|---|
| **La web no carga o da error** | Vercel → Deployments: ¿el último dice Ready? Si falló, abrir Build Logs |
| **Dice "no pudimos conectar con el servidor"** o no deja ingresar | Supabase → ¿el proyecto está **pausado**? (plan gratuito, tras 7 días sin uso). Entrar al proyecto → **Resume project** |
| **Alguien pagó y no ve el curso** | 1) Tabla `payments`: ¿está el pago? 2) Tabla `orders`: ¿en `paid`? 3) Tabla `enrollments`: ¿está la fila? 4) Mercado Pago → Webhooks: reenviar el aviso. 5) Vercel → Logs: buscar `[MP]`. Si urge, darle acceso a mano (cortesía) |
| **En los logs aparece "monto o moneda no coinciden"** | Hay dinero recibido sin acceso otorgado: revisar el pago en Mercado Pago y la orden; si es válido, dar acceso a mano |
| **No llegan los mails** | Resend → Emails (¿salió?). Vercel → Logs: buscar `[email]` (`401`/`403` = clave o dominio). Revisar spam |
| **El video no se reproduce (error 403)** | Bunny: ¿el dominio está en Allowed domains? ¿`BUNNY_STREAM_TOKEN_AUTH_KEY` es la clave de *Embed view token authentication*? |
| **Un cambio de variable "no hace efecto"** | Hay que hacer **Redeploy** en Vercel: las variables se aplican solo a despliegues nuevos |
| **`npm run typecheck` da error de una página que ya no existe** | Es la memoria temporal: borrar la carpeta `.next` y volver a correrlo |

## Claves: dónde viven y cómo cambiarlas
| Clave | Dónde está cargada |
|---|---|
| Supabase (URL, pública, secreta) | `.env.local` y Vercel. La URL y la pública también como *secrets* de GitHub (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) para la tarea automática |
| Mercado Pago (token y clave del webhook) | Vercel |
| Resend | Vercel (y el SMTP de Supabase, si se configuró) |
| Bunny | Vercel |

**Si una clave se filtra** (se pegó en un chat, se subió a GitHub, etc.): 1) generar una nueva en el panel del servicio, 2) cargarla en Vercel y hacer Redeploy, 3) **revocar la vieja**. No alcanza con borrar el mensaje: hay que considerarla comprometida.

## Copias de seguridad
- **Plan gratuito de Supabase: no hace copias automáticas.** Antes de tener compras reales conviene pasar a un plan pago, que sí las incluye (Pro guarda las de los últimos 7 días).
- Mientras tanto, exportar de vez en cuando las tablas importantes (`orders`, `payments`, `enrollments`, `withdrawal_requests`) desde el Table Editor.

## Monitoreo
- **Tarea automática de GitHub** (`mantener-supabase-activo.yml`): consulta la base lunes y jueves para que no se pause. Si queda en rojo, avisa por mail: significa que el proyecto está pausado o que una clave dejó de servir. Cuando se pase a un plan pago ya no hace falta.
- **Vercel → Logs:** los mensajes importantes empiezan con `[MP]`, `[checkout]`, `[email]` o `[arrepentimiento]`.
