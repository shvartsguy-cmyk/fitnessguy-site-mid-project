# Fitness Guy Site v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Fitness Guy site to the v2 design — modern typography, a depth-and-motion system, a technique page driven by the knowledge base, and the three legal pages required by Israeli law.

**Architecture:** Static multi-page site, no build step and no framework. Five HTML pages share one stylesheet and one main script; the technique page adds its own script and reads `exercises.json`. All backend calls stay mocked behind `ENDPOINTS`, `askBot` and `submitLead` in `main.js`.

**Tech Stack:** Plain HTML, CSS and ES modules-free vanilla JS. Google Fonts. Cloudinary for images. Python's `http.server` for local serving. Playwright (via MCP) for verification.

**Spec:** `spec/site-design-spec.md` — read it before starting. `spec/site-structure.md` holds the section map, with its typography and motion sections superseded.

## Global Constraints

- Hebrew RTL. Every page carries `<html lang="he" dir="rtl">`.
- **Never invent knowledge-base content.** Exercise cues, mistakes, prices, policies and research claims come verbatim from `knowledge/`. A field that cannot be sourced stays empty.
- Display type is `Noto Sans Hebrew` weight 900 and is used for `h1`, `h2`, `h3` only. Everything else is `IBM Plex Sans Hebrew` (300/400/600/700).
- Accent `#13E3E6` is reserved for three uses: the chart breakthrough, the primary CTA, and success states. Never decorative.
- Every motion component degrades under `prefers-reduced-motion: reduce`.
- Bot replies render through `textContent`, never `innerHTML`.
- No API keys in client code, ever.
- Serve over http. `file://` breaks `fetch`.
- **Python on this machine:** `python3` is broken. Use `/c/Users/guy/AppData/Local/Programs/Python/Python312/python`.
- Serve command, run from `app/`: `python -m http.server 8787 --bind 127.0.0.1`
- Commit after every task.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/index.html` | Landing page. Modified, not rewritten. |
| `app/technique.html` | Exercise technique master–detail page. New. |
| `app/privacy.html` | Privacy policy. New. |
| `app/terms.html` | Terms of service. New. |
| `app/accessibility.html` | Accessibility statement. New. |
| `app/styles.css` | All styling for all pages. Modified. |
| `app/main.js` | Shared: loader, nav, chat, lead form, motion. Modified. |
| `app/technique.js` | Technique page only: load JSON, filter, select, deep link. New. |
| `app/exercises.json` | Ten exercises derived from the knowledge base. New. |

---

## Task 1: Typography and token foundation

**Files:**
- Modify: `app/index.html` (the Google Fonts `<link>` in `<head>`)
- Modify: `app/styles.css` (`:root` block and the `h1`/`h2`/`h3` rules)

**Interfaces:**
- Produces: CSS custom properties `--display`, `--text`, `--z-grain`, `--z-content` used by every later task.

- [ ] **Step 1: Replace the font link**

In `app/index.html`, replace the existing `fonts.googleapis.com` `<link href=...>` with:

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@900&family=IBM+Plex+Sans+Hebrew:wght@300;400;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the font and z-index tokens**

In `app/styles.css`, inside `:root`, replace the `--display` and `--text` lines with:

```css
  --display: "Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif;
  --text: "IBM Plex Sans Hebrew", "Arial Hebrew", Arial, sans-serif;

  --z-grain: 1;
  --z-content: 2;
  --z-nav: 60;
  --z-chat-btn: 70;
  --z-chat: 80;
  --z-loader: 300;
```

- [ ] **Step 3: Update the heading scale**

Replace the existing `h1`, `h2`, `h3` size rules with:

```css
h1 { font-size: clamp(2.2rem, 1.2rem + 4vw, 4.5rem); letter-spacing: -0.02em; line-height: 1.08; }
h2 { font-size: clamp(1.8rem, 1.2rem + 2.4vw, 3rem); letter-spacing: -0.015em; line-height: 1.12; }
h3 { font-size: clamp(1.15rem, 1rem + 0.7vw, 1.5rem); letter-spacing: normal; line-height: 1.25; }
```

Keep `font-family: var(--display)` and `font-weight: 900` on the shared `h1, h2, h3` rule.

- [ ] **Step 4: Swap the hard-coded z-index values to tokens**

In `.nav` use `z-index: var(--z-nav)`, in `.chat-open` use `var(--z-chat-btn)`, in `.chat` use `var(--z-chat)`, in `.loader` use `var(--z-loader)`.

- [ ] **Step 5: Verify in the browser**

Serve from `app/`, open `http://127.0.0.1:8787/index.html`, screenshot at 1440px.

Expected: headings render in a heavy geometric sans, not a serif. Body text is visibly a different family from headings. Zero console errors.

- [ ] **Step 6: Commit**

```bash
git add app/index.html app/styles.css
git commit -m "Switch to Noto Sans Hebrew display and IBM Plex body type"
```

---

## Task 2: Depth and texture

**Files:**
- Modify: `app/index.html` (add grain element as first child of `<body>`)
- Modify: `app/styles.css` (grain, hero glow, stacking context)

