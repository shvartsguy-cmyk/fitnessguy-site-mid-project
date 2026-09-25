# רקע ל-hero: חדר כושר — 2026-09-25

שתי גרסאות של אותה סצנה, לרקע של אזור הכותרת והגרף. התמונות נוצרו בניגודיות רגילה; הדהייה, הגוון האפור ומעבר הצבע ייעשו ב-CSS כדי שיהיה אפשר לכוונן אותם מול דרישות הניגודיות (תקן 5568) בלי לייצר מחדש.

על נעל המתאמנת בסקוואט יש לוגו Nike. הוא הושאר בכוונה, לבקשת המשתמש, כדי שהתמונה תרגיש מציאותית.

## מחשב

`2026-09-25_hero-gym-desktop_gpt-image-2-5-flare.png`, 2560×1440 (16:9). הפעילות בפס האמצעי כדי לשרוד חיתוך `cover`.

- **מודל:** `openai/gpt-image-2.5/flare/text-to-image`
- **פרמטרים:** `image_size: {width: 2560, height: 1440}`, `quality: high`, `output_format: png`
- **request_id:** `01a0d8a0-990f-7780-aaf7-baa5197f6478`
- **עלות משוערת:** ~$0.055

```
Photorealistic wide-angle photograph of the interior of a modern, serious strength-training gym, shot at eye level with deep perspective: rows of squat racks, barbells, plates and benches receding into the background. Moody low-key lighting with a cool blue-grey color grade, dark concrete floor and dark walls, a few subtle turquoise/cyan accent light strips along the ceiling and walls, soft haze in the air catching the light. Three to five people training naturally in the mid-ground and background, mid-exercise and absorbed in their workout — one doing a barbell back squat in a rack, one doing a deadlift, one doing a dumbbell row — candid, not posing, not looking at the camera, their faces natural but not the focus; moderate depth of field so the people are slightly soft. Composition: the main activity sits in the horizontal middle band of the frame; the top area is ceiling and lights, the bottom is floor. Realistic documentary photography, natural skin, realistic anatomy and hands, natural contrast (not faded). No text, no signs, no logos, no brand names on any equipment or clothing, no mirrors.
```

## נייד

`2026-09-25_hero-gym-mobile_gpt-image-2-5-flare-edit.png`, 1440×2560 (9:16). השליש העליון שקט (תקרה ותאורה) כי בנייד הכותרת למעלה; המתאמנים באמצע.

- **מודל:** `openai/gpt-image-2.5/flare/edit`, עם גרסת המחשב כתמונת ייחוס (`image_urls`) לשמירה על אותה סצנה.
- **פרמטרים:** `image_size: {width: 1440, height: 2560}`, `quality: high`, `output_format: png`
- **request_id:** `01a0d8a3-8037-7683-ac1a-ecb630b55052`
- **עלות משוערת:** ~$0.055

```
Create a vertical (portrait) version of this exact gym photograph for a mobile phone screen: the same gym interior, the same equipment style (black squat racks, black plates, benches, dumbbells), the same dark concrete floor and walls, the same moody low-key cool blue-grey color grade, the same turquoise/cyan accent light strips and soft haze, and people of the same look and clothing training naturally. Recompose it as a tall vertical frame shot at eye level down the central aisle, with deep perspective receding toward a vanishing point. Composition for a phone: the top third of the frame is calm — dark ceiling, light fixtures and haze, no people; the people training (two or three of them, e.g. one doing a barbell back squat in a rack and one doing a dumbbell row on a bench) sit in the middle and lower-middle of the frame, candid, mid-exercise, not looking at the camera, faces natural but not the focus, slightly soft with moderate depth of field; the bottom is floor. Realistic documentary photography, natural contrast (not faded), realistic anatomy and hands. No text, no signs, no mirrors.
```

## שילוב באתר

- **Cloudinary:** `fitnessguy/hero/hero-gym-desktop` (v1790341244), `fitnessguy/hero/hero-gym-mobile` (v1790341249). מוגשות עם `e_saturation:-80/w_<n>/f_auto,q_auto:low`: מחשב 1280/1920/2560 (≈53/85/132KB), נייד 720/1080 (≈66/108KB). החלפה בין הגרסאות ב-900px, כמו שבירת ה-grid של ה-hero.
- **CSS (`.hero-bg` ב-`app/styles.css`):** `--hero-bg-opacity: 0.3`, ומעליה מעברי צבע לגוון `--base`, כהים יותר מאחורי הטקסט (ימין) והגרף (שמאל) ובתחתית.
- **ניגודיות שנמדדה** (הפיקסל הבהיר ביותר מאחורי כל רכיב, צילום מסך בלי טקסט):

| רכיב | דרישה | מחשב | נייד |
|---|---|---|---|
| h1 | 3:1 | 10.81 | 12.15 |
| lede (אפור, הכי רגיש) | 4.5:1 | 5.35 | 4.89 |
| hero-note | 4.5:1 | 6.93 | 5.77 |
| תוויות הגרף | 4.5:1 | 5.94 | 7.03 |
| קו הגרף "תקוע" (אחרי תיקון הצבע ל-#7a838b) | 3:1 | 3.80 (לפני: 1.79) | — |

קו הגרף נכשל גם לפני הרקע, בגלל צבע `--iron`. הצבע תוקן ל-`#7a838b`.

**פנס (מחשב בלבד, `--reveal: 0.88` ב-`.hero .spot`):** נמדד עם הפנס מכוון לארבע נקודות (מעל תת-הכותרת ומעל הגרף). המינימום: lede 4.77:1, קו הגרף 3.16:1, תוויות הגרף 5.25:1 — הכל עובר.
