# Fitness Guy — פרוייקט אמצע (AI DEV Bootcamp)

עסק כושר פיקטיבי לצורך פרויקט האמצע בהכשרת AI DEV של FocusAI. הוראות הפרויקט המלאות: https://focusai.co.il/aidev-midproject/ (גם ב-`spec/` וב-memory של Claude).

## מבנה התיקייה

- `spec/` — PRD, שאלות בדיקה, תוצרי כלי האפיון
- `knowledge/` — מאגר הידע (Markdown) שמוזן ל-Pinecone: מדיניות, מחירון, תזונה, תקיעויות, FAQ, תמיכה טכנית
- `app/` — קוד עמוד הנחיתה
- `media/` — תמונות/סרטונים שנוצרו ב-AI
- `n8n/` — ייצוא JSON של הוורקפלואים (ללא מפתחות API)
- `.claude/skills/` — הסקיל הנדרש לפרויקט (skill-creator)

## מה מחובר למה

- **סוכן n8n:** "FitnessGuy bot 2.0" (שוכפל בתיקיית n8n "פרוייקט אמצע" תחת Focus AI - AI DEV), workflow id `n5tzlw9Pylbwpjwm`. Triggers: Telegram + Form (העלאת מסמכים ל-RAG). כלים: Pinecone (מאגר ידע), Supabase (weight_tracking, members, chat_logs).
- **מאגר וקטורי:** Pinecone, index `fitnessguy`, namespace `guy`. יעד: ≥100 וקטורים.
- **בסיס נתונים:** Supabase — טבלאות `members`, `weight_tracking`, `chat_logs`.
- **עמוד האתר:** ⚠️ טרם נבנה. יתחבר לסוכן דרך webhook n8n (כתובת תתעדכן כאן כשתיווצר).
- **ייצור מדיה:** fal.ai דרך MCP (`.mcp.json` + `.claude/settings.json`, מפתח ב-`.env`). פרטים ב-`media/CLAUDE.md`, התוצרים נשמרים ב-`media/generated/`.
- **Webhooks:** ⚠️ טרם קיימים — לעדכן כאן כתובת מלאה + הגדרת CORS לכל webhook עם יצירתו.

## אזהרות

- לעולם לא להעלות `.env` ל-Git — לבדוק `.gitignore` לפני כל commit.
- לא לחשוף מפתחות API בקוד הצד-לקוח של העמוד.
- הקרדנציאלס של n8n (Pinecone/Supabase/OpenAI/Telegram/OpenRouter) שייכים לחשבון guy shvarts.guy@gmail.com בסביבת n8n cloud — אינם מיוצאים עם ה-JSON.