**Interfaces:**
- Consumes: `--z-grain`, `--z-content` from Task 1.
- Produces: `.grain` element and `.spot` layer convention reused in Task 7.

- [ ] **Step 1: Add the grain element**

In `app/index.html`, immediately after `<body>`, before the loader:

```html
<div class="grain" aria-hidden="true"></div>
```

- [ ] **Step 2: Style the grain and fix stacking**

Append to `app/styles.css`:

```css
.grain {
  position: fixed;
  inset: 0;
  z-index: var(--z-grain);
  pointer-events: none;
  opacity: .035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

header.nav, main, footer.foot {
  position: relative;
  z-index: var(--z-content);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(60% 50% at 50% 40%, rgba(19, 227, 230, .10), transparent 70%);
}

.hero {
  position: relative;
}
```

- [ ] **Step 3: Verify the grain does not cover content**

Reload and screenshot. Then click the floating chat button.

Expected: the dark background has visible fine texture. The chat button still opens the panel — if it does not, the grain is stealing pointer events and `pointer-events: none` is missing.

- [ ] **Step 4: Commit**

```bash
git add app/index.html app/styles.css
git commit -m "Add grain texture and hero glow for depth"
```

---

## Task 3: Mobile navigation

**Files:**
- Modify: `app/index.html` (hamburger button inside `.nav-in`)
- Modify: `app/styles.css` (panel styles, media query)
- Modify: `app/main.js` (toggle logic)

**Interfaces:**
- Produces: `#nav-toggle` and `#nav-panel`, reused verbatim on all four other pages in Tasks 4 and 6.

- [ ] **Step 1: Add the button and panel markup**

In `app/index.html`, inside `.nav-in`, immediately before the `.nav-cta` anchor:

```html
<button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel">
  <span class="nav-toggle-bars" aria-hidden="true"></span>
  <span class="skip">תפריט</span>
</button>
```

And immediately after the closing `</div>` of `.nav-in`, still inside `header.nav`:

```html
<div class="nav-panel" id="nav-panel" hidden>
  <a href="#method">השיטה</a>
  <a href="#tracks">מסלולים</a>
  <a href="technique.html">טכניקה</a>
  <a href="#faq">שאלות נפוצות</a>
</div>
```

- [ ] **Step 2: Style it**

Append to `app/styles.css`:

```css
.nav-toggle { display: none; background: none; border: 1px solid var(--iron-lo); padding: .6rem .7rem; cursor: pointer; }
.nav-toggle-bars, .nav-toggle-bars::before, .nav-toggle-bars::after { display: block; width: 20px; height: 2px; background: var(--bone); content: ""; }
.nav-toggle-bars::before { transform: translateY(-6px); }
.nav-toggle-bars::after { transform: translateY(4px); }
.nav-panel { display: grid; gap: .25rem; padding: .5rem var(--gut) 1.25rem; border-top: var(--rule); }
.nav-panel a { display: block; padding: .7rem 0; text-decoration: none; color: var(--bone); border-bottom: var(--rule); }

@media (max-width: 860px) {
  .nav-toggle { display: block; }
}
@media (min-width: 861px) {
  .nav-panel { display: none !important; }
}
```

- [ ] **Step 3: Add the toggle logic**

Append to `app/main.js`:

```js
const navToggle = document.getElementById("nav-toggle");
const navPanel = document.getElementById("nav-panel");

if (navToggle && navPanel) {
  const setNav = (open) => {
    navPanel.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
  };
  navToggle.addEventListener("click", () => setNav(navPanel.hidden));
  navPanel.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setNav(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !navPanel.hidden) {
      setNav(false);
      navToggle.focus();
    }
  });
}
```

- [ ] **Step 4: Verify at phone width**

Resize to 375×844, reload. Click the hamburger, then press Escape.

Expected: panel opens with four links; Escape closes it and focus returns to the hamburger; `aria-expanded` flips between `"true"` and `"false"`. At 1440px the hamburger is not visible.

- [ ] **Step 5: Commit**

```bash
git add app/index.html app/styles.css app/main.js
git commit -m "Add mobile navigation menu"
```

---

## Task 4: Legal pages

**Files:**
- Create: `app/privacy.html`, `app/terms.html`, `app/accessibility.html`
- Modify: `app/styles.css` (add `.doc` layout)

**Interfaces:**
- Consumes: the nav markup from Task 3 — copy the full `<header class="nav">` and `<footer class="foot">` blocks from `index.html` into each page, changing in-page anchors like `#method` to `index.html#method`.

**Content — write exactly these sections. Every factual claim is transcribed from the knowledge base, never invented.**

`terms.html` — `<h1>` "תקנון ותנאי שימוש", then `<h2>` sections in this order:

| Section | Source |
|---|---|
| המסלולים והמחירים | `knowledge/pricing-expanded.md` — three tracks with their prices and what each includes |
| תנאי תשלום וגבייה | `knowledge/pricing-expanded.md` — billing on the 1st, payment methods, receipts |
| תקופת התחייבות | `knowledge/policy-sla-expanded.md` — 3-month minimum on Plateau Breaker and why |
| ביטול המנוי | `knowledge/policy-sla-expanded.md` — 14 business days written notice after the commitment ends |
| הקפאת המנוי | `knowledge/policy-sla-expanded.md` — up to 21 consecutive days, once per half calendar year |
| החזרים כספיים | `knowledge/policy-sla-expanded.md` — only for proven billing errors, within 7 business days |
| כשל בחיוב | `knowledge/policy-sla-expanded.md` — retry after 48h, service frozen, not cancelled for 14 days |
| זמני מענה | `knowledge/policy-sla-expanded.md` — 4 hours within activity hours, and the hours themselves |
| תנאי קבלה | `knowledge/faq-compatibility-expanded.md` — gym membership required, 18+, medical clearance |
| אחריות | `knowledge/policy-sla-expanded.md` — the clause on client non-compliance, plus that the site is not medical advice |

`privacy.html` — `<h1>` "מדיניות פרטיות", then:

| Section | Must say |
|---|---|
| איזה מידע נאסף | Lead form fields: full name, phone, email, training goal. Plus technical data: IP address. |
| שיחות עם הבוט | **That conversations with FitnessBot are stored in the `chat_logs` table in Supabase**, including the message, the reply and the timestamp. This is the disclosure most easily missed and it is mandatory. |
| סרטוני טכניקה | Uploaded videos are used only for internal biomechanical analysis by the assigned coach, are not shared with third parties or used for marketing without explicit written consent, and are deleted 90 days after the engagement ends. Source: `knowledge/policy-sla-expanded.md`. |
| למה המידע נאסף | Handling enquiries, matching a track, providing the service, and — only with separate consent — professional updates and weigh-in reminders. |
| דיוור ותזכורות | Marketing consent is separate and opt-in, and can be withdrawn at any time. |
| זכויות המשתמש | Right to inspect, correct and delete. Exercised via `support@fitnessguy.co.il`. |
| יצירת קשר | `support@fitnessguy.co.il`, WhatsApp 054-3035040. |

`accessibility.html` — `<h1>` "הצהרת נגישות", then:

| Section | Must say |
|---|---|
| רמת ההנגשה | The site targets Israeli Standard 5568, equivalent to WCAG 2.0 level AA. |
| מה הונגש | Full keyboard navigation, visible focus states, colour contrast meeting the standard, alt text on meaningful images, respect for reduced-motion preferences, and a responsive layout with no horizontal scrolling. |
| מגבלות ידועות | Exercise demonstration videos do not yet carry captions. State it plainly rather than omitting it. |
| תאריך הבדיקה האחרונה | The date this page is written. |
| רכז נגישות | גיא, מייסד החברה. WhatsApp 054-3035040, `support@fitnessguy.co.il`. |

- [ ] **Step 1: Add the document layout**

Append to `app/styles.css`:

```css
.doc { padding-block: clamp(2.5rem, 6vw, 4.5rem); }
.doc h1 { margin-bottom: 1.5rem; }
.doc h2 { font-size: clamp(1.3rem, 1.1rem + 1vw, 1.7rem); margin: 2.5rem 0 .9rem; }
.doc p, .doc li { color: var(--bone-dim); max-width: 62ch; }
.doc ul { padding-inline-start: 1.2rem; display: grid; gap: .5rem; }
.doc .updated { color: var(--iron); font-size: .9rem; }
```

- [ ] **Step 2: Create the three pages**

Each page has the same skeleton. `privacy.html` shown in full; the other two follow the identical structure with their own `<title>`, `<h1>` and sections.

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>מדיניות פרטיות — Fitness Guy</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@900&family=IBM+Plex+Sans+Hebrew:wght@300;400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<a class="skip" href="#main">דלגו לתוכן הראשי</a>

<!-- copy the full <header class="nav"> from index.html, with anchors pointed at index.html#... -->

<main id="main" class="wrap doc">
  <h1>מדיניות פרטיות</h1>
  <p class="updated">עודכן לאחרונה: 21.09.2026</p>
  <!-- sections per the content sourcing notes above -->
</main>

<!-- copy the full <footer class="foot"> from index.html -->

<script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify every link resolves**

From the served site, click each of the seven footer links and the four nav links on every page.

Expected: no 404 in the network panel, no console errors on any page. The mobile menu works on all three new pages.

- [ ] **Step 4: Commit**

```bash
git add app/privacy.html app/terms.html app/accessibility.html app/styles.css
git commit -m "Add privacy, terms and accessibility pages"
```

---

## Task 5: Exercise data file

**Files:**
- Create: `app/exercises.json`
- Read: `knowledge/exercise-technique.md`

**Interfaces:**
- Produces: the JSON array consumed by `technique.js` in Task 6 and referenced by the bot links in Task 11.

- [ ] **Step 1: Read the source document**

Read `knowledge/exercise-technique.md` in full. It has ten `## ` sections, each with a technique question and a common-mistakes question.

