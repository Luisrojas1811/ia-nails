# Videos con Bunny Stream

## Una sola vez
1. Crear la cuenta de Bunny (al principio la paga Luis; después se puede pasar a la de Iara) y una **Video Library** llamada `ia-nails`.
2. En la library → **Security**: activar **Embed view token authentication** y copiar esa clave (no es la API key).
   Con esto, un link de video sin firma da error 403: solo la web puede generar links válidos.
3. En **Security → Allowed domains**: agregar el dominio de la web (y `ia-nails-lpwe.vercel.app` mientras tanto).
4. Variables en `.env.local` y en Vercel (y redeploy):
   `BUNNY_STREAM_LIBRARY_ID` (número de la library) y `BUNNY_STREAM_TOKEN_AUTH_KEY` (la clave del paso 2).

## Por cada video
1. Subir el archivo a la library (arrastrar al panel). Esperar a que termine de procesarse.
2. Copiar el **Video ID** (formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. En Supabase, SQL Editor, cargar la clase y su video (reemplazar los textos entre comillas):

```sql
with l as (
  insert into public.lessons (course_id, position, title, duration_seconds)
  select id, 1, 'Título de la clase', 900 from public.courses where slug = 'capping-polygel'
  returning id
)
insert into public.lesson_videos (lesson_id, bunny_video_id)
select id, 'PEGAR-ACA-EL-VIDEO-ID' from l;
```

Una clase por vez, con `position` 1, 2, 3… dentro de cada curso. Si una clase ya existe y solo falta el video, usar `insert into public.lesson_videos (lesson_id, bunny_video_id) values ('<id de la clase>', '<video id>');`.

## Notas
- La web firma un link nuevo cada vez que se abre una clase, válido por 2 horas.
- Si la persona no compró el curso, la base no le devuelve el video ni el id (RLS).
- Nada impide que alguien grabe la pantalla; protegemos que los links no se compartan ni se descarguen fácil.
