# לחיצת כתפיים בעמידה (overhead-press): תיעוד (2026-09-25)

**קובץ סופי:** `2026-09-25_overhead-press_h3-max_v2.mp4` (1344×768, 8.0s)
**הגשה (בלי אודיו):** `https://res.cloudinary.com/dmrksuz8a/video/upload/ac_none/q_auto/v1790364294/overhead-press-v2.mp4`

## תהליך

כמו ב-`../back-squat/2026-09-25_back-squat.md`: תמונת פתיחה אחת מ-`openai/gpt-image-2.5/flare/edit` (1536×864, high), עם הדמות, שלושת גיליונות הדמות (זוויות/SIDE, הבעות/FOCUSED, תאורה/GYM), הלוגו ותפאורת חדר הכושר המסוגננת. אחריה סרטון `minimax/h3-max/image-to-video` אחד, `image_url` = `end_image_url` = תמונת הפתיחה, `resolution: 768P`, `duration: 8`, כדי שהסרטון יתחיל וייגמר באותו פריים וירוץ בלולאה חלקה. הפרומפט: "EXACTLY ONE repetition", רמזי המאגר (`knowledge/exercise-technique.md`), מצלמה קבועה, בלי טקסט ובלי דיבור. הבדיקה: 8 פריימים ברוחב 960 (0.5s–7.7s) מול המאגר.

עלויות משוערות: תמונת מפתח ~$0.055, סרטון ~$0.32 (768P, 8s, במבצע).

## תמונות מפתח

| קובץ | מה | request_id | הערה |
|---|---|---|---|
| `keyframes/attempts/2026-09-25_overhead-press_kf-start-v1_gpt-image-2-5-flare-edit.png` | עמדת פתיחה, מוט על הכתפיים | `01a0d950-cd3b-7f13-906d-9bc8e7675c6a` | נפסלה: אין מקום מעל הראש ללחיצה |
| `keyframes/2026-09-25_overhead-press_kf-start_gpt-image-2-5-flare-edit.png` | **אותה עמדה, מצלמה רחוקה יותר** | `01a0d951-a6c1-7852-9f68-f4307c315fe9` | עריכה של v1: zoom out |

## סרטונים

| קובץ | request_id | תוצאה |
|---|---|---|
| `attempts/2026-09-25_overhead-press_h3-max_v1.mp4` | `01a0d955-719e-72a1-bba3-9e34b09469a1` | ❌ כיפוף ברכיים (דחיפת רגליים) והטיה לאחור |
| `2026-09-25_overhead-press_h3-max_v2.mp4` | `01a0d99d-5ed0-76b0-ba3f-ea004975f0e3` | ✅ **סופי.** פרומפט "STRICT press, legs straight, no dip" |

## בדיקה מול מאגר הידע (הגרסה הסופית)

| רמז (knowledge/exercise-technique.md) | תוצאה |
|---|---|
| חזרה אחת בלבד, פריים סיום זהה לפתיחה | ✅ |
| רגליים ישרות, בלי דחיפת רגליים (לחיצה קפדנית) | ✅ |
| אגן ניטרלי, בלי קשתית יתר בגב התחתון | ✅ |
| מסלול מוט אנכי, נעילה מעל אמצע כף הרגל | ✅ |
| לא דוחף את כל פלג הגוף העליון קדימה | ✅ |
