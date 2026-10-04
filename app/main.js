/* Fitness Guy — לוגיקת צד לקוח
 *
 * נקודות המגע עם השרת מרוכזות בשתי פונקציות בלבד: askBot ו-submitLead.
 * כרגע שתיהן מדומות. החלפה לחיבור אמיתי ל-n8n נוגעת רק בהן.
 */

const ENDPOINTS = {
  chat: "https://guy1023.app.n8n.cloud/webhook/fitnessguy/chat", // webhook של הסוכן ב-n8n
  lead: "https://guy1023.app.n8n.cloud/webhook/fitnessguy/lead", // webhook שמקבל את טופס הליד
  leadStatus: "https://guy1023.app.n8n.cloud/webhook/fitnessguy/lead-status", // נקודת polling לתוצאת ההתאמה
};

/* דגלים גלובליים שמשמשים כמה סקציות בהמשך הקובץ (מסך טעינה, זרקור, גרף,
 * ספירה עולה, כפתורים מגנטיים) — מוצהרים כאן למעלה כדי שסדר השימוש בקובץ
 * יהיה ברור מהמבנה, ולא רק "בטוח" בזכות hoisting/timing של load handlers. */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;

/* ---------- מזהה שיחה יציב, נפרד לגמרי מטלגרם ---------- */

function sessionId() {
  let id = null;
  try {
    id = localStorage.getItem("fg_session");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("fg_session", id);
    }
  } catch {
    id = crypto.randomUUID(); // גלישה פרטית — מזהה לטעינה הנוכחית בלבד
  }
  return id;
}

/* ---------- מסך טעינה ---------- */

const loader = document.getElementById("loader");
// הגרף מצויר רק כשמסך הטעינה נסגר, אחרת חלק מהאנימציה רץ מאחוריו
const startChart = () => document.querySelector(".chart")?.classList.add("anim");

if (loader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("done");
      startChart();
      setTimeout(() => loader.remove(), prefersReduced ? 0 : 600);
    }, prefersReduced ? 0 : 700);
  });
} else {
  startChart();
}

/* ---------- צ'אט ---------- */

const chat = document.getElementById("chat");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatDock = document.getElementById("chat-dock");
let lastFocus = null;

if (chat && chatForm) {
  const avatarSrc = chat.querySelector(".avatar img")?.getAttribute("src");

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + (who === "me" ? "msg-me" : "msg-bot");
    el.textContent = text;
    if (who !== "me" && avatarSrc) {
      const row = document.createElement("div");
      row.className = "msg-row";
      const face = document.createElement("img");
      face.className = "msg-face";
      face.src = avatarSrc;
      face.alt = "";
      face.width = 28;
      face.height = 28;
      row.append(face, el);
      chatLog.appendChild(row);
    } else {
      chatLog.appendChild(el);
    }
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function openChat() {
    lastFocus = document.activeElement;
    chat.hidden = false;
    chatDock.hidden = true;
    if (!chatLog.childElementCount) {
      addMessage(
        "שלום! אני FitnessBot. אפשר לשאול אותי על מסלולים ומחירים, מדיניות ביטול והקפאה, תזונה ותוספים, או טכניקה של תרגילים.",
        "bot"
      );
    }
    chatInput.focus();
  }

  function closeChat() {
    chat.hidden = true;
    chatDock.hidden = false;
    if (lastFocus) lastFocus.focus();
  }

  document
    .querySelectorAll("[data-chat-open]")
    .forEach((b) => b.addEventListener("click", openChat));

  document.getElementById("chat-close").addEventListener("click", closeChat);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !chat.hidden) closeChat();
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "me");
    chatInput.value = "";
    const thinking = addMessage("…", "bot");

    try {
      const payload = await askBot(text, (partial) => {
        thinking.textContent = partial;
        chatLog.scrollTop = chatLog.scrollHeight;
      });
      renderReply(thinking, payload);
    } catch {
      thinking.textContent =
        "לא הצלחתי להתחבר כרגע. אפשר לנסות שוב בעוד רגע, או להשאיר פרטים בטופס ההתאמה ונחזור אליכם.";
    }
  });
}

