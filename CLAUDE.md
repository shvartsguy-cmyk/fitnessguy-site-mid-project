# Fitness Guy: פרוייקט אמצע (AI DEV Bootcamp)

עסק כושר פיקטיבי לפרויקט האמצע בהכשרת AI DEV של FocusAI.
- הוראות הפרויקט המלאות: https://focusai.co.il/aidev-midproject/
- גם ב-memory של Claude.

## מבנה התיקייה

- `spec/`: מסמכי האפיון.
  - `PRD.md`
  - `agent-design.md`: תכנון ומימוש של הסוכן והאוטומציה.
  - `test-questions.md`: 10 שאלות הבדיקה ותוצאותיהן.
  - מסמכי עיצוב ומבנה האתר.
  - קבצי ה-SQL של Supabase.
- `knowledge/`: מאגר הידע (Markdown) שמוזן ל-Pinecone. 15 קבצים: מדיניות, מחירון, תזונה, תקיעויות, FAQ, תמיכה טכנית, צוות, טכניקת תרגילים, מילון מונחים.
- `app/`: האתר. HTML, ‏CSS ו-JS בלי build.
  - `index.html`: עמוד הנחיתה.
  - `technique.html`: מדריכי טכניקה עם סרטון לכל תרגיל, מתוך `exercises.json`.
  - עמודי תקנון, פרטיות ונגישות.
- `media/`: מדיה שנוצרה ב-fal.ai, עם תיעוד לכל תוצר. ראו `media/CLAUDE.md`.
- `n8n/`:
  - `workflows/`: ייצוא JSON של ה-workflows, בלי מפתחות.
  - `emails/`: תבניות המיילים.
  - ‏`README.md` מסביר מה כל workflow עושה ואיך מייבאים.

## מה מחובר למה

### n8n Cloud

הכתובת: `guy1023.app.n8n.cloud`, תיקייה "פרוייקט אמצע".

| Workflow | id | מה הוא עושה |
|----------|----|-------------|
| FitnessGuy bot 2.0 | `n5tzlw9Pylbwpjwm` | הסוכן, עם שני ערוצים (אתר וטלגרם) וטופס העלאה ל-RAG |
| Lead Intake – FitnessGuy | `X5Rp0tonW8dP2Vyj` | טופס הליד מהאתר: polling, התאמת מסלול, כרטיס לקוח, שני מיילים |
| Weekly Weigh-in Reminder | `O9LPyCcZLIG6apH2` | תזכורת שקילה בטלגרם. **מושבת** |
| FitnessGuy Bot Error Handler | `mYRljPDGJ6yqTZXF` | מייל התראה על כשל. ה-Error Workflow של שלושת האחרים |

- **מודל:** ‏`anthropic/claude-sonnet-5.5` דרך OpenRouter, בבוט ובטופס הליד (מ-03/10/2026).
- **מאגר וקטורי:** Pinecone, אינדקס `fitnessguyv2`, ‏namespace ‏`guy`. בו 104 וקטורים, כל אחד זוג שאלה ותשובה.
- **בסיס נתונים:** Supabase. טבלאות:
  - `members`: כרטיס לקוח. המפתח `id`, הטלפון ייחודי ובספרות בלבד, ו-`telegram_id` ייחודי ואופציונלי.
  - `weight_tracking`: לפי `telegram_id`.
  - `chat_logs`: עם `channel` ו-`user_key`.
  - `lead_jobs`: משימות ה-polling.

### Webhooks

| נקודה | שיטה | CORS |
|-------|------|------|
| `https://guy1023.app.n8n.cloud/webhook/fitnessguy/chat` | POST, תשובה בזרימה (NDJSON) | האתר ב-Vercel + `http://localhost:8765` |
| `https://guy1023.app.n8n.cloud/webhook/fitnessguy/lead` | POST, מחזיר `job_id` | האתר ב-Vercel + `http://localhost:8765` |
| `https://guy1023.app.n8n.cloud/webhook/fitnessguy/lead-status` | GET `?job_id=` | האתר ב-Vercel + `http://localhost:8765` |

### האתר

- **אתר חי:** https://fitnessguy-site-mid-project-app.vercel.app
  - Vercel מחובר לריפו `shvartsguy-cmyk/fitnessguy-site-mid-project`.
  - Root Directory: `app`. רק התיקייה הזו מתפרסמת.
  - כל push ל-`main` מעדכן את האתר.
- **הרצה מקומית:**
  ```
  cd app && python -m http.server 8765
  ```
- **כתובות ה-webhooks** ב-`ENDPOINTS` שב-`app/main.js`. אין שם מפתחות.

### ייצור מדיה

- fal.ai דרך MCP:
  - ההגדרות ב-`.mcp.json` וב-`.claude/settings.json`.
  - המפתח ב-`.env`.
- התוצרים מאוחסנים ב-Cloudinary (`dmrksuz8a`).

## אזהרות

- לעולם לא להעלות `.env` ל-Git. לבדוק את `.gitignore` לפני כל commit.
- לא לחשוף מפתחות API בקוד הצד-לקוח.
- לפני כל ייצוא workflow:
  - לסרוק שאין מפתחות.
  - הקרדנציאלס של n8n שייכים לחשבון shvarts.guy@gmail.com ב-n8n Cloud, ומיוצאים רק כהפניה בשם.
- שינוי בטיוטה ב-n8n לא נכנס לתוקף עד Publish.
