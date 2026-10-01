-- Campos del formulario de arrepentimiento: cursos elegidos y comentarios opcionales.
alter table public.withdrawal_requests
  add column course_slugs text[] not null default '{}',
  add column reason text;

alter table public.withdrawal_requests alter column reference drop not null; -- número de compra: opcional
alter table public.withdrawal_requests
  add constraint withdrawal_reason_len check (reason is null or char_length(reason) <= 1000);