if (chatDock) {
  let queued = false;
  const updateDock = () => {
    const compact = scrollY > 40;
    if (compact) chatDock.classList.add("was-compact");
    chatDock.classList.toggle("is-compact", compact);
    queued = false;
  };
  addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateDock);
  }, { passive: true });
  updateDock();
}

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
  // הבוט מפנה לקוחות קיימים לטלגרם; הטקסט עצמו לא לחיץ, אז מוסיפים קישור קבוע
  if (typeof payload.reply === "string" && payload.reply.includes("t.me/fitnessguy1_bot")) {
    const a = document.createElement("a");
    a.href = "https://t.me/fitnessguy1_bot";
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "לפתוח את הבוט בטלגרם";
    a.className = "msg-link";
    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(a);
  }
}

/* נקודת מגע 1 עם השרת.
 * חוזה: POST { session_id, message }. התשובה מוזרמת כשורות JSON:
 * {"type":"begin"} ואז {"type":"item","content":"..."} לכל קטע, ובסוף {"type":"end"}.
 * onPartial מקבל את הטקסט שהצטבר עד כה, כדי שהתשובה תופיע תוך כדי כתיבה.
 * עד לחיבור n8n — מענה מדומה מתוך אותן עובדות שיושבות במאגר הידע. */
async function askBot(message, onPartial = () => {}) {
  if (ENDPOINTS.chat) {
    const res = await fetch(ENDPOINTS.chat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId(), message }),
    });
    if (!res.ok || !res.body) throw new Error("bad response");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reply = "";

    const handle = (line) => {
      if (!line.trim()) return;
      const chunk = JSON.parse(line);
      if (chunk.type === "item" && typeof chunk.content === "string") {
        reply += chunk.content;
        onPartial(reply);
      } else if (chunk.type === "error") {
        throw new Error("stream error");
      } else if (typeof chunk.reply === "string") {
        reply = chunk.reply; // תשובה רגילה, לא מוזרמת
      }
    };

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      lines.forEach(handle);
    }
    handle(buffer + decoder.decode());

    if (!reply.trim()) throw new Error("empty reply");
    return { reply };
  }

  await new Promise((r) => setTimeout(r, 750));
  const q = message.toLowerCase();

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

  if (q.includes("מחיר") || q.includes("עולה") || q.includes("כמה"))
    return { reply: "שלושה מסלולים: Foundation ב-450 ₪ חד־פעמי, Builder ב-550 ₪ לחודש ללא התחייבות, ו-Plateau Breaker ב-1,200 ₪ לחודש במינימום 3 חודשים." };
  if (q.includes("חלבון"))
    return { reply: "היעד שלנו הוא 1.6 עד 2.2 גרם חלבון לכל ק״ג משקל גוף ביום, לפי הנחיות ה-ISSN. צריכה מעבר לזה לא בונה שריר נוסף." };
  if (q.includes("קריאטין"))
    return { reply: "אנחנו ממליצים על קריאטין מונוהידראט, 3 עד 5 גרם ביום, בצריכה קבועה וללא שלבי העמסה." };
  if (q.includes("ביטול") || q.includes("להקפיא") || q.includes("הקפאה"))
    return { reply: "ביטול מתבצע בהודעה בכתב 14 ימי עסקים לפני החיוב הבא, לאחר תום ההתחייבות. הקפאה אפשרית עד 21 ימים רצופים, פעם אחת בחצי שנה." };
  if (q.includes("בית") || q.includes("ביתי"))
    return { reply: "הליווי דורש מנוי פעיל לחדר כושר מסודר. התוכניות בנויות על עומס יסף מכני שמחייב ציוד מלא, ולכן הן לא מותאמות לאימונים ביתיים." };

  return { reply: "זו שאלה טובה, ואין לי עליה תשובה מדויקת במאגר. אפשר להשאיר פרטים בטופס ההתאמה, והצוות יחזור אליכם." };
}

/* ---------- טופס ליד ---------- */

const leadForm = document.getElementById("lead-form");
const formErr = document.getElementById("form-err");
const pending = document.getElementById("pending");
const result = document.getElementById("result");

/* הדמיה בלבד, כשאין חיבור ל-n8n. אותם כללים כמו בשרת: המסלולים במאגר הידע
 * נבדלים ברמת הניסיון — מתחילים ל-Foundation, תקועים ל-Plateau Breaker, השאר ל-Builder. */
