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
