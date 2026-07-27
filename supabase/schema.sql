-- =========================================================
-- OdeKorean — Core Database Schema
-- Multi-language architecture: every learning-content table
-- is scoped by `language_id`, so adding English/Japanese/
-- Russian/Chinese later is a data change, not a schema change.
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type user_role as enum ('student', 'admin', 'superadmin');
create type lesson_type as enum ('video','pdf','vocabulary','grammar','topik','speaking','listening','reading','writing');
create type lesson_status as enum ('draft','published','archived');
create type question_type as enum ('multiple_choice','fill_blank','listening','speaking','topik');
create type subscription_plan as enum ('free','premium_monthly','premium_yearly');
create type subscription_status as enum ('active','canceled','past_due','trialing','none');
create type topik_level as enum ('TOPIK_I','TOPIK_II');
create type attempt_status as enum ('in_progress','submitted','graded');

-- ---------- LANGUAGES (future-proofing) ----------
create table languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,            -- 'ko','en','ja','ru','zh'
  name text not null,                   -- 'Korean'
  native_name text not null,            -- '한국어'
  flag_emoji text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- PROFILES (extends Supabase auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role user_role not null default 'student',
  target_language_id uuid references languages(id),
  native_language text default 'uz',     -- Uzbek by default
  current_level text default 'beginner', -- beginner/intermediate/advanced
  timezone text default 'Asia/Tashkent',
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- SUBSCRIPTIONS (architecture ready, billing wired later) ----------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'none',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index on subscriptions(user_id);

-- ---------- CATEGORIES ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  language_id uuid references languages(id) not null,
  name text not null,
  slug text not null,
  description text,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now(),
  unique(language_id, slug)
);

-- ---------- LESSONS ----------
create table lessons (
  id uuid primary key default gen_random_uuid(),
  language_id uuid references languages(id) not null,
  category_id uuid references categories(id),
  type lesson_type not null,
  title text not null,
  slug text not null,
  description text,
  thumbnail_url text,
  level text default 'beginner',          -- beginner/intermediate/advanced
  duration_minutes int,
  -- video content
  video_source text,                      -- 'youtube' | 'upload'
  video_url text,                         -- youtube URL or storage URL
  youtube_id text,
  -- pdf content
  pdf_url text,
  pdf_version int default 1,
  -- structured content (vocabulary lists, grammar notes) as JSON
  content jsonb default '{}'::jsonb,
  status lesson_status not null default 'draft',
  is_premium boolean default false,
  sort_order int default 0,
  created_by uuid references profiles(id),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(language_id, slug)
);
create index on lessons(language_id, status);
create index on lessons(category_id);

-- ---------- VOCABULARY ----------
create table vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  language_id uuid references languages(id) not null,
  lesson_id uuid references lessons(id) on delete set null,
  term text not null,              -- e.g. 한국어 term
  romanization text,
  translation text not null,       -- Uzbek/English translation
  example_sentence text,
  example_translation text,
  audio_url text,
  part_of_speech text,
  topik_level topik_level,
  created_at timestamptz default now()
);
create index on vocabulary_items(language_id);

-- ---------- QUIZZES ----------
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  title text not null,
  instructions text,
  time_limit_seconds int,
  pass_score_percent int default 60,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  type question_type not null,
  prompt text not null,
  prompt_audio_url text,
  options jsonb default '[]'::jsonb,      -- [{id,text}]
  correct_answer jsonb not null,          -- option id(s) or text
  explanation text,
  points int default 1,
  sort_order int default 0
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  answers jsonb default '{}'::jsonb,
  score_percent numeric,
  status attempt_status default 'in_progress',
  started_at timestamptz default now(),
  submitted_at timestamptz
);

