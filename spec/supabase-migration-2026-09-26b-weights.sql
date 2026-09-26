-- Fitness Guy: שקילות לפי telegram_id במקום לפי טלפון
-- שקילה קיימת רק בטלגרם, ושם הזהות המאומתת היא ה-telegram_id.
-- כך לסוכן אין שום פרמטר שמזהה אדם: הוא בוחר רק את המשקל.
-- להריץ פעם אחת ב-Supabase → SQL Editor, אחרי supabase-migration-2026-09-26.sql.

begin;

alter table weight_tracking add column if not exists telegram_id bigint;

-- מילוי לשקילות הקיימות, לפי הטלפון שבכרטיס
update weight_tracking w
set telegram_id = m.telegram_id
from members m
where w.telegram_id is null
  and w.phone = m.phone
  and m.telegram_id is not null;

-- השם נמצא בכרטיס, אין צורך לשכפל אותו בכל שקילה
alter table weight_tracking alter column full_name drop not null;

create index if not exists weight_tracking_tg_date_idx
  on weight_tracking (telegram_id, date desc, created_at desc);

commit;

-- בדיקה: כמה שקילות נשארו בלי telegram_id (שקילות של מספר שאין לו כרטיס עם טלגרם)
select count(*) as without_telegram_id from weight_tracking where telegram_id is null;
