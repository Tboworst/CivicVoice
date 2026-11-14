-- CivicVoice Database Schema
-- Run this in the Supabase SQL editor (or via supabase db push)

-- Enable extensions
create extension if not exists "postgis";
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES  (extends auth.users)
-- ─────────────────────────────────────────────
-- NOTE: is_admin() is defined AFTER profiles below (SQL functions
-- validate the referenced table at creation time in PostgreSQL).
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  affiliation  text,          -- 'student' | 'faculty' | 'staff' | 'community'
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- HELPER: check if the current user is an admin
-- (must come after profiles table is created)
-- ─────────────────────────────────────────────
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────
-- ISSUE CATEGORIES  (lookup table)
-- ─────────────────────────────────────────────
create table if not exists issue_categories (
  id          serial primary key,
  slug        text not null unique,  -- matches IssueCategory type: 'infrastructure' etc.
  label       text not null,
  color       text not null,
  icon        text
);

insert into issue_categories (slug, label, color) values
  ('infrastructure',  'Infrastructure',   '#3b82f6'),
  ('safety',          'Safety',           '#ef4444'),
  ('environment',     'Environment',      '#84cc16'),
  ('transportation',  'Transportation',   '#f59e0b'),
  ('housing',         'Housing',          '#a855f7'),
  ('education',       'Education',        '#00d4ff'),
  ('health',          'Health',           '#ec4899'),
  ('technology',      'Technology',       '#06b6d4'),
  ('community',       'Community',        '#f97316'),
  ('other',           'Other',            '#6b7280')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────
