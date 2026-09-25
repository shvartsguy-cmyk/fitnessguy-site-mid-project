# media/ — תוצרי AI (תמונות/סרטונים)

תיקייה זו מיועדת לתמונות ולסרטונים שנוצרים באמצעות AI עבור הפרויקט (למשל: קונספטים לדמות המאמן, סרטוני טכניקת תרגילים).

## כלי הייצור: fal.ai (MCP)

לייצור תמונות/סרטונים מחובר שרת ה-MCP הרשמי של fal.ai.

- **שרת:** `https://mcp.fal.ai/mcp` (Streamable HTTP), מוגדר ב-`.mcp.json` בשורש "AI DEV FocusAI" (לא בתיקייה הזו — שם גם חיים שרתי ה-MCP האחרים של הפרויקט, כגון Cloudinary).
- **מפתח API:** נשמר ב-`FAL_KEY` בקובץ `.env` בשורש "AI DEV FocusAI" (git-ignored). `.mcp.json` מפנה אליו דרך `${FAL_KEY}` ולעולם לא כערך גלוי.
- **הפעלה:** האישור להשתמש בכלים בלי אישור ידני בכל קריאה מוגדר ב-`.claude/settings.json` (אותו שורש חיצוני).
- **סטטוס נוכחי:** החיבור מוגדר, אך `FAL_KEY` הוא עדיין placeholder (`your_fal_api_key`). יש להירשם ב-https://fal.ai/dashboard/keys, להפיק מפתח אמיתי ולהדביק אותו ב-`.env` לפני שאפשר לייצר תוצרים בפועל.
- **לאחר עדכון `.mcp.json`:** נדרשת הפעלה מחדש (restart) של סשן Claude Code כדי שהשרת ייטען.

### יכולות עיקריות

- **Discovery:** `search_models`, `get_model_schema`, `get_pricing`, `search_docs`
- **Execution:** `run_model`, `submit_job`, `check_job`, `get_job_result`, `cancel_job`
- **Utility:** `upload_file`, `recommend_model`

הפלטפורמה מארחת מאות מודלים לתמונה/וידאו/אודיו/3D (למשל Flux 2, Seedream V4, GPT Image 2, Veo 3, Kling 3.0). תמחור לפי שימוש, ללא tier חינמי.

## אזהרות

- לעולם לא לחשוף `FAL_KEY` בקוד צד-לקוח או להדביק אותו כערך גלוי בקבצים שנשלחים ל-Git.
- `.env` ו-`.env.example` בשורש החיצוני הם המקור היחיד לאמת עבור המפתח — לא ליצור עותק נוסף שלו בתיקייה הזו.
