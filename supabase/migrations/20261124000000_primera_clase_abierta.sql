-- Política de devoluciones (opción A): un curso cuenta como "usado" cuando la alumna abre su primera clase.
-- Guardamos ese momento para poder decidir cada solicitud de arrepentimiento.
alter table public.enrollments add column first_lesson_opened_at timestamptz;
comment on column public.enrollments.first_lesson_opened_at is
  'Primera vez que la alumna abrió una clase con video. Si es null, el curso no se usó y el arrepentimiento aplica.';

-- La alumna no puede editar su inscripción: solo puede registrar la primera apertura, una vez y con la hora del servidor.
create function public.mark_course_opened(p_course_id uuid) returns void
language sql volatile security definer set search_path = '' as $$
  update public.enrollments
     set first_lesson_opened_at = now()
   where user_id = (select auth.uid())
     and course_id = p_course_id
     and status = 'active'
     and first_lesson_opened_at is null;
$$;
revoke execute on function public.mark_course_opened(uuid) from public, anon;
grant execute on function public.mark_course_opened(uuid) to authenticated;