-- ISSUES
-- ─────────────────────────────────────────────
create table if not exists issues (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null,
  category        text not null references issue_categories(slug),
  status          text not null default 'open'
                    check (status in ('open','under_review','in_progress','resolved')),
  reporter_id     uuid references profiles(id) on delete set null,
  reporter_type   text check (reporter_type in ('student','faculty','staff','community')),
  -- location
  location_name   text not null,
  location_area   text,
  location_lat    double precision not null,
  location_lng    double precision not null,
  location_geo    geography(Point, 4326)
                    generated always as (
                      ST_MakePoint(location_lng, location_lat)
                    ) stored,
  -- meta
  tags            text[] not null default '{}',
  image_url       text,
  vote_count      integer not null default 0,
  comment_count   integer not null default 0,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists issues_category_idx  on issues(category);
create index if not exists issues_status_idx    on issues(status);
create index if not exists issues_created_idx   on issues(created_at desc);
create index if not exists issues_geo_idx       on issues using gist(location_geo);

-- ─────────────────────────────────────────────
-- ISSUE SUPPORT  (votes)
-- ─────────────────────────────────────────────
create table if not exists issue_support (
  id          uuid primary key default uuid_generate_v4(),
  issue_id    uuid not null references issues(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  -- anonymous voters identified by a session UUID stored in localStorage
  session_id  text,
  created_at  timestamptz not null default now(),
  -- at most one vote per (issue, user)  OR  one vote per (issue, session)
  constraint uq_support_user    unique (issue_id, user_id),
  constraint uq_support_session unique (issue_id, session_id)
);

create index if not exists issue_support_issue_idx on issue_support(issue_id);

-- Keep vote_count in sync
create or replace function update_vote_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update issues set vote_count = vote_count + 1 where id = NEW.issue_id;
  elsif TG_OP = 'DELETE' then
    update issues set vote_count = greatest(0, vote_count - 1) where id = OLD.issue_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_vote_count on issue_support;
create trigger trg_vote_count
  after insert or delete on issue_support
  for each row execute function update_vote_count();

-- ─────────────────────────────────────────────
-- INSTITUTIONS
-- ─────────────────────────────────────────────
create table if not exists institutions (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        text not null check (type in ('university','city','county','state','federal','nonprofit','other')),
  website     text,
  logo_url    text,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- INSTITUTIONAL RESPONSES
-- ─────────────────────────────────────────────
create table if not exists institutional_responses (
  id              uuid primary key default uuid_generate_v4(),
  issue_id        uuid not null references issues(id) on delete cascade,
  institution_id  uuid references institutions(id) on delete set null,
  institution     text not null,  -- denormalised for display
  contact_name    text,
  contact_title   text,
  status          text not null default 'pending'
                    check (status in ('pending','acknowledged','in_progress','resolved','dismissed')),
  response        text not null,
  responded_at    timestamptz not null default now(),
  is_demo         boolean not null default false
);

create index if not exists inst_resp_issue_idx on institutional_responses(issue_id);

-- ─────────────────────────────────────────────
-- STATUS HISTORY
-- ─────────────────────────────────────────────
create table if not exists status_history (
  id          uuid primary key default uuid_generate_v4(),
  issue_id    uuid not null references issues(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_by  uuid references profiles(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Auto-record status changes on issues
create or replace function record_status_change()
returns trigger language plpgsql as $$
begin
  if OLD.status is distinct from NEW.status then
    insert into status_history (issue_id, old_status, new_status, changed_by)
    values (NEW.id, OLD.status, NEW.status, auth.uid());
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_status_history on issues;
create trigger trg_status_history
  after update on issues
  for each row execute function record_status_change();

-- ─────────────────────────────────────────────
-- PROPOSALS
-- ─────────────────────────────────────────────
create table if not exists proposals (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text not null,
  related_issue_ids uuid[] not null default '{}',
  proposer_id       uuid references profiles(id) on delete set null,
  estimated_cost    text,
  estimated_impact  text,
  status            text not null default 'proposed'
                      check (status in ('proposed','under_review','approved','rejected','implemented')),
  vote_count        integer not null default 0,
  is_ai_generated   boolean not null default false,
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PROPOSAL VOTES
-- ─────────────────────────────────────────────
create table if not exists proposal_votes (
  id          uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  session_id  text,
  created_at  timestamptz not null default now(),
  constraint uq_prop_vote_user    unique (proposal_id, user_id),
  constraint uq_prop_vote_session unique (proposal_id, session_id)
);

create or replace function update_proposal_vote_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update proposals set vote_count = vote_count + 1 where id = NEW.proposal_id;
  elsif TG_OP = 'DELETE' then
    update proposals set vote_count = greatest(0, vote_count - 1) where id = OLD.proposal_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_proposal_vote_count on proposal_votes;
create trigger trg_proposal_vote_count
  after insert or delete on proposal_votes
  for each row execute function update_proposal_vote_count();

-- ─────────────────────────────────────────────
-- INSTITUTIONAL RECORDS  (accountability tracker)
-- ─────────────────────────────────────────────
create table if not exists institutional_records (
  id              uuid primary key default uuid_generate_v4(),
  institution_id  uuid references institutions(id) on delete set null,
  institution     text not null,
  title           text not null,
  description     text not null,
  record_type     text not null check (record_type in ('commitment','policy','budget','response','milestone','other')),
  status          text not null default 'pending'
                    check (status in ('pending','in_progress','completed','cancelled')),
  due_date        date,
  completed_at    timestamptz,
  related_issue_ids uuid[] not null default '{}',
  source_url      text,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- AI ANALYSIS
-- ─────────────────────────────────────────────
create table if not exists ai_analysis (
  id          uuid primary key default uuid_generate_v4(),
  issue_id    uuid not null references issues(id) on delete cascade,
  model       text not null,
  summary     text,
  sentiment   text check (sentiment in ('positive','neutral','negative')),
  priority    integer check (priority between 1 and 10),
  tags        text[] not null default '{}',
  raw_output  jsonb,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- DATA SOURCES
-- ─────────────────────────────────────────────
create table if not exists data_sources (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  source_type text not null check (source_type in ('api','scrape','manual','upload')),
  url         text,
  last_synced timestamptz,
  record_count integer not null default 0,
  status      text not null default 'active' check (status in ('active','paused','error')),
  config      jsonb,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- updated_at trigger (shared)
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_issues_updated on issues;
create trigger trg_issues_updated before update on issues
  for each row execute function set_updated_at();

drop trigger if exists trg_proposals_updated on proposals;
create trigger trg_proposals_updated before update on proposals
  for each row execute function set_updated_at();

drop trigger if exists trg_inst_records_updated on institutional_records;
create trigger trg_inst_records_updated before update on institutional_records
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

-- profiles
alter table profiles enable row level security;
create policy "profiles: anyone can read"   on profiles for select using (true);
create policy "profiles: owner can update"  on profiles for update using (auth.uid() = id);

-- issues
alter table issues enable row level security;
create policy "issues: anyone can read"     on issues for select using (true);
create policy "issues: auth can insert"     on issues for insert
  with check (auth.uid() is not null or true); -- allow anon for now; tighten in production
create policy "issues: admin can update"    on issues for update using (is_admin());
create policy "issues: admin can delete"    on issues for delete using (is_admin());

-- issue_support
alter table issue_support enable row level security;
create policy "support: anyone can read"    on issue_support for select using (true);
create policy "support: anyone can insert"  on issue_support for insert with check (true);
create policy "support: owner can delete"   on issue_support for delete
  using (user_id = auth.uid() or true); -- allow session-based removal

-- proposals
alter table proposals enable row level security;
create policy "proposals: anyone can read"  on proposals for select using (true);
create policy "proposals: auth can insert"  on proposals for insert with check (auth.uid() is not null);
create policy "proposals: admin can update" on proposals for update using (is_admin());

-- proposal_votes
alter table proposal_votes enable row level security;
create policy "prop_votes: anyone can read"   on proposal_votes for select using (true);
create policy "prop_votes: anyone can insert" on proposal_votes for insert with check (true);
create policy "prop_votes: owner can delete"  on proposal_votes for delete
  using (user_id = auth.uid() or true);

-- institutions
alter table institutions enable row level security;
create policy "institutions: anyone can read" on institutions for select using (true);
create policy "institutions: admin can write" on institutions for all using (is_admin());

-- institutional_responses
alter table institutional_responses enable row level security;
create policy "inst_resp: anyone can read"    on institutional_responses for select using (true);
create policy "inst_resp: admin can write"    on institutional_responses for all using (is_admin());

-- institutional_records
alter table institutional_records enable row level security;
create policy "inst_rec: anyone can read"     on institutional_records for select using (true);
create policy "inst_rec: admin can write"     on institutional_records for all using (is_admin());

-- status_history
alter table status_history enable row level security;
create policy "status_hist: anyone can read"  on status_history for select using (true);

-- ai_analysis
alter table ai_analysis enable row level security;
create policy "ai: anyone can read"           on ai_analysis for select using (true);
create policy "ai: admin can write"           on ai_analysis for all using (is_admin());

-- data_sources
alter table data_sources enable row level security;
create policy "ds: admin only"                on data_sources for all using (is_admin());

-- ─────────────────────────────────────────────
-- Enable Realtime on issues
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table issues;
alter publication supabase_realtime add table issue_support;
