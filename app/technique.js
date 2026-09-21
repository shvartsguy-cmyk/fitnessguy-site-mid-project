(() => {
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
    if (window.matchMedia("(max-width: 760px)").matches) {
      detailEl.scrollIntoView({ block: "start" });
    }
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
})();
