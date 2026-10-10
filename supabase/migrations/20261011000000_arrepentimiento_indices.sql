-- Hacen rápido el conteo del freno anti-spam (solicitudes por mail y por hora).
create index if not exists withdrawal_requests_email_created_idx on public.withdrawal_requests (email, created_at);
create index if not exists withdrawal_requests_created_idx on public.withdrawal_requests (created_at);