- [ ] **Step 2: Write the file**

One object per exercise, in this exact order and with these exact ids:

| id | name | pattern |
|---|---|---|
| `back-squat` | סקוואט אחורי | squat |
| `deadlift` | דדליפט קונבנציונלי | hinge |
| `bench-press` | לחיצת חזה | push |
| `overhead-press` | לחיצת כתפיים בעמידה | push |
| `barbell-row` | חתירה עם מוט | pull |
| `lat-pulldown` | מתח ומשיכת פולי עליון | pull |
| `rdl` | דדליפט רומני | hinge |
| `hip-thrust` | היפ תראסט | hinge |
| `leg-press` | לחיצת רגליים | squat |
| `lunge` | לאנג' הליכה / ספליט סקוואט | squat |

Shape, using the first entry as the worked example:

```json
[
  {
    "id": "back-squat",
    "name": "סקוואט אחורי",
    "nameEn": "Back Squat",
    "pattern": "squat",
    "video": null,
    "summary": "תרגיל הדחיפה המרכזי לפלג גוף תחתון, מבוצע לעומק מלא.",
    "cues": [
      "עומק מלא, עם רגליים ברוחב כתפיים בערך",
      "ללא הגבלה מכוונת על תזוזת הברך קדימה מעבר לבהונות",
      "גו זקוף יחסית ומבט קדימה־מעלה",
      "להימנע מקפיצה מתוך נקודת התחתית כדי לייצר תנע"
    ],
    "mistakes": [
      "קריסת ברכיים פנימה תחת עומס",
      "חוסר עקביות בעומק בין חזרה לחזרה",
      "הרמת עקבים מהרצפה עקב גמישות קרסול מוגבלת",
      "קפיצה מתחתית הסקוואט כדי לסייע בעלייה"
    ],
    "evidence": "סקירת־על מ־2024 שבחנה 15 מחקרים מצאה שכ־87% מהם תומכים בבטיחות הסקוואט העמוק ואינם מוצאים עלייה בסיכון לפציעה."
  }
]
```

Rules while transcribing:
- `cues` and `mistakes` are short bullet phrases extracted from the source answers, not full paragraphs.
- `evidence` is the research sentence from the source. If a section has none, use `""`.
- `summary` is one sentence describing what the exercise is for, drawn from its section.
- `video` is `null` for all ten.
- Never add a cue or mistake that is not in the source document.

- [ ] **Step 3: Validate the JSON**

Run from `app/`:

```bash
/c/Users/guy/AppData/Local/Programs/Python/Python312/python -c "import json;d=json.load(open('exercises.json',encoding='utf-8'));print(len(d));print([x['id'] for x in d])"
```

Expected: prints `10` and the ten ids in the table order.

- [ ] **Step 4: Commit**

```bash
git add app/exercises.json
git commit -m "Add exercises data derived from the technique knowledge doc"
```

---

## Task 6: Technique page

**Files:**
- Create: `app/technique.html`, `app/technique.js`
- Modify: `app/styles.css`

**Interfaces:**
- Consumes: `app/exercises.json` from Task 5; nav and footer markup from Tasks 3 and 4.
- Produces: URL fragments `technique.html#<id>` that Task 11 links to.

- [ ] **Step 1: Build the page shell**

`app/technique.html` uses the same head, grain, nav and footer as the legal pages. Its `<main>`:

```html
<main id="main" class="wrap tech">
  <h1>מדריכי טכניקה</h1>
  <p class="lede">עשרה תרגילי ליבה, עם רמזי ביצוע וטעויות נפוצות מתוך אותם מסמכים שהמאמנים שלנו עובדים לפיהם.</p>

  <div class="tech-filters" role="group" aria-label="סינון לפי תבנית תנועה">
    <button class="chip is-on" type="button" data-pattern="all">הכל</button>
    <button class="chip" type="button" data-pattern="squat">סקוואט</button>
    <button class="chip" type="button" data-pattern="hinge">כפיפת מותניים</button>
    <button class="chip" type="button" data-pattern="push">דחיפה</button>
    <button class="chip" type="button" data-pattern="pull">משיכה</button>
  </div>

  <div class="tech-grid">
    <ul class="tech-list" id="tech-list"></ul>
    <article class="tech-detail" id="tech-detail" aria-live="polite"></article>
  </div>
</main>
<script src="technique.js"></script>
```

- [ ] **Step 2: Style it**

