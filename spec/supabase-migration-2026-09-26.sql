-- Fitness Guy: הכנת Supabase לחיבור האתר (ראו spec/agent-design.md, סעיף 6)
-- להריץ פעם אחת ב-Supabase → SQL Editor. כל הפקודות רצות בטרנזקציה אחת:
-- אם משהו נכשל, שום שינוי לא נשמר.

begin;

-- 1. members הופך לכרטיס לקוח.
--    ליד מהאתר עוד אין לו telegram_id, לכן המפתח הראשי עובר לעמודת id חדשה.
alter table members add column if not exists id uuid not null default gen_random_uuid();

do $$
declare pk text;
begin
  select constraint_name into pk
  from information_schema.table_constraints
  where table_schema = 'public' and table_name = 'members' and constraint_type = 'PRIMARY KEY';
  if pk is not null then
    execute format('alter table members drop constraint %I', pk);
  end if;
end $$;

alter table members add primary key (id);
alter table members alter column telegram_id drop not null;
create unique index if not exists members_telegram_id_key on members (telegram_id);

alter table members add column if not exists email text;
alter table members add column if not exists goal text;               -- mass / cut / plateau / unsure
alter table members add column if not exists recommended_track text;
alter table members add column if not exists summary text;            -- תקציר שיחת האתר
alter table members add column if not exists source text not null default 'telegram';  -- web / telegram
alter table members add column if not exists marketing_consent boolean not null default false;
alter table members add column if not exists updated_at timestamptz default now();

-- 2. טלפון בספרות בלבד, כדי ש-050-1234567 ו-0501234567 יזוהו כאותו אדם.
update members set phone = regexp_replace(phone, '\D', '', 'g');
update weight_tracking set phone = regexp_replace(phone, '\D', '', 'g') where phone is not null;
create unique index if not exists members_phone_key on members (phone);

-- 3. משימות טופס הליד, בשביל ה-polling באתר.
create table if not exists lead_jobs (
  job_id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',  -- pending / done / error
  track text,
  why text,
  created_at timestamptz not null default now()
);

-- 4. תיעוד שיחות משני הערוצים.
alter table chat_logs add column if not exists channel text not null default 'telegram';  -- web / telegram
alter table chat_logs add column if not exists user_key text;                               -- web:<session> / tg:<chat.id>
update chat_logs set user_key = 'tg:' || telegram_id where user_key is null and telegram_id is not null;
create index if not exists chat_logs_user_key_idx on chat_logs (user_key, "timestamp");

commit;
