-- IA NAILS: esquema inicial (cursos, accesos, pagos y progreso).
-- Regla de oro: el acceso a un curso se decide SOLO por public.enrollments.
-- Los pagos y las inscripciones los escribe únicamente el servidor (service role).

-- ── Utilidades ────────────────────────────────────────────────────────────
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

-- ── Perfiles (1 a 1 con auth.users) ───────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Catálogo ──────────────────────────────────────────────────────────────
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  summary      text not null default '',
  price_ars    numeric(12,2) not null check (price_ars >= 0),
  level        text,
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger courses_updated before update on public.courses
  for each row execute function public.set_updated_at();

-- Lecciones: títulos públicos (sirven de temario). El video va en otra tabla.
create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid not null references public.courses (id) on delete cascade,
  position         int not null,
  title            text not null,
  duration_seconds int check (duration_seconds >= 0),
  is_preview       boolean not null default false,
  unique (course_id, position)
);

-- El id del video en Bunny solo lo ven quienes tienen acceso (o lecciones de muestra).
create table public.lesson_videos (
  lesson_id      uuid primary key references public.lessons (id) on delete cascade,
  bunny_video_id text not null
);

-- ── Compras ───────────────────────────────────────────────────────────────
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id),
  course_id  uuid not null references public.courses (id),
  amount     numeric(12,2) not null check (amount >= 0), -- precio al momento de comprar
  currency   text not null default 'ARS',
  status     text not null default 'pending'
             check (status in ('pending','paid','failed','cancelled','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders (id),
  provider            text not null default 'mercadopago',
  provider_payment_id text not null,
  status              text not null,
  status_detail       text,
  amount              numeric(12,2),
  raw                 jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (provider, provider_payment_id) -- idempotencia: un pago se registra una sola vez
);
create index payments_order_idx on public.payments (order_id);
create trigger payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- Registro de avisos (webhooks) recibidos, para auditoría y para no procesarlos dos veces.
create table public.webhook_events (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null default 'mercadopago',
  event_key    text not null,
  payload      jsonb,
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, event_key)
);

-- ── Acceso ────────────────────────────────────────────────────────────────
create table public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id),
  course_id  uuid not null references public.courses (id),
  order_id   uuid references public.orders (id),
  status     text not null default 'active' check (status in ('active','revoked')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz, -- null = de por vida (decisión pendiente con Iara)
  revoked_at timestamptz,
  unique (user_id, course_id)
);

create function public.has_course_access(p_course_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.enrollments e
    where e.user_id = (select auth.uid())
      and e.course_id = p_course_id
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

create table public.lesson_progress (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_lesson_idx on public.lesson_progress (lesson_id);

-- ── Seguridad a nivel de fila (RLS) ───────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.lesson_videos   enable row level security;
alter table public.orders          enable row level security;
alter table public.payments        enable row level security;
alter table public.webhook_events  enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;

-- payments y webhook_events: sin políticas = ningún cliente puede leerlas ni escribirlas.

create policy profiles_select_own on public.profiles for select
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy courses_read_published on public.courses for select
  using (is_published);

create policy lessons_read_published on public.lessons for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.is_published));

create policy lesson_videos_read_with_access on public.lesson_videos for select
  using (exists (
    select 1 from public.lessons l
    where l.id = lesson_id and (l.is_preview or public.has_course_access(l.course_id))
  ));

create policy orders_select_own on public.orders for select
  using ((select auth.uid()) = user_id);

create policy enrollments_select_own on public.enrollments for select
  using ((select auth.uid()) = user_id);

create policy progress_select_own on public.lesson_progress for select
  using ((select auth.uid()) = user_id);
create policy progress_insert_own on public.lesson_progress for insert
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.lessons l where l.id = lesson_id and public.has_course_access(l.course_id))
  );
create policy progress_delete_own on public.lesson_progress for delete
  using ((select auth.uid()) = user_id);