```css
.tech-grid { display: grid; grid-template-columns: minmax(230px, 300px) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 3rem); margin-top: 2rem; align-items: start; }
.tech-filters { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.5rem; }
.chip { font-family: var(--text); font-size: .93rem; background: none; color: var(--bone-dim); border: 1px solid var(--iron-lo); padding: .45rem 1rem; cursor: pointer; }
.chip.is-on { color: var(--accent-ink); background: var(--accent); border-color: var(--accent); font-weight: 600; }
.tech-list { list-style: none; margin: 0; padding: 0; border-top: var(--rule); }
.tech-list button { width: 100%; text-align: start; font-family: var(--text); font-size: 1rem; color: var(--bone-dim); background: none; border: 0; border-bottom: var(--rule); padding: .95rem .4rem; cursor: pointer; }
.tech-list button:hover { color: var(--bone); }
.tech-list button[aria-current="true"] { color: var(--accent); font-weight: 600; }
.tech-video { aspect-ratio: 16/9; background: var(--surface); border: var(--rule); display: grid; place-items: center; color: var(--iron); text-align: center; padding: 1.5rem; }
.tech-video video { width: 100%; height: 100%; object-fit: cover; }
.tech-detail h2 { margin: 1.5rem 0 .5rem; }
.tech-detail h3 { margin: 1.75rem 0 .6rem; }
.tech-detail ul { margin: 0; padding-inline-start: 1.2rem; display: grid; gap: .5rem; color: var(--bone-dim); }
.tech-evidence { margin-top: 1.75rem; border-inline-start: 3px solid var(--accent); background: var(--surface); padding: 1rem 1.25rem; color: var(--bone-dim); font-size: .96rem; }

@media (max-width: 760px) {
  .tech-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Write the page logic**

`app/technique.js`:

```js
const listEl = document.getElementById("tech-list");
const detailEl = document.getElementById("tech-detail");
let exercises = [];
let filter = "all";
let currentId = null;

function render(ex) {
  currentId = ex.id;
  const parts = [];
  parts.push(`<div class="tech-video">${ex.video
    ? `<video controls preload="metadata" poster="${ex.video.poster || ""}"><source src="${ex.video.src}" type="video/mp4"></video>`
    : `<p>סרטון ההדגמה לתרגיל הזה בהכנה.</p>`}</div>`);
  parts.push(`<h2>${ex.name}</h2>`);
  if (ex.summary) parts.push(`<p class="lede">${ex.summary}</p>`);
  if (ex.cues.length) parts.push(`<h3>ביצוע נכון</h3><ul>${ex.cues.map((c) => `<li>${c}</li>`).join("")}</ul>`);
  if (ex.mistakes.length) parts.push(`<h3>טעויות נפוצות</h3><ul>${ex.mistakes.map((m) => `<li>${m}</li>`).join("")}</ul>`);
  if (ex.evidence) parts.push(`<p class="tech-evidence">${ex.evidence}</p>`);
  detailEl.innerHTML = parts.join("");

  listEl.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-current", String(b.dataset.id === ex.id));
  });
}

function select(id, push) {
  const ex = exercises.find((e) => e.id === id) || exercises[0];
  render(ex);
  if (push) history.pushState({ id: ex.id }, "", "#" + ex.id);
}

function paintList() {
  const shown = exercises.filter((e) => filter === "all" || e.pattern === filter);
  listEl.innerHTML = shown
    .map((e) => `<li><button type="button" data-id="${e.id}">${e.name}</button></li>`)
    .join("");
  listEl.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => select(b.dataset.id, true));
    b.setAttribute("aria-current", String(b.dataset.id === currentId));
  });
}

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    filter = chip.dataset.pattern;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-on", c === chip));
    paintList();
  });
});

window.addEventListener("popstate", () => {
  select(location.hash.slice(1), false);
});

fetch("exercises.json")
  .then((r) => r.json())
  .then((data) => {
    exercises = data;
    paintList();
    select(location.hash.slice(1), false);
  })
  .catch(() => {
    detailEl.textContent = "לא הצלחנו לטעון את רשימת התרגילים. רעננו את העמוד ונסו שוב.";
  });
```

Note on `innerHTML` here: the strings come from `exercises.json`, a file in this repo, not from user input or a network service. The ban on `innerHTML` in the global constraints targets bot replies, which are untrusted.

- [ ] **Step 4: Verify behaviour**

1. Open `http://127.0.0.1:8787/technique.html` — first exercise selected, list shows ten items.
2. Open `http://127.0.0.1:8787/technique.html#hip-thrust` directly — hip thrust is selected on load.
3. Click "משיכה" — list narrows to two exercises.
4. Click a second exercise, then press the browser back button — the previous exercise is restored.
5. At 375px the layout is a single column with no horizontal scroll.

Expected: every exercise shows cues, mistakes and evidence, and the video frame reads as intentional rather than broken.

- [ ] **Step 5: Commit**

```bash
git add app/technique.html app/technique.js app/styles.css
git commit -m "Add technique page with deep-linked exercises"
```

---

## Task 7: Cursor spotlight and scroll-linked chart

**Files:**
- Modify: `app/index.html` (spotlight layer in `.hero` and `.bot`)
- Modify: `app/styles.css`, `app/main.js`

**Interfaces:**
- Consumes: `.hero::before` glow from Task 2.
- Produces: the `prefersReduced` constant reused in Task 8.

**Deviation from spec, deliberate:** the spec offered a native `animation-timeline: view()` path with a JS fallback. Use the JS path only. Two code paths that can disagree is a worse outcome than one predictable path.

- [ ] **Step 1: Add spotlight layers**

