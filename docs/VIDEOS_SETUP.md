# Videos con Bunny Stream

## Una sola vez
1. Crear la cuenta de Bunny **a nombre de Iara** (con Luis invitado como miembro del equipo) y una **Video Library** llamada `ia-nails`.
2. En la library → **Security**: activar **Embed view token authentication** y copiar esa clave (no es la API key).
   Con esto, un link de video sin firma da error 403: solo la web puede generar links válidos.
3. En **Security → Allowed domains**: agregar el dominio de la web (y `ia-nails-lpwe.vercel.app` mientras tanto).
4. Variables en `.env.local` y en Vercel (y redeploy):
   `BUNNY_STREAM_LIBRARY_ID` (número de la library) y `BUNNY_STREAM_TOKEN_AUTH_KEY` (la clave del paso 2).

## Por cada curso (forma recomendada: planilla)
1. Subir los videos a la library (arrastrar al panel) y esperar a que terminen de procesarse.
2. Armar una planilla (Excel o Google Sheets) con estas columnas, una fila por clase, y guardarla como **CSV**.
   Hay un ejemplo en `docs/clases-ejemplo.csv`:

| curso | posicion | titulo | minutos | video_id |
|---|---|---|---|---|
| capping-polygel | 1 | Bienvenida y materiales | 8 | (Video ID de Bunny) |

   - `curso`: el slug (`soft-gel-inicial`, `semipermanente-nivelacion-capping-gel`, `capping-polygel`, `nail-art-inicial`, `nail-art-nivel-2`).
   - `video_id`: el **Video ID** de Bunny (formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). Puede quedar vacío y completarse después.
3. Correr `npm run clases -- ruta/a/la-planilla.csv`. Si hay errores (curso mal escrito, posición repetida, ID con otro formato) los lista y no genera nada.
4. Abrir el `.sql` que se creó al lado de la planilla, copiar todo y pegarlo en Supabase → SQL Editor → **Run**.

Se puede volver a correr las veces que haga falta: si la clase ya existe en esa posición, se actualizan el título, la duración y el video (no se duplica).

## Una clase suelta, a mano
En Supabase, SQL Editor (reemplazar los textos entre comillas):

```sql
with l as (
  insert into public.lessons (course_id, position, title, duration_seconds)
  select id, 1, 'Título de la clase', 900 from public.courses where slug = 'capping-polygel'
  returning id
)
insert into public.lesson_videos (lesson_id, bunny_video_id)
select id, 'PEGAR-ACA-EL-VIDEO-ID' from l;
```

## Notas
- La web firma un link nuevo cada vez que se abre una clase, válido por 2 horas.
- Si la persona no compró el curso, la base no le devuelve el video ni el id (RLS).
- Nada impide que alguien grabe la pantalla; protegemos que los links no se compartan ni se descarguen fácil.
