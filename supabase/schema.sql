-- Neve Sagiv - Shlomo Adiv Foreclosure Properties
-- Supabase Schema + RLS + Initial Seed
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

create table properties (
  id bigserial primary key,

  -- Public fields (shown on website)
  city jsonb not null,            -- { "he": "תל אביב", "ru": "Тель-Авив" }
  street text,                    -- "סירקין" (no house number)
  property_type jsonb not null,   -- { "he": "דירה", "ru": "Квартира" }
  rooms numeric,
  area numeric,

  -- Admin-only fields (never exposed to public)
  full_address text,              -- "סירקין 12, תל אביב, דירה 4"
  block text,                     -- גוש
  parcel text,                    -- חלקה
  sub_parcel text,                -- תת חלקה
  trustee_name text,              -- "דניאל אלון, עו"ד"
  trustee_phone text,
  submit_deadline date,           -- מועד הגשת הצעות
  internal_notes text,

  -- Management
  is_published boolean default false,
  status text default 'active',   -- active / sold / withdrawn
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table leads (
  id bigserial primary key,
  property_id bigint references properties(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  message text,
  ip_address text,
  status text default 'new',      -- new / called / cold
  contacted_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table email_log (
  id bigserial primary key,
  lead_id bigint references leads(id) on delete cascade,
  status text not null,           -- sent / pending / failed
  sent_at timestamptz,
  error text,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index properties_is_published_idx on properties(is_published);
create index properties_created_at_idx on properties(created_at desc);
create index leads_property_id_idx on leads(property_id);
create index leads_status_idx on leads(status);
create index leads_created_at_idx on leads(created_at desc);
create index email_log_lead_id_idx on email_log(lead_id);

-- ============================================
-- TRIGGERS
-- ============================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table properties enable row level security;
alter table leads enable row level security;
alter table email_log enable row level security;

-- Public can read only published properties
create policy "Public reads published properties"
  on properties for select
  to anon
  using (is_published = true and status = 'active');

-- Anyone can insert a lead (form submission)
create policy "Anyone can submit a lead"
  on leads for insert
  to anon
  with check (true);

-- Authenticated users (Shlomo via admin) have full access
create policy "Authenticated full access on properties"
  on properties for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on leads"
  on leads for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on email_log"
  on email_log for all
  to authenticated
  using (true)
  with check (true);

-- ============================================
-- INITIAL SEED DATA (the 10 properties from mock)
-- ============================================

insert into properties (city, street, property_type, rooms, area, trustee_name, trustee_phone, is_published) values
  ('{"he":"תל אביב","ru":"Тель-Авив"}', 'סירקין', '{"he":"דירה","ru":"Квартира"}', 3, 70, 'דניאל אלון, עו"ד', '03-6005225', true),
  ('{"he":"באר שבע","ru":"Беэр-Шева"}', 'מקור חיים', '{"he":"דירה","ru":"Квартира"}', 4, 85, 'משה דנוך, עו"ד', '050-5396996', true),
  ('{"he":"נתיבות","ru":"Нетивот"}', 'הרב הרצוג', '{"he":"בית מגורים","ru":"Жилой дом"}', null, 68, 'ניר שדה, עו"ד', '04-6466904', true),
  ('{"he":"תל אביב","ru":"Тель-Авив"}', 'בית אלפא', '{"he":"מקרקעין","ru":"Земля"}', null, 1113, 'רן ברא"ז, עו"ד', '03-1112233', true),
  ('{"he":"נצרת","ru":"Назарет"}', '4011', '{"he":"דירה","ru":"Квартира"}', 5, 99, 'אבי טל, עו"ד', '04-6601888', false),
  ('{"he":"נהריה","ru":"Нагария"}', 'בלפור', '{"he":"דירה","ru":"Квартира"}', null, 111, 'יניב סברדליק, עו"ד', '073-7308500', true),
  ('{"he":"תל אביב","ru":"Тель-Авив"}', 'אורי צבי גרינברג', '{"he":"דופלקס","ru":"Дуплекс"}', null, null, 'יונתן סונדרס, עו"ד', '09-8357555', true),
  ('{"he":"בת ים","ru":"Бат-Ям"}', 'בלפור', '{"he":"דירה","ru":"Квартира"}', 4, 92, 'מיכל עזרא, עו"ד', '03-9988776', true),
  ('{"he":"חיפה","ru":"Хайфа"}', 'הנשיא', '{"he":"דירה","ru":"Квартира"}', 3, 75, 'אבי טל, עו"ד', '04-6601888', true),
  ('{"he":"בת ים","ru":"Бат-Ям"}', 'יוספטל', '{"he":"דירה","ru":"Квартира"}', 3, 78, 'מיכל עזרא, עו"ד', '03-9988776', true);