In `index.html`, as the first child of both `<section class="hero">` and `<section class="bot">`:

```html
<div class="spot" aria-hidden="true"></div>
```

- [ ] **Step 2: Style them**

```css
.hero, .bot { position: relative; overflow: hidden; }
.spot {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(19, 227, 230, .07), transparent 65%);
  opacity: 0;
  transition: opacity .35s ease;
}
.spot.is-live { opacity: 1; }
```

- [ ] **Step 3: Wire the spotlight and the chart**

Append to `app/main.js`:

```js
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;

if (!prefersReduced && canHover) {
  document.querySelectorAll(".spot").forEach((spot) => {
    const host = spot.parentElement;
    let queued = false;
    host.addEventListener("pointermove", (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        spot.style.setProperty("--mx", x - r.left + "px");
        spot.style.setProperty("--my", y - r.top + "px");
        spot.classList.add("is-live");
        queued = false;
      });
    });
    host.addEventListener("pointerleave", () => spot.classList.remove("is-live"));
  });
}

const chartBreak = document.querySelector(".track-break");
const heroEl = document.querySelector(".hero");

if (chartBreak && heroEl) {
  const LEN = 260;
  if (prefersReduced) {
    chartBreak.style.strokeDashoffset = "0";
  } else {
    let queued = false;
    const paint = () => {
      const r = heroEl.getBoundingClientRect();
      const travelled = Math.min(Math.max(-r.top / (r.height * 0.6), 0), 1);
      chartBreak.style.strokeDashoffset = String(LEN * (1 - travelled));
      queued = false;
    };
    addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }
}
```

- [ ] **Step 4: Remove the timed break animation**

In `app/styles.css`, delete the `.anim .track-break` rule so the CSS animation no longer fights the scroll handler. Leave `.anim .track-stuck` — the grey line still draws once on load.

- [ ] **Step 5: Shorten the loader under reduced motion**

Spec section א.6 requires the loading screen to clear almost immediately when motion is reduced. In `app/main.js`, change the existing `window.addEventListener("load", ...)` handler so its delay depends on the preference:

```js
window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("done");
    setTimeout(() => loader.remove(), prefersReduced ? 0 : 600);
  }, prefersReduced ? 0 : 700);
});
```

`prefersReduced` is declared later in the file, but the handler only runs after the whole script has evaluated, so the binding is initialised by then.

- [ ] **Step 6: Verify**

1. Move the cursor across the hero — a soft cyan glow follows it.
2. Scroll slowly from the top — the cyan line grows as you scroll, and is complete by the time the hero leaves the viewport.
3. In Chrome DevTools, Rendering → Emulate `prefers-reduced-motion: reduce`, reload: the cyan line is fully drawn immediately, no glow tracks the cursor, and the loader clears at once.

- [ ] **Step 7: Commit**

```bash
git add app/index.html app/styles.css app/main.js
git commit -m "Link the plateau break to scroll and add cursor spotlight"
```

---

## Task 8: Count-up numbers, magnetic buttons, card edge light

**Files:**
- Modify: `app/index.html` (mark countable values)
- Modify: `app/styles.css`, `app/main.js`

**Interfaces:**
- Consumes: `prefersReduced` from Task 7.

- [ ] **Step 1: Mark the countable values**

In `index.html`, add `data-count` to each of the four `<dt>` elements in `.specs`. Leave their text exactly as it is — the final value must be present without JS.

- [ ] **Step 2: Implement the counter**

Append to `app/main.js`:

```js
function animateCount(el) {
  const original = el.textContent;
  const found = original.match(/\d+(\.\d+)?/g);
  if (!found) return;
  const targets = found.map(Number);
  const decimals = found.map((n) => (n.split(".")[1] || "").length);
  const DUR = 900;
  const start = performance.now();

  const frame = (now) => {
    const t = Math.min((now - start) / DUR, 1);
    const eased = 1 - Math.pow(2, -10 * t);
    let i = 0;
    el.textContent = original.replace(/\d+(\.\d+)?/g, () => {
      const value = (targets[i] * eased).toFixed(decimals[i]);
      i++;
      return value;
    });
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = original;
  };
  requestAnimationFrame(frame);
}

const countables = document.querySelectorAll("[data-count]");
if (countables.length && !prefersReduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  countables.forEach((el) => io.observe(el));
}
```

- [ ] **Step 3: Add magnetic buttons**

Append to `app/main.js`:

```js
if (!prefersReduced && canHover) {
  document.querySelectorAll(".btn-primary, .btn-ghost").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      btn.style.transform = `translate(${dx * 4}px, ${dy * 4}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}
