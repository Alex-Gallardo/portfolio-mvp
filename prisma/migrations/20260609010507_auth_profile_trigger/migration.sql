-- ============================================================
--  Trigger handle_new_user — Ticket S2-T3
--  Crea un Profile cuando nace un usuario en auth.users.
-- ============================================================

-- Shadow-DB safe: crea un stub de auth.users SOLO si no existe.
-- En tu base real de Supabase ya existe → este bloque no la toca.
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'auth' and table_name = 'users'
  ) then
    create schema if not exists auth;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      email varchar,
      raw_user_meta_data jsonb
    );
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."Profile" (id, email, "fullName", role, "createdAt")
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'EDITOR'::"Role",
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();