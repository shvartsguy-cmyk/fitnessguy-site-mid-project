# קונספטים לדמות המאמן — 2026-09-25

ארבעה כיווני סגנון לאותה דמות, להשוואה ובחירת כיוון. כל הפרמטרים והפרומפט הבסיסי זהים; רק משפט ה-Style משתנה.

## הגדרות משותפות

- **מודל:** `openai/gpt-image-2.5/flare/text-to-image`
- **פרמטרים:** `image_size: {width: 1024, height: 1536}`, `quality: high`, `num_images: 1`, `output_format: png`
- **Seed:** המודל לא מקבל ולא מחזיר seed — הפרומפט והפרמטרים הם כל מה שצריך לשחזור (התוצאה לא תהיה זהה פיקסל-לפיקסל).
- **עלות משוערת:** ~$0.05 לתמונה

### פרומפט בסיס

```
Full-body 3D stylized character of a muscular male fitness coach, standing confidently facing the viewer with arms crossed, head to toe fully visible and centered. He wears a fitted charcoal athletic t-shirt, black training shorts and clean white sneakers. Style: <STYLE>. Plain seamless light-grey studio background, soft three-point studio lighting, gentle floor shadow. No text, no logos.
```

## הקונספטים

| קובץ | `<STYLE>` | request_id |
|---|---|---|
| `2026-09-25_character-sculptural_gpt-image-2-5-flare.png` | sculptural — rendered like a polished contemporary sculpture, smooth matte clay-like surfaces, simplified and elegant anatomical planes, refined idealized proportions, minimal surface detail, subtle soft subsurface glow | `01a0d837-c34e-7ca2-9c44-0719af2a6c21` |
| `2026-09-25_character-lab-coach_gpt-image-2-5-flare.png` | lab coach — clean, precise, science-inspired 3D character design, crisp smooth materials like a high-end collectible figure, subtle technical details such as a small clip-on heart-rate sensor on the waistband and a stopwatch on a lanyard, a methodical and analytical expression | `01a0d838-af9f-7923-9607-4f6a617a0b66` |
| `2026-09-25_character-low-poly_gpt-image-2-5-flare.png` | low-poly geometric — a faceted 3D model built from clearly visible flat triangular polygons, crisp hard edges between facets, flat-shaded surfaces, stylized angular anatomy, like a modern low-poly game character | `01a0d839-4126-7d40-9d21-b23fdbe3a1e2` |
| `2026-09-25_character-heroic-athletic_gpt-image-2-5-flare.png` | heroic athletic — the look of a hero from a modern 3D animated feature film, stylized heroic proportions with broad shoulders and a strong V-taper, an expressive confident friendly face, rich polished materials, a slightly stronger rim light that outlines the silhouette | `01a0d839-b306-7940-a911-53cd992d5c0a` |

## כיוון נבחר: Heroic Athletic + לוגו

`2026-09-25_character-heroic-athletic-logo_gpt-image-2-5-flare-edit.png`

- **מודל:** `openai/gpt-image-2.5/flare/edit`
- **קלט (`image_urls`):** (1) תמונת ה-Heroic Athletic למעלה, (2) `media/logo-fitnessguy.png`
- **פרמטרים:** `image_size: {width: 1024, height: 1536}`, `quality: high`, `output_format: png`
- **שינוי:** החולצה הוחלפה מכהה לבהירה, כי לוגו כהה על חולצה כהה כמעט לא נראה. הלוגו הודפס בצבעיו המקוריים.
- **request_id:** `01a0d83e-0525-7ed0-b459-e643235f04ef`
- **עלות משוערת:** ~$0.04

```
Edit the first image (the 3D animated fitness coach character). Change only his t-shirt: make it a clean light-grey/off-white fitted athletic t-shirt instead of charcoal, and print the logo from the second image on the center of the chest, at a natural chest-logo size, in the logo's original colors (black, dark grey and turquoise), following the fabric's folds and lighting. Use only the logo mark itself, not the white background around it. Keep everything else exactly the same: his face, hair, expression, body, crossed-arms pose, black shorts, white sneakers, the 3D animated-film style, the light-grey studio background, lighting and framing.
```

### לוגו גדול וממורכז

`2026-09-25_character-heroic-athletic-logo-large_gpt-image-2-5-flare-edit.png`

- **מודל ופרמטרים:** כמו בעריכה הקודמת.
- **קלט (`image_urls`):** (1) הגרסה עם הלוגו הקטן, (2) `media/logo-fitnessguy.png`
- **request_id:** `01a0d83f-60b7-7152-9129-4d38ca864035`
- **עלות משוערת:** ~$0.04

```
Edit the first image. Change only the logo on the t-shirt: make it significantly larger and place it exactly centered horizontally on the shirt, centered in the visible chest area between the collar and the crossed arms, filling most of the chest width. Reproduce the logo mark from the second image accurately, in its original colors (black, dark grey and turquoise), without its white background, printed on the fabric and following its folds and lighting. Keep everything else exactly the same: the light-grey t-shirt, his face, hair, expression, body, crossed-arms pose, black shorts, white sneakers, the 3D animated-film style, the light-grey studio background, lighting and framing.
```

### לוגו מתחת לידיים

`2026-09-25_character-heroic-athletic-logo-lower_gpt-image-2-5-flare-edit.png`

- **מודל ופרמטרים:** כמו בעריכות הקודמות.
- **קלט (`image_urls`):** (1) הגרסה עם הלוגו הגדול, (2) `media/logo-fitnessguy.png`
- **request_id:** `01a0d841-3d8a-73e3-a4de-48eec5d08eb3`
- **עלות משוערת:** ~$0.04

```
Edit the first image. Change only the logo on the t-shirt: move it down so it sits on the lower part of the shirt, fully visible below the crossed arms, centered horizontally in the visible stomach area between the crossed arms and the waistband of the shorts, not covered by the arms at all. Make it just slightly smaller than it is now (about 10-15% smaller), so it fits comfortably in that area. Remove the logo from the chest so there is only one logo. Reproduce the logo mark from the second image accurately, in its original colors (black, dark grey and turquoise), without its white background, printed on the fabric and following its folds and lighting. Keep everything else exactly the same: the light-grey t-shirt, his face, hair, expression, body, crossed-arms pose, black shorts, white sneakers, the 3D animated-film style, the light-grey studio background, lighting and framing.
```

### לוגו מאחורי הידיים

`2026-09-25_character-heroic-athletic-logo-behind-arms_gpt-image-2-5-flare-edit.png`

- **מודל ופרמטרים:** כמו בעריכות הקודמות.
- **קלט (`image_urls`):** (1) הגרסה עם הלוגו הגדול (`...-logo-large_...`), (2) `media/logo-fitnessguy.png`
- **request_id:** `01a0d847-d8af-7de2-bd53-f670970b1edb`
- **עלות משוערת:** ~$0.04

```
Edit the first image. Change only the position of the logo on the t-shirt: move it down so it is centered horizontally and vertically centered at the height of the crossed arms, printed on the shirt behind the forearms. The crossed arms must be in front of the logo and naturally cover part of it (roughly the middle band of the logo), with the top and bottom portions of the logo still visible above and below the arms, like a real print on the shirt partly hidden by the arms. Keep the logo the same size as it is now. Remove it from its current higher position so there is only one logo. Reproduce the logo mark from the second image accurately, in its original colors (black, dark grey and turquoise), without its white background, following the fabric's folds and lighting. Keep everything else exactly the same: the light-grey t-shirt, his face, hair, expression, body, the arms and crossed-arms pose, black shorts, white sneakers, the 3D animated-film style, the light-grey studio background, lighting and framing.
```

### גרסה סופית: ידיים משוחררות

`2026-09-25_character-heroic-athletic-arms-relaxed_gpt-image-2-5-flare-edit.png`

- **מודל ופרמטרים:** כמו בעריכות הקודמות.
- **קלט (`image_urls`):** (1) הגרסה עם הלוגו הגדול (`...-logo-large_...`), (2) `media/logo-fitnessguy.png`
- **request_id:** `01a0d84b-2349-7372-8b49-af9164dc17b9`
- **עלות משוערת:** ~$0.04

```
Edit the first image. Change the pose of the arms only: instead of crossed arms, his arms now hang relaxed and naturally at his sides, slightly away from the body, hands loose and relaxed, a calm confident standing pose. With the arms uncrossed, the logo on the t-shirt must be fully visible: keep it large and exactly centered on the chest, the same size and position as now, completing any part that was hidden by the arms. Reproduce the logo mark from the second image accurately, in its original colors (black, dark grey and turquoise), without its white background, following the fabric's folds and lighting. Keep everything else exactly the same: the light-grey t-shirt, his face, hair, friendly expression, muscular body and proportions, black shorts, white sneakers, leg stance, the 3D animated-film style, the light-grey studio background, lighting and full-body framing.
```

### גרסה באיכות גבוהה (upscale)

`2026-09-25_character-heroic-athletic-final-hq_topaz-cgi-3x.png` — **3072×4608**

- **מקור:** `2026-09-25_character-heroic-athletic-arms-relaxed_gpt-image-2-5-flare-edit.png` (1024×1536)
- **מודל:** `topaz/upscale/image/precision`, הגדלה נאמנה בלי שינוי תוכן
- **פרמטרים:** `model: CGI`, `upscale_factor: 3`, `face_enhancement: false` (כדי שהפנים יישארו בסגנון 3D ולא יהפכו לריאליסטיות), `output_format: png`
- **request_id:** `01a0d84d-d3b9-7b82-a9e7-53beea7c3269`
- **עלות:** $0.08 (עד 24MP)

## Character Sheets

כל הגיליונות נבנו מ-`2026-09-25_character-heroic-athletic-arms-relaxed_gpt-image-2-5-flare-edit.png` (תמונת ייחוס) + `media/logo-fitnessguy.png`, עם `openai/gpt-image-2.5/flare/edit`, `image_size: {width: 2560, height: 1440}`, `quality: high`, `output_format: png`. עלות משוערת ~$0.055 לגיליון.

### גיליון 1: Turnaround

`2026-09-25_character-sheet-1-turnaround_gpt-image-2-5-flare-edit.png`. 5 זוויות (חזית, 3/4 חזית, צד, 3/4 גב, גב) + דוגמיות צבע. request_id: `01a0d853-c824-77d1-81c6-aca29147f2f2`

```
Create a professional character turnaround model sheet of the exact character in the first image, for use as a consistency reference by animators. Show the same character five times, full body head to toe, side by side in a single row, all at exactly the same scale, standing on the same baseline, evenly spaced, in the same relaxed neutral standing pose with arms hanging naturally at his sides: 1) front view, 2) three-quarter front view (turned 45 degrees), 3) side profile view (turned 90 degrees), 4) three-quarter back view, 5) back view. The character must be identical in every view: same face, hair, skin tone, muscular proportions, light-grey t-shirt, black training shorts and white sneakers. The logo from the second image appears only on the front of the t-shirt, large and centered on the chest, in its original colors (black, dark grey and turquoise), correctly foreshortened in the three-quarter and side views; the back of the t-shirt is plain with no logo. Same 3D animated-film style as the first image. Flat, even, neutral studio lighting with soft shadows, identical in every view. Clean plain very light grey background. Under each figure a small clean uppercase label: FRONT, 3/4 FRONT, SIDE, 3/4 BACK, BACK. A small clean title at the top left: FITNESS GUY - CHARACTER TURNAROUND. Along the bottom, a neat row of six flat color swatch squares with small uppercase labels: SKIN, HAIR, SHIRT, SHORTS, SNEAKERS, LOGO TURQUOISE, sampled from the character. Minimal, professional model-sheet layout, sans-serif typography.
```

### גיליון 2: הבעות פנים

`2026-09-25_character-sheet-2-expressions_gpt-image-2-5-flare-edit.png`. 8 הבעות (NEUTRAL, WARM SMILE, LAUGHING, FOCUSED, ENCOURAGING, SURPRISED, THINKING, EMPATHETIC). request_id: `01a0d854-f516-70e2-a9a9-d26f7d5142fe`

הערות: EMPATHETIC יצא יותר חיוך יודע מאשר הבעה רכה ואכפתית; הצוואר מעט צר יותר מבגרסת הגוף המלא.

```
Create a professional facial expression sheet of the exact character in the first image, for use as a consistency reference by animators. A clean grid of 8 equal panels in 2 rows of 4. Each panel shows the same character from the head to the upper chest, front view facing the camera, at exactly the same scale and framing, wearing the same light-grey t-shirt (the top of the logo from the second image may be visible at the bottom edge of the panel, in its original colors). The face, hair, skin tone, eye color, eyebrows, jawline and proportions must be identical in every panel; only the facial expression changes. The 8 expressions, in this order: 1) NEUTRAL - calm, relaxed face; 2) WARM SMILE - friendly closed-mouth smile; 3) LAUGHING - big open-mouth genuine laugh; 4) FOCUSED - determined, concentrated look with slightly furrowed brows; 5) ENCOURAGING - enthusiastic, motivating open smile with raised eyebrows; 6) SURPRISED - raised eyebrows, wide eyes, slightly open mouth; 7) THINKING - pensive look, eyes glancing up and to the side, slight smirk; 8) EMPATHETIC - soft, caring, understanding expression with gently raised inner eyebrows. Same 3D animated-film style as the first image. Identical soft neutral studio lighting in every panel. Clean plain very light grey background. Under each panel a small clean uppercase label with the expression name: NEUTRAL, WARM SMILE, LAUGHING, FOCUSED, ENCOURAGING, SURPRISED, THINKING, EMPATHETIC. A small clean title at the top left: FITNESS GUY - EXPRESSION SHEET. Minimal, professional model-sheet layout, sans-serif typography.
```