```

- [ ] **Step 4: Add the card edge light**

```css
.track { position: relative; }
.track::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity .3s ease;
  background: linear-gradient(120deg, transparent 30%, rgba(19, 227, 230, .35) 50%, transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1px;
}
.track:hover::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .track::after { display: none; }
  .btn-primary, .btn-ghost { transform: none !important; }
}
```

- [ ] **Step 5: Verify**

1. Scroll to the method section — the four numbers count up once, then settle on their exact values including decimals (`1.6–2.2`, not `1.60–2.20`).
2. Hover a CTA — it drifts slightly toward the cursor and springs back on exit.
3. Hover a track card — a light traces its border, with no lift or shadow.
4. Under emulated reduced motion, reload: numbers show final values immediately, buttons do not move.
5. Disable JS and reload: the four numbers still read correctly.

- [ ] **Step 6: Commit**

```bash
git add app/index.html app/styles.css app/main.js
git commit -m "Add count-up numbers, magnetic CTAs and card edge light"
```

---

## Task 9: View transitions

**Files:**
- Modify: `app/styles.css`

- [ ] **Step 1: Enable and name the shared element**

Append to `app/styles.css`:

```css
@view-transition { navigation: auto; }

.brand img { view-transition-name: brand; }

@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }
}
```

- [ ] **Step 2: Verify**

Click "טכניקה" in the nav, then navigate back.

Expected: in Chrome the page cross-fades and the logo stays anchored. In a browser without support, navigation is ordinary and nothing breaks.

- [ ] **Step 3: Commit**

```bash
git add app/styles.css
git commit -m "Enable cross-page view transitions"
```

---

## Task 10: Stat strip and protein calculator

**Files:**
- Modify: `app/index.html`, `app/styles.css`, `app/main.js`

**Interfaces:**
- Consumes: the `[data-count]` mechanism from Task 8.

- [ ] **Step 1: Add the stat strip**

In `index.html`, directly after `</section>` of the hero and before `<section id="method">`:

```html
<section class="stats">
  <div class="wrap stats-in">
    <div><strong data-count>8+</strong><span>שנים בשוק</span></div>
    <div><strong>אלפי</strong><span>מתאמנים לוו עד היום</span></div>
    <div><strong data-count>2–3</strong><span>מאמנים בלבד, במכוון</span></div>
  </div>
</section>
```

"אלפי" carries no `data-count` — it is a word, not a number.

- [ ] **Step 2: Style it**

```css
.stats { padding-block: clamp(2rem, 4vw, 3rem); border-bottom: var(--rule); background: var(--base-deep); }
.stats-in { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
.stats-in div { display: grid; gap: .3rem; }
.stats-in strong { font-family: var(--display); font-weight: 900; font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.4rem); color: var(--accent); }
.stats-in span { color: var(--bone-dim); font-size: .95rem; }
@media (max-width: 640px) { .stats-in { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Add the calculator markup**

Inside the first `.spec` block in `index.html` (the `1.6–2.2 ג׳` row), append to its `<dd>`:

```html
<div class="calc">
  <label for="calc-w">חשבו את היעד שלכם — משקל גוף בק״ג</label>
  <input id="calc-w" type="number" inputmode="decimal" min="30" max="300" step="0.5" placeholder="70">
  <p class="calc-out" id="calc-out" aria-live="polite"></p>
</div>
```

- [ ] **Step 4: Style and wire it**

```css
.calc { margin-top: 1.25rem; display: grid; gap: .5rem; max-width: 34ch; }
.calc label { font-size: .92rem; color: var(--bone-dim); }
.calc input { font-family: var(--text); font-size: 1rem; color: var(--bone); background: var(--surface); border: 1px solid var(--iron-lo); padding: .65rem .8rem; }
.calc-out { color: var(--accent); font-weight: 600; min-height: 1.6em; }
```

```js
const calcInput = document.getElementById("calc-w");
const calcOut = document.getElementById("calc-out");

if (calcInput && calcOut) {
  calcInput.addEventListener("input", () => {
    const w = parseFloat(calcInput.value);
    if (!Number.isFinite(w) || w < 30 || w > 300) {
      calcOut.textContent = calcInput.value ? "הזינו משקל בין 30 ל-300 ק״ג." : "";
      return;
    }
    calcOut.textContent = `בין ${Math.round(w * 1.6)} ל-${Math.round(w * 2.2)} גרם חלבון ביום.`;
  });
}
```

- [ ] **Step 5: Verify**

Type `70` — expect "בין 112 ל-154 גרם חלבון ביום." Type `10` — expect the range message and no result. Clear the field — expect empty output, not an error.

- [ ] **Step 6: Commit**

```bash
git add app/index.html app/styles.css app/main.js
git commit -m "Add business stat strip and protein target calculator"
```

---

## Task 11: Bot links to technique videos

**Files:**
- Modify: `app/main.js`

**Interfaces:**
- Consumes: exercise ids from Task 5.
- Produces: the extended reply contract `{ reply, link? }` that the n8n webhook will later satisfy.

- [ ] **Step 1: Render replies with an optional link, safely**

In `app/main.js`, inside the chat form's `submit` handler, replace the line

```js
    thinking.textContent = reply;
```

with

```js
    renderReply(thinking, payload);
```

and rename the awaited variable on the line above from `reply` to `payload`. Then add this function to the file:

```js
function renderReply(bubble, payload) {
  bubble.textContent = payload.reply;
  const link = payload.link;
  if (link && typeof link.href === "string" && link.href.startsWith("technique.html#")) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label || "לצפייה בתרגיל";
    a.className = "msg-link";
    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(a);
  }
}
```

The `startsWith` check is the security boundary: any other href is dropped silently. `payload.reply` never goes through `innerHTML`.

- [ ] **Step 2: Update askBot to return the object shape**

Change `askBot` so both branches return `{ reply, link }`. The real branch returns the parsed JSON body as-is. In the mock branch, add technique matching before the existing keyword checks:

```js
const EXERCISE_HINTS = [
  ["סקוואט", "back-squat", "סקוואט אחורי"],
  ["דדליפט רומני", "rdl", "דדליפט רומני"],
  ["דדליפט", "deadlift", "דדליפט קונבנציונלי"],
  ["לחיצת חזה", "bench-press", "לחיצת חזה"],
  ["כתפיים", "overhead-press", "לחיצת כתפיים"],
  ["חתירה", "barbell-row", "חתירה עם מוט"],
  ["מתח", "lat-pulldown", "מתח ומשיכת פולי עליון"],
  ["פולי", "lat-pulldown", "מתח ומשיכת פולי עליון"],
  ["היפ תראסט", "hip-thrust", "היפ תראסט"],
  ["לחיצת רגליים", "leg-press", "לחיצת רגליים"],
  ["לאנג", "lunge", "לאנג' הליכה"],
];

const hit = EXERCISE_HINTS.find(([word]) => message.includes(word));
if (hit) {
  return {
    reply: `יש לנו מדריך טכניקה מלא ל${hit[2]}, כולל רמזי ביצוע, טעויות נפוצות והבסיס המחקרי.`,
    link: { href: `technique.html#${hit[1]}`, label: "לצפייה במדריך" },
  };
}
```

Order matters: "דדליפט רומני" must be tested before "דדליפט", otherwise every RDL question routes to the conventional deadlift.

- [ ] **Step 3: Style the link**

```css
.msg-link { color: var(--accent); font-weight: 600; display: inline-block; margin-top: .4rem; }
```

- [ ] **Step 4: Verify**

1. Open the chat, ask "איך עושים סקוואט" — the reply carries a link that opens `technique.html#back-squat`.
2. Ask "כמה זה עולה" — a reply with no link, exactly as before.
3. Ask "מה זה דדליפט רומני" — the link points to `#rdl`, not `#deadlift`.
4. In the console run `renderReply(document.createElement('div'), {reply:'x', link:{href:'javascript:alert(1)'}})` — no anchor is created.

- [ ] **Step 5: Commit**

```bash
git add app/main.js app/styles.css
git commit -m "Let the bot deep-link to technique guides"
```

---

## Task 12: Acceptance pass

**Files:** none changed unless a check fails.

- [ ] **Step 1: Run every acceptance check from the spec**

Serve the site and work through spec section 12 in order:

1. No horizontal overflow at 375px and 1440px, on all five pages. Measure, do not eyeball:

```js
(() => { const d = document.documentElement; return { w: d.clientWidth, s: d.scrollWidth, overflow: d.scrollWidth - d.clientWidth }; })()
```

Expected `overflow: 0` everywhere.

2. Zero console errors on all five pages.
3. Every nav and footer link resolves — no 404s in the network panel.
4. Chat panel stays at or under 70vh on mobile and has a working close button.
5. The technique page looks complete with all ten `video` fields still `null`.
6. `technique.html#back-squat` loads directly to the right exercise.
7. Under emulated reduced motion nothing animates and all content is visible.
8. Screenshots at 375px and 1440px of `index.html` and `technique.html` — open them and look before declaring done.

- [ ] **Step 2: Run the accessibility checks from spec section 10**

These are a legal requirement under Israeli Standard 5568, not polish.

1. **Keyboard only, no mouse.** Tab through `index.html` start to finish: the skip link appears first, the hamburger opens and closes with Enter and Escape, the chat opens and its input receives focus, the FAQ accordion toggles with Enter, and every form field is reachable. Repeat on `technique.html` for the filter chips and the exercise list.
2. **Focus is always visible.** No element may receive focus without a visible cyan outline.
3. **Contrast.** In DevTools, inspect `--bone-dim` (`#9AA4AC`) on `--base` (`#12161A`) and `--iron` (`#4A5056`) on `--base`. Body text must reach 4.5:1 and large text 3:1. `--iron` on the dark base is around 3:1 — if it is used anywhere for body-sized text, raise that text to `--bone-dim`.
4. **Structure.** Each of the five pages has exactly one `<h1>`, a `<main>` landmark, and alt text on every meaningful image. Decorative images — the grain layer, the footer logo — carry `alt=""` or `aria-hidden`.

- [ ] **Step 3: Fix anything that fails, then re-run the failed check**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Pass v2 acceptance checks"
```

---

## Out of scope

Listed so they do not creep in: AI image and video generation, connecting the real n8n webhooks, the 3D brand character, the plateau self-check tool, and pushing to GitHub. Each is its own piece of work.
