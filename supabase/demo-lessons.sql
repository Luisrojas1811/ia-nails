-- DATOS DE EJEMPLO para probar "Mis cursos" y el reproductor. NO es una migración: se corre a mano, una vez.
-- Agrega 3 clases de prueba (sin video) al curso "capping-polygel". Para borrarlas, ver el final.
insert into public.lessons (course_id, position, title, duration_seconds)
select c.id, v.position, v.title, v.duration_seconds
from public.courses c
cross join (values
  (1, 'Introducción (clase de ejemplo)', 480),
  (2, 'Preparación de la uña natural (clase de ejemplo)', 900),
  (3, 'Colocación y limado (clase de ejemplo)', 1260)
) as v(position, title, duration_seconds)
where c.slug = 'capping-polygel'
on conflict (course_id, position) do nothing;

-- Para borrar los datos de ejemplo:
-- delete from public.lessons where title like '%(clase de ejemplo)';