-- ---------- TOPIK MOCK EXAMS ----------
create table topik_exams (
  id uuid primary key default gen_random_uuid(),
  level topik_level not null,
  title text not null,
  description text,
  time_limit_minutes int not null,
  total_points int not null default 100,
  is_published boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table topik_exam_sections (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references topik_exams(id) on delete cascade,
  name text not null,        -- Listening / Reading / Writing
  sort_order int default 0
);

create table topik_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references topik_exam_sections(id) on delete cascade,
  type question_type not null,
  prompt text not null,
  audio_url text,
  passage text,
  options jsonb default '[]'::jsonb,
  correct_answer jsonb not null,
  explanation text,
  points int default 1,
  sort_order int default 0
);

create table topik_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references topik_exams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  answers jsonb default '{}'::jsonb,
  score numeric,
  status attempt_status default 'in_progress',
  started_at timestamptz default now(),
  submitted_at timestamptz
);

-- ---------- AI TEACHER (chat + usage tracking) ----------
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text default 'New conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete cascade,
  role text not null,           -- 'user' | 'assistant'
  content text not null,
  tokens_used int,
  created_at timestamptz default now()
);

create table ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  feature text not null,        -- 'ai_teacher' | 'pronunciation' | 'study_plan' | 'quiz_gen'
  tokens_used int,
  created_at timestamptz default now()
);

-- ---------- PROGRESS & GAMIFICATION ----------
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  progress_percent int default 0,
  completed boolean default false,
  completed_at timestamptz,
  last_position_seconds int default 0,  -- for video resume
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create table streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int default 0,
  longest_streak int default 0,
  last_activity_date date,
  updated_at timestamptz default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  icon text,
  criteria jsonb default '{}'::jsonb
);

create table user_achievements (
  user_id uuid references profiles(id) on delete cascade,
  achievement_id uuid references achievements(id) on delete cascade,
  earned_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

create table daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_date date not null,
  tasks jsonb default '[]'::jsonb,   -- [{type,ref_id,title,done}]
  generated_by text default 'ai',
  created_at timestamptz default now(),
  unique(user_id, plan_date)
);

create table weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  week_start date not null,
  target_minutes int default 150,
  target_lessons int default 5,
  minutes_completed int default 0,
  lessons_completed int default 0,
  unique(user_id, week_start)
);

-- ---------- ANALYTICS (admin dashboard) ----------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  event_name text not null,      -- 'lesson_view','quiz_submit','signup', etc.
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index on analytics_events(event_name, created_at);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table profiles enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table bookmarks enable row level security;
alter table quiz_attempts enable row level security;
alter table topik_attempts enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table subscriptions enable row level security;
alter table daily_plans enable row level security;
alter table weekly_goals enable row level security;
alter table streaks enable row level security;

-- profiles: user reads/updates own row; admins read all
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- lessons: published content readable by all authenticated users; drafts admin-only
create policy "lessons_select_published" on lessons for select
  using (status = 'published' or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));
create policy "lessons_admin_write" on lessons for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','superadmin')));

-- user-owned tables: strictly own rows
create policy "own_rows_progress" on lesson_progress for all using (auth.uid() = user_id);
create policy "own_rows_bookmarks" on bookmarks for all using (auth.uid() = user_id);
create policy "own_rows_quiz_attempts" on quiz_attempts for all using (auth.uid() = user_id);
create policy "own_rows_topik_attempts" on topik_attempts for all using (auth.uid() = user_id);
create policy "own_rows_ai_conv" on ai_conversations for all using (auth.uid() = user_id);
create policy "own_rows_subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "own_rows_daily_plans" on daily_plans for all using (auth.uid() = user_id);
create policy "own_rows_weekly_goals" on weekly_goals for all using (auth.uid() = user_id);
create policy "own_rows_streaks" on streaks for all using (auth.uid() = user_id);
create policy "own_rows_ai_messages" on ai_messages for all using (
  exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- ---------- Auto-create profile row on signup ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.streaks (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- seed default language
insert into languages (code, name, native_name, flag_emoji, sort_order) values
  ('ko','Korean','한국어','🇰🇷',0),
  ('en','English','English','🇬🇧',1),
  ('ja','Japanese','日本語','🇯🇵',2),
  ('ru','Russian','Русский','🇷🇺',3),
  ('zh','Chinese','中文','🇨🇳',4);
