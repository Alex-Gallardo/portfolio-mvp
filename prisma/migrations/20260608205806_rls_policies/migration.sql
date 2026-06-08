-- ============================================================
--  RLS POLICIES — Ticket S2-T2
--  Las tablas van entre comillas dobles porque son PascalCase.
-- ============================================================

-- ============================================================
--  Shadow-DB safe: la shadow database de Prisma no tiene el esquema
--  "auth" de Supabase. Creamos un STUB de auth.uid() SOLO si no existe.
--  En la base real de Supabase ya existe → este bloque no la toca.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'auth' and p.proname = 'uid'
  ) then
    create schema if not exists auth;
    execute 'create function auth.uid() returns uuid language sql stable as $f$ select null::uuid $f$';
  end if;
end
$$;

-- ---------- Helpers de rol ----------
-- SECURITY DEFINER es OBLIGATORIO aquí: hace que la función lea "Profile"
-- como el dueño (postgres), ignorando el RLS de "Profile". Sin esto, la
-- política de "Profile" llamaría a is_admin(), que lee "Profile" otra vez
-- → recursión infinita.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from "Profile" where id = auth.uid() and role = 'ADMIN');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from "Profile" where id = auth.uid() and role in ('ADMIN','EDITOR'));
$$;

-- ============================================================
--  1) ACTIVAR RLS EN TODAS LAS TABLAS
-- ============================================================
alter table "Profile"           enable row level security;
alter table "Category"          enable row level security;
alter table "Post"              enable row level security;
alter table "Service"           enable row level security;
alter table "Project"           enable row level security;
alter table "Resource"          enable row level security;
alter table "ResourceFile"      enable row level security;
alter table "ProjectImage"      enable row level security;
alter table "PostAttachment"    enable row level security;
alter table "ServiceAttachment" enable row level security;
alter table "Lead"              enable row level security;
alter table "ResourceDownload"  enable row level security;
alter table "ContactMessage"    enable row level security;
alter table "SiteSetting"       enable row level security;
alter table "ContentBlock"      enable row level security;
alter table "AnalyticsSession"  enable row level security;
alter table "AnalyticsEvent"    enable row level security;
alter table "_CategoryToPost"   enable row level security;

-- ============================================================
--  2) CONTENIDO PÚBLICO
--     Lectura: publicado (anónimo) o staff. Escritura: staff.
-- ============================================================
create policy "post_select"  on "Post"  for select using ("status" = 'PUBLISHED' or public.is_staff());
create policy "post_write"   on "Post"  for all    using (public.is_staff()) with check (public.is_staff());

create policy "service_select" on "Service" for select using ("status" = 'PUBLISHED' or public.is_staff());
create policy "service_write"  on "Service" for all    using (public.is_staff()) with check (public.is_staff());

create policy "project_select" on "Project" for select using ("status" = 'PUBLISHED' or public.is_staff());
create policy "project_write"  on "Project" for all    using (public.is_staff()) with check (public.is_staff());

create policy "resource_select" on "Resource" for select using ("status" = 'PUBLISHED' or public.is_staff());
create policy "resource_write"  on "Resource" for all    using (public.is_staff()) with check (public.is_staff());

create policy "category_select" on "Category" for select using (true);
create policy "category_write"  on "Category" for all    using (public.is_staff()) with check (public.is_staff());

-- ============================================================
--  3) ARCHIVOS HIJOS
--     Lectura pública SOLO si su padre está publicado. Escritura: staff.
-- ============================================================
create policy "resourcefile_select" on "ResourceFile" for select using (
  public.is_staff() or exists (select 1 from "Resource" r where r.id = "resourceId" and r."status" = 'PUBLISHED')
);
create policy "resourcefile_write" on "ResourceFile" for all using (public.is_staff()) with check (public.is_staff());

create policy "projectimage_select" on "ProjectImage" for select using (
  public.is_staff() or exists (select 1 from "Project" p where p.id = "projectId" and p."status" = 'PUBLISHED')
);
create policy "projectimage_write" on "ProjectImage" for all using (public.is_staff()) with check (public.is_staff());

create policy "postattachment_select" on "PostAttachment" for select using (
  public.is_staff() or exists (select 1 from "Post" p where p.id = "postId" and p."status" = 'PUBLISHED')
);
create policy "postattachment_write" on "PostAttachment" for all using (public.is_staff()) with check (public.is_staff());

create policy "serviceattachment_select" on "ServiceAttachment" for select using (
  public.is_staff() or exists (select 1 from "Service" s where s.id = "serviceId" and s."status" = 'PUBLISHED')
);
create policy "serviceattachment_write" on "ServiceAttachment" for all using (public.is_staff()) with check (public.is_staff());

-- ============================================================
--  4) DATOS SENSIBLES — SIN ACCESO ANÓNIMO
--     Solo el servidor (Prisma) escribe; solo admin lee (vía API).
--     Al NO crear política de insert/anon, el anónimo queda bloqueado.
-- ============================================================
create policy "lead_select_admin"     on "Lead"             for select using (public.is_admin());
create policy "download_select_admin" on "ResourceDownload" for select using (public.is_admin());
create policy "asession_select_admin" on "AnalyticsSession" for select using (public.is_admin());
create policy "aevent_select_admin"   on "AnalyticsEvent"   for select using (public.is_admin());

-- ContactMessage: lo inserta el servidor (/api/contact con Prisma); admin gestiona.
create policy "contact_select_admin" on "ContactMessage" for select using (public.is_admin());
create policy "contact_update_admin" on "ContactMessage" for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================
--  5) CONFIGURACIÓN Y CONTENIDO EDITABLE
-- ============================================================
create policy "sitesetting_select" on "SiteSetting" for select using (true);
create policy "sitesetting_write"  on "SiteSetting" for all    using (public.is_admin()) with check (public.is_admin());

create policy "contentblock_select" on "ContentBlock" for select using ("visible" = true or public.is_admin());
create policy "contentblock_write"  on "ContentBlock" for all    using (public.is_admin()) with check (public.is_admin());

-- ============================================================
--  6) PROFILE — contiene email/rol, NO lectura anónima
--     El nombre del autor para el sitio público se lee vía Prisma (servidor).
-- ============================================================
create policy "profile_select" on "Profile" for select using (id = auth.uid() or public.is_admin());
create policy "profile_write"  on "Profile" for all    using (public.is_admin()) with check (public.is_admin());

-- ============================================================
--  7) Tabla puente N:M (relaciones, no sensible)
-- ============================================================
create policy "catpost_select" on "_CategoryToPost" for select using (true);
create policy "catpost_write"  on "_CategoryToPost" for all    using (public.is_staff()) with check (public.is_staff());