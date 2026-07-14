-- ─── @-Erwähnungen in Kommentaren ─────────────────────────────────────────────
-- Additive Tabelle comment_mentions: speichert die erwähnte profile_id, nicht
-- nur den sichtbaren Text. Der Kommentar-Autor legt die Zeilen direkt nach dem
-- Kommentar-Insert an; die Anzeige markiert Erwähnungen über den Kommentartext
-- plus Mitgliederliste, ohne eigene Realtime-Subscription.
--
-- Organisations-Konsistenz wie in 20260712130000: Composite-FK auf
-- comments (id, organization_id), damit eine Erwähnung nie auf einen Kommentar
-- einer anderen Organisation zeigen kann.

alter table public.comments
  add constraint comments_id_org_key unique (id, organization_id);

create table public.comment_mentions (
  comment_id uuid not null,
  mentioned_profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Unique Constraint gegen doppelte Erwähnungen im selben Kommentar.
  primary key (comment_id, mentioned_profile_id),
  foreign key (comment_id, organization_id)
    references public.comments (id, organization_id) on delete cascade
);

create index comment_mentions_profile_idx
  on public.comment_mentions (mentioned_profile_id);
create index comment_mentions_org_idx
  on public.comment_mentions (organization_id);

-- Erwähnbar ist nur, wer Mitglied derselben Organisation ist. Security definer,
-- damit die Policy memberships lesen kann, ohne deren RLS rekursiv auszulösen
-- (gleiches Muster wie is_org_member/has_org_role).
create or replace function public.profile_is_org_member(profile_id uuid, org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = profile_id
  );
$$;

revoke all on function public.profile_is_org_member (uuid, uuid) from public, anon;
grant execute on function public.profile_is_org_member (uuid, uuid) to authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.comment_mentions enable row level security;

create policy "comment_mentions_select_member"
  on public.comment_mentions for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Nur der Autor des Kommentars legt Erwähnungen an, nur für Mitglieder
-- derselben Organisation. Kein UPDATE/DELETE für Endnutzer: Erwähnungen sind
-- Teil des unveränderlichen Kommentarinhalts und verschwinden per Cascade,
-- wenn der Kommentar gelöscht wird.
create policy "comment_mentions_insert_author"
  on public.comment_mentions for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, array['seeszn_admin', 'kluehspies_editor'])
    and public.profile_is_org_member(mentioned_profile_id, organization_id)
    and exists (
      select 1
      from public.comments c
      where c.id = comment_id
        and c.organization_id = comment_mentions.organization_id
        and c.profile_id = (select auth.uid())
    )
  );

-- ── GRANTs (Default Privileges sind seit 20260712130100 leer) ─────────────────
grant select, insert, update, delete on public.comment_mentions to service_role;
grant select, insert on public.comment_mentions to authenticated;

-- organization_id bleibt wie überall unveränderlich.
create trigger comment_mentions_lock_org
  before update on public.comment_mentions
  for each row
  execute function public.prevent_org_change();
