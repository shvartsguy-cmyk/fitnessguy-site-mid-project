# media/ — ייצור תמונות וסרטונים עם fal.ai

תיקייה זו מרכזת את כל נכסי המדיה של הפרויקט, כולל תוצרים שנוצרים ב-AI דרך fal.ai.

## מבנה

- `logo-fitnessguy.png` — הלוגו של העסק
- `generated/images/`: תמונות שנוצרו ב-fal.ai (דמות, גיליונות דמות, רקעים, תפאורת חדר הכושר של הסרטונים)
- `generated/videos/<exercise-id>/`: תיקייה לכל תרגיל, בשם ה-`id` שלו מ-`app/exercises.json` (למשל `back-squat`):
  - הסרטון הסופי ותיעוד התרגיל (`YYYY-MM-DD_<exercise-id>.md`: פרומפטים, request_id, עלות ובדיקה מול מאגר הידע)
  - `keyframes/`: תמונות המפתח שנכנסו לסרטון הסופי
  - `attempts/` ו-`keyframes/attempts/`: ניסיונות שנפסלו. לא מוחקים, כי הם מתעדים מה נלמד

## החיבור ל-fal.ai

- **שרת MCP רשמי:** `https://mcp.fal.ai/mcp` (Streamable HTTP), מוגדר ב-`.mcp.json` בשורש הפרויקט.
- **מפתח:** `FAL_KEY` בקובץ `.env` בשורש הפרויקט (git-ignored). Claude Code לא טוען קבצי `.env` בעצמו, ולכן הסקריפט `.claude/fal-auth-headers.js` (מוגדר כ-`headersHelper`) קורא את המפתח ושולח `Authorization: Bearer <key>`.
- **הפעלה והרשאות:** `.claude/settings.json` — מפעיל את השרת, מאשר מראש כלי חיפוש/מידע, ודורש אישור ידני ל-`run_model` ו-`submit_job` (אלה עולים כסף).
- אחרי שינוי ב-`.env` או ב-`.mcp.json` צריך להפעיל מחדש את Claude Code או לבצע reconnect דרך `/mcp`.

### כלים זמינים

- **חיפוש ומידע:** `search_models`, `get_model_schema`, `get_pricing`, `search_docs`, `recommend_model`
- **הרצה:** `run_model` (סינכרוני, מתאים לתמונות), `submit_job` → `check_job` → `get_job_result` (תור, מתאים לסרטונים ולמשימות ארוכות), `cancel_job`
- **עזר:** `upload_file` — העלאת תמונת מקור (למשל הלוגו) לשימוש במודלים של image-to-image או image-to-video

## תהליך עבודה

1. **לפני ייצור:** לבדוק את ה-schema של המודל (`get_model_schema`) ואת המחיר (`get_pricing`), ולציין את העלות המשוערת למשתמש.
2. **תמונות:** `run_model`. **סרטונים:** `submit_job` ואז מעקב עם `check_job` (סרטונים לוקחים דקות).
3. **שמירה:** כתובות ה-URL של fal הן זמניות, לכן יש להוריד כל תוצר מיד לתיקייה המתאימה ב-`generated/`.
4. **שמות קבצים:** `YYYY-MM-DD_<נושא-קצר>_<מודל>.<ext>` באנגלית ובאותיות קטנות, למשל `2026-09-25_hero-trainer_flux-2.png`.
5. **תיעוד:** לרשום את הפרומפט, המודל, ה-seed והפרמטרים של כל תוצר, כדי שאפשר יהיה לשחזר אותו.

## אזהרות

- לא לקרוא, להציג או להעתיק את `FAL_KEY`, ולא לשים אותו בקוד צד-לקוח או בקבצים שנכנסים ל-Git.
- לא להריץ ייצור בכמויות (batch) או מודלי וידאו יקרים בלי אישור מפורש מהמשתמש.
