-- Solicitudes del Botón de Arrepentimiento (Disposición 954/2025).
-- No requiere cuenta: las escribe solo el servidor (service role), por eso no hay políticas RLS.
create table public.withdrawal_requests (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  full_name    text not null,
  email        text not null,
  reference    text not null,
  status       text not null default 'received' check (status in ('received','processed','rejected')),
  notes        text,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.withdrawal_requests enable row level security;