const TRACK_WHY = {
  "The Foundation": "המסלול הזה מתאים לכם כי הוא נבנה למתאמנים מתחילים: שיחת אפיון, תוכנית אימון ראשונית והנחיות תזונה בסיסיות, בתשלום חד-פעמי.",
  "The Builder": "המסלול הזה מתאים לכם כי אתם כבר מתאמנים ועובדים עצמאית: תוכנית אימונים מתקדמת, תוכנית תזונה ועדכון תוכנית כל חודש.",
  "The Plateau Breaker": "המסלול הזה מתאים לכם כי הוא נבנה בדיוק לשבירת תקיעות: ליווי אישי צמוד וניתוח ביומכני שבועי של הטכניקה.",
};
const ruleTrack = ({ level, goal }) =>
  level === "beginner" ? "The Foundation"
    : level === "stuck" || goal === "plateau" ? "The Plateau Breaker"
    : "The Builder";

// מסך ההמתנה מוצג לפחות כך, כדי שתוצאה מיידית לא תהבהב ותיעלם
const MIN_PENDING_MS = 1500;

if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formErr.hidden = true;

    const data = Object.fromEntries(new FormData(leadForm));

    if (!data.name || !data.phone || !data.email || !data.goal || !data.level) {
      return fail("צריך למלא שם, טלפון, אימייל, מטרה וניסיון.");
    }
    // כמו בבדיקת השרת: רק ספרות נחשבות, כך ש-050-000-0001 ו-050 0000001 שניהם תקינים
    if (!/^0\d{8,9}$/.test(String(data.phone).replace(/\D/g, ""))) {
      return fail("מספר הטלפון לא נראה תקין. פורמט לדוגמה: 050-0000000");
    }
    if (!leadForm.privacy.checked) {
      return fail("צריך לאשר את מדיניות הפרטיות כדי לשלוח.");
    }

    leadForm.hidden = true;
    pending.hidden = false;
    const shownAt = Date.now();

    try {
      const match = await submitLead({
        ...data,
        marketing: leadForm.marketing.checked,
        session_id: sessionId(),
      });
      const wait = MIN_PENDING_MS - (Date.now() - shownAt);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      pending.hidden = true;
      result.hidden = false;
      document.getElementById("result-title").textContent =
        "המסלול שמתאים לכם: " + match.track;
      document.getElementById("result-body").textContent = match.why;
      result.scrollIntoView({ block: "center" });
    } catch (err) {
      pending.hidden = true;
      leadForm.hidden = false;
      fail(err.userMessage || "השליחה נכשלה. אפשר לנסות שוב בעוד רגע, או לכתוב לנו במייל support@fitnessguy.co.il.");
    }
  });

  function fail(msg) {
    formErr.textContent = msg;
    formErr.hidden = false;
    formErr.scrollIntoView({ block: "center" });
  }
}

/* נקודת מגע 2 עם השרת.
 * חוזה: POST הליד → { job_id }, ואז polling על leadStatus עד { done, track, why }.
 * עד לחיבור n8n — המתנה קצרה והתאמה לפי המטרה שנבחרה. */
async function submitLead(payload) {
  if (ENDPOINTS.lead) {
    const res = await fetch(ENDPOINTS.lead, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // 400 מגיע עם הודעה ברורה מבדיקת השרת; מציגים אותה במקום הודעה כללית
      const err = new Error("bad response");
      try { err.userMessage = (await res.json()).error; } catch {}
      throw err;
    }
    const { job_id } = await res.json();

    // בלי שיחה קודמת ההתאמה לפי כללים מוכנה תוך שנייה; אחרי שיחה המודל מוסיף כמה שניות.
    // בודקים מהר בהתחלה, ואחר כך כל שנייה וחצי, עד דקה וחצי.
    const started = Date.now();
    for (let i = 0; Date.now() - started < 90000; i++) {
      await new Promise((r) => setTimeout(r, i < 3 ? 700 : 1500));
      const s = await fetch(`${ENDPOINTS.leadStatus}?job_id=${encodeURIComponent(job_id)}`);
      const data = await s.json();
      if (data.error) throw new Error("match failed");
      if (data.done) return data;
    }
    throw new Error("timeout");
  }

  await new Promise((r) => setTimeout(r, 600));
  const track = ruleTrack(payload);
  return { track, why: TRACK_WHY[track] };
}

/* ---------- ניווט נייד ---------- */

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

/* ---------- זרקור עכבר ---------- */

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

/* ---------- ספירה עולה למספרים בסקציית השיטה ---------- */

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
    // Load-bearing hard overwrite: masks floating-point imprecision in the easing
    // function at t=1 so ranges like "1.6–2.2" land back on their exact original text.
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

