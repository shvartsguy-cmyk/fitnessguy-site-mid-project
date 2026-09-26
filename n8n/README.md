# n8n – Fitness Guy

ה-workflows של הפרויקט, כפי שיוצאו מ-n8n Cloud ב-26/09/2026, ותבניות המיילים.

## workflows/

| קובץ | מה הוא עושה | טריגר |
|------|--------------|--------|
| `fitnessguy-bot.json` | הסוכן. ערוץ אחד לאתר ואחד לטלגרם, עם פרומפט בסיס משותף והנחיות נפרדות לכל ערוץ. באתר: מאגר ידע בלבד, תשובה בזרימה (streaming). בטלגרם: זיהוי מתאמן, שמירת כרטיס, שקילות, מאגר ידע והעברה לצוות במייל. כל שיחה נשמרת ב-`chat_logs`. כולל גם טופס להעלאת מסמכים ל-Pinecone. | Webhook `POST /fitnessguy/chat`, ‏Telegram Trigger, ‏Form Trigger (העלאה ל-RAG) |
| `lead-intake.json` | טופס הליד מהאתר. מאמת ומנרמל את הפרטים, יוצר משימה ומחזיר `job_id` מיד (polling). מתאים מסלול לפי כללים לפי רמת הניסיון. אם היתה שיחה באתר, משתמש במודל. בסוף שומר כרטיס ב-`members` ושולח מייל לצוות ומייל ללקוח. | Webhook `POST /fitnessguy/lead`, ‏Webhook `GET /fitnessguy/lead-status` |
| `weekly-weigh-in-reminder.json` | כל יום ראשון ב-08:00 שולח תזכורת בטלגרם למתאמנים שלא נשקלו 7 ימים. **מושבת כרגע**, ומופעל ידנית לבדיקה. | Schedule, ‏Manual |
| `error-handler.json` | שולח מייל התראה כשאחד ה-workflows נכשל. מוגדר כ-Error Workflow של שלושת האחרים. | Error Trigger |

### אבטחה

- הקבצים לא מכילים מפתחות API.
- n8n מייצא רק הפניה לחיבור (שם ומזהה), והסוד עצמו נשאר ב-n8n.
- נסרקו לפני ה-commit:
  - דפוסי מפתחות: OpenAI, ‏OpenRouter, ‏JWT, ‏Pinecone, ‏Telegram, ‏Bearer.
  - כותרות HTTP.
  - פרמטרי שאילתה.

## ייבוא למופע n8n אחר

1. **Workflows → Import from File**, לכל אחד מהקבצים.
2. **ליצור את החיבורים (Credentials)** ולבחור אותם בצמתים:

   | חיבור | משמש ב- |
   |--------|---------|
   | Supabase API | בוט, ליד, תזכורת |
   | Gmail OAuth2 | בוט (העברה לצוות), ליד, טיפול בשגיאות |
   | OpenRouter | בוט, ליד |
   | OpenAI API | בוט (embeddings) |
   | Pinecone API | בוט |
   | Telegram API | בוט, תזכורת |

3. **מסד הנתונים:** להריץ ב-Supabase את `spec/supabase-migration-2026-09-26.sql` ואת `spec/supabase-migration-2026-09-26b-weights.sql`.
4. **מאגר הידע:** לפתוח את טופס ההעלאה (`On form submission`) ולהעלות את הקבצים מ-`knowledge/` לאינדקס `fitnessguyv2`, ‏namespace ‏`guy`. אמורים להתקבל 104 וקטורים.
5. **Error Workflow:** בהגדרות של שלושת ה-workflows לבחור את `FitnessGuy Bot Error Handler`.
6. **CORS:** בשלושת ה-webhooks (`chat`, ‏`lead`, ‏`lead-status`) לעדכן את `allowedOrigins` לכתובת האתר.

## emails/

תבניות HTML של המיילים (RTL, טבלאות, תואם Gmail במצב כהה). אותו HTML יושב בצמתי Gmail שב-workflows, ומשתני התבנית (`%NAME%` וכו') מוחלפים שם.

| קובץ | נשלח מ- |
|------|---------|
| `lead-confirmation.html` | ליד → ללקוח |
| `lead-team.html` | ליד → לצוות |
| `escalation-team.html` | בוט בטלגרם → לצוות (כשצריך נציג) |

`form-custom-styling.css`: עיצוב טופס ההעלאה ל-RAG בצבעי המותג.
