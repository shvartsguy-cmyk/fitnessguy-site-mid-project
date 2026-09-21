/* Fitness Guy — לוגיקת צד לקוח
 *
 * נקודות המגע עם השרת מרוכזות בשתי פונקציות בלבד: askBot ו-submitLead.
 * כרגע שתיהן מדומות. החלפה לחיבור אמיתי ל-n8n נוגעת רק בהן.
 */

const ENDPOINTS = {
  chat: null, // webhook של הסוכן ב-n8n
  lead: null, // webhook שמקבל את טופס הליד
  leadStatus: null, // נקודת polling לתוצאת ההתאמה
};

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

if (loader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("done");
      setTimeout(() => loader.remove(), prefersReduced ? 0 : 600);
    }, prefersReduced ? 0 : 700);
  });
}

/* ---------- צ'אט ---------- */

const chat = document.getElementById("chat");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatOpenBtn = document.getElementById("chat-open");
let lastFocus = null;

if (chat && chatForm) {
  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + (who === "me" ? "msg-me" : "msg-bot");
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function openChat() {
    lastFocus = document.activeElement;
    chat.hidden = false;
    chatOpenBtn.hidden = true;
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
    chatOpenBtn.hidden = false;
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
      const reply = await askBot(text);
      thinking.textContent = reply;
    } catch {
      thinking.textContent =
        "לא הצלחתי להתחבר כרגע. אפשר לנסות שוב, או לפנות אלינו בוואטסאפ 054-3035040.";
    }
  });
}

/* נקודת מגע 1 עם השרת.
 * חוזה: POST { session_id, message } → { reply }
 * עד לחיבור n8n — מענה מדומה מתוך אותן עובדות שיושבות במאגר הידע. */
async function askBot(message) {
  if (ENDPOINTS.chat) {
    const res = await fetch(ENDPOINTS.chat, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId(), message }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    return data.reply;
  }

  await new Promise((r) => setTimeout(r, 750));
  const q = message.toLowerCase();

  if (q.includes("מחיר") || q.includes("עולה") || q.includes("כמה"))
    return "שלושה מסלולים: Foundation ב-450 ₪ חד־פעמי, Builder ב-550 ₪ לחודש ללא התחייבות, ו-Plateau Breaker ב-1,200 ₪ לחודש במינימום 3 חודשים.";
  if (q.includes("חלבון"))
    return "היעד שלנו הוא 1.6 עד 2.2 גרם חלבון לכל ק״ג משקל גוף ביום, לפי הנחיות ה-ISSN. צריכה מעבר לזה לא בונה שריר נוסף.";
  if (q.includes("קריאטין"))
    return "אנחנו ממליצים על קריאטין מונוהידראט, 3 עד 5 גרם ביום, בצריכה קבועה וללא שלבי העמסה.";
  if (q.includes("ביטול") || q.includes("להקפיא") || q.includes("הקפאה"))
    return "ביטול מתבצע בהודעה בכתב 14 ימי עסקים לפני החיוב הבא, לאחר תום ההתחייבות. הקפאה אפשרית עד 21 ימים רצופים, פעם אחת בחצי שנה.";
  if (q.includes("בית") || q.includes("ביתי"))
    return "הליווי דורש מנוי פעיל לחדר כושר מסודר. התוכניות בנויות על עומס יסף מכני שמחייב ציוד מלא, ולכן הן לא מותאמות לאימונים ביתיים.";

  return "זו שאלה טובה, ואין לי עליה תשובה מדויקת במאגר. אפשר לפנות לצוות המנטורים בוואטסאפ: 054-3035040.";
}

/* ---------- טופס ליד ---------- */

const leadForm = document.getElementById("lead-form");
const formErr = document.getElementById("form-err");
const pending = document.getElementById("pending");
const result = document.getElementById("result");

const GOAL_TRACK = {
  mass: ["The Builder", "בניית מסה דורשת עקביות ומעקב נתונים. המסלול הזה נותן תוכנית מתקדמת ועדכון חודשי, בלי התחייבות ארוכה."],
  cut: ["The Builder", "חיטוב נשען על גירעון קלורי מדויק ומעקב שבועי. נתחיל בתוכנית תזונה מלאה וגיליון מעקב."],
  plateau: ["The Plateau Breaker", "תקיעות מעל שבועיים דורשת אבחון של משולש ההתאוששות וניתוח טכניקה מצולם. זה בדיוק מה שהמסלול הזה עושה."],
  unsure: ["The Foundation", "נתחיל משיחת אפיון ותוכנית ראשונית. משם נדע אם יש טעם להמשיך לליווי חודשי."],
};

if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formErr.hidden = true;

    const data = Object.fromEntries(new FormData(leadForm));

    if (!data.name || !data.phone || !data.email || !data.goal) {
      return fail("צריך למלא שם, טלפון, אימייל ומטרה.");
    }
    if (!/^0\d{1,2}-?\d{7}$/.test(String(data.phone).replace(/\s/g, ""))) {
      return fail("מספר הטלפון לא נראה תקין. פורמט לדוגמה: 050-0000000");
    }
    if (!leadForm.privacy.checked) {
      return fail("צריך לאשר את מדיניות הפרטיות כדי לשלוח.");
    }

    leadForm.hidden = true;
    pending.hidden = false;

    try {
      const match = await submitLead({
        ...data,
        marketing: leadForm.marketing.checked,
        session_id: sessionId(),
      });
      pending.hidden = true;
      result.hidden = false;
      document.getElementById("result-title").textContent =
        "המסלול שמתאים לכם: " + match.track;
      document.getElementById("result-body").textContent = match.why;
      result.scrollIntoView({ block: "center" });
    } catch {
      pending.hidden = true;
      leadForm.hidden = false;
      fail("השליחה נכשלה. אפשר לנסות שוב, או לפנות בוואטסאפ 054-3035040.");
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
    if (!res.ok) throw new Error("bad response");
    const { job_id } = await res.json();

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const s = await fetch(`${ENDPOINTS.leadStatus}?job_id=${job_id}`);
      const data = await s.json();
      if (data.done) return data;
    }
    throw new Error("timeout");
  }

  await new Promise((r) => setTimeout(r, 2600));
  const [track, why] = GOAL_TRACK[payload.goal] || GOAL_TRACK.unsure;
  return { track, why };
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

/* ---------- זרקור עכבר וגרף מקושר לגלילה ---------- */

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