/* ---------- מחשבון יעד חלבון ---------- */

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

/* ---------- כפתורים מגנטיים ---------- */

if (!prefersReduced && canHover) {
  // הכפתור הצף לא זז — הדמות נשענת עליו
  document.querySelectorAll(".btn-primary:not(.chat-open), .btn-ghost").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      btn.style.transform = `translate(${dx * 4}px, ${dy * 4}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}

/* ---------- חזרה לראש העמוד ---------- */

const toTop = document.getElementById("to-top");

if (toTop) {
  const syncToTop = () => toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight);
  window.addEventListener("scroll", syncToTop, { passive: true });
  syncToTop();

  toTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    // המיקוד עובר לראש התוכן, כדי שמשתמש מקלדת לא יישאר בתחתית
    document.getElementById("main").focus({ preventScroll: true });
  });
}

/* ---------- סרטון העסק ---------- */

const storyFilm = document.getElementById("story-film");
const storyVideo = document.getElementById("story-video");
const storyToggle = document.getElementById("story-toggle");

if (storyFilm && storyVideo && storyToggle) {
  const caps = [...storyFilm.querySelectorAll(".story-cap")];
  // מי שעצר ידנית לא מקבל הפעלה אוטומטית כשהוא גולל חזרה
  let userPaused = prefersReduced;

  const syncCaption = () => {
    const t = storyVideo.currentTime;
    let current = caps[0];
    caps.forEach((c) => { if (t >= parseFloat(c.dataset.from)) current = c; });
    caps.forEach((c) => c.classList.toggle("is-on", c === current));
  };

  const syncButton = () => {
    const playing = !storyVideo.paused;
    storyFilm.classList.toggle("is-playing", playing);
    storyToggle.setAttribute("aria-label", playing ? "עצירת הסרטון" : "הפעלת הסרטון");
  };

  storyVideo.addEventListener("timeupdate", syncCaption);
  storyVideo.addEventListener("play", syncButton);
  storyVideo.addEventListener("pause", syncButton);

  storyToggle.addEventListener("click", () => {
    if (storyVideo.paused) {
      userPaused = false;
      storyVideo.play().catch(() => {});
    } else {
      userPaused = true;
      storyVideo.pause();
    }
  });

  // מתנגן רק כשהוא על המסך, כדי לא לבזבז נתונים וסוללה
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !userPaused) storyVideo.play().catch(() => {});
    else if (!entry.isIntersecting) storyVideo.pause();
  }, { threshold: 0.4 }).observe(storyFilm);
}

/* ---------- מסלולים: נקודות הקרוסלה ---------- */

const tracksEl = document.querySelector(".tracks");

if (tracksEl) {
  const cards = [...tracksEl.querySelectorAll(".track")];
  const dots = document.createElement("div");
  dots.className = "tracks-dots";
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "בחירת מסלול");

  const buttons = cards.map((card, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `מסלול ${i + 1} מתוך ${cards.length}: ${card.querySelector("h3").textContent}`);
    // scrollIntoView ולא scrollLeft, כי ב-RTL הסימן של scrollLeft שונה בין דפדפנים
    b.addEventListener("click", () => card.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth", inline: "start", block: "nearest",
    }));
    dots.appendChild(b);
    return b;
  });
  tracksEl.after(dots);

  const setCurrent = (i) => buttons.forEach((b, j) => b.setAttribute("aria-current", String(i === j)));
  setCurrent(0);

  const tracksObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setCurrent(cards.indexOf(e.target)); });
  }, { root: tracksEl, threshold: 0.6 });
  cards.forEach((card) => tracksObserver.observe(card));

  // כשזו קרוסלה (מתחת ל-880px), אפשר להגיע אליה במקלדת ולגלול בחצים; במחשב היא טבלה רגילה
  const carouselMq = window.matchMedia("(max-width: 879px)");
  const syncCarousel = () => {
    if (carouselMq.matches) {
      tracksEl.tabIndex = 0;
      tracksEl.setAttribute("role", "region");
      tracksEl.setAttribute("aria-label", "שלושת המסלולים, החליקו לרוחב");
    } else {
      tracksEl.removeAttribute("tabindex");
      tracksEl.removeAttribute("role");
      tracksEl.removeAttribute("aria-label");
    }
  };
  carouselMq.addEventListener("change", syncCarousel);
  syncCarousel();
}
