// Renders every page from content.js. Content edits belong in content.js, not here.
// Each block only runs if its target element is on the current page.
(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const set = (id, fn) => { const el = $(id); if (el) fn(el); };
  const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WEEK = [1, 2, 3, 4, 5, 6, 0];
  const now = new Date();
  const today = now.getDay();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const fmtTime = (hhmm) => {
    let [h, m] = hhmm.split(":").map(Number);
    if (h === 0 && m === 0) return "Midnight";
    const ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return m ? `${h}:${String(m).padStart(2, "0")} ${ap}` : `${h} ${ap}`;
  };
  const parseDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const badge = (d) => `<span class="date-badge"><span class="m">${MONTHS[d.getMonth()]}</span><span class="d">${d.getDate()}</span></span>`;
  const hoursFor = (d) => S.hours.find((x) => x.day === d);
  const hoursText = (h) => (h && h.open ? `${fmtTime(h.open)} – ${fmtTime(h.close)}` : "Closed");
  const tel = "tel:" + S.phone.replace(/\D/g, "");

  // Upcoming one-time events, soonest first (past ones hidden)
  const upcoming = S.events.map((e) => ({ ...e, d: parseDate(e.date) }))
    .filter((e) => e.d >= startOfToday).sort((a, b) => a.d - b.d);

  // Next date for each recurring "Nth weekday of the month" meeting
  const nthWeekday = (y, m, week, wd) => { const first = new Date(y, m, 1); return new Date(y, m, 1 + ((wd - first.getDay() + 7) % 7) + (week - 1) * 7); };
  const meetings = S.meetings.map((mt) => {
    let d = nthWeekday(now.getFullYear(), now.getMonth(), mt.week, mt.weekday);
    if (d < startOfToday) d = nthWeekday(now.getFullYear(), now.getMonth() + 1, mt.week, mt.weekday);
    return { ...mt, d };
  }).sort((a, b) => a.d - b.d);

  // Shared: footer, contact details
  set("footer-address", (el) => { el.textContent = `${S.address} · ${S.phone}`; });
  set("year", (el) => { el.textContent = now.getFullYear(); });
  set("call-btn", (el) => { el.href = tel; el.textContent = "Call " + S.phone; });
  set("phone-link", (el) => { el.href = tel; el.textContent = S.phone; });
  set("address", (el) => { el.innerHTML = esc(S.address).replace(", Conneaut", "<br>Conneaut"); });
  if (S.email) set("email-line", (el) => { el.hidden = false; $("email-link").href = "mailto:" + S.email; $("email-link").textContent = S.email; });
  if (S.facebook) set("fb-line", (el) => { el.hidden = false; $("fb-link").href = S.facebook; });
  // Facebook button in every page's footer
  if (S.facebook) {
    const links = document.querySelector(".footer-links");
    if (links) links.insertAdjacentHTML("afterend",
      `<p><a class="fb-btn" href="${esc(S.facebook)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>Follow us on Facebook</a></p>`);
  }

  // Open / closed right now. Handles closing times after midnight.
  set("open-status", (el) => {
    const mins = now.getHours() * 60 + now.getMinutes();
    const t = hoursFor(today), y = hoursFor((today + 6) % 7);
    const overnight = (h) => h && h.open && toMin(h.close) <= toMin(h.open);
    const spillover = overnight(y) && mins < toMin(y.close);
    const openToday = t && t.open && mins >= toMin(t.open) && (overnight(t) || mins < toMin(t.close));
    const open = openToday || spillover;
    el.classList.add(open ? "open" : "closed");
    el.innerHTML = `<span class="dot"></span>` + (open
      ? `Open now until ${fmtTime(spillover ? y.close : t.close)}`
      : `Closed now${t && t.open && mins < toMin(t.open) ? ` · opens ${fmtTime(t.open)}` : ""}`);
  });

  // Announcements
  set("announcements", (el) => {
    if (!S.announcements.length) return;
    el.hidden = false;
    $("announcement-list").innerHTML = S.announcements.map((a) =>
      `<div class="announcement"><strong>${esc(a.title)}</strong>${esc(a.body)}${a.link ? ` <a href="${esc(a.link)}">Learn more →</a>` : ""}</div>`).join("");
  });

  // Home page cards
  const sp = S.specials.find((x) => x.day === today) || {};
  set("home-special", (el) => {
    el.innerHTML = sp.item ? `<strong>${esc(sp.item)}</strong>${sp.price ? ` · ${esc(sp.price)}` : ""}` : "Ask your bartender about today's special.";
  });
  set("home-next", (el) => {
    const next = [...upcoming.map((e) => ({ d: e.d, title: e.title, time: e.time })),
                  ...meetings.map((m) => ({ d: m.d, title: m.group, time: m.time }))].sort((a, b) => a.d - b.d)[0];
    el.innerHTML = next ? `<strong>${esc(next.title)}</strong><br>${DAYS[next.d.getDay()]}, ${MONTHS[next.d.getMonth()]} ${next.d.getDate()} · ${esc(next.time)}` : "Check back soon.";
  });
  set("home-visit", (el) => {
    el.innerHTML = `<strong>Today: ${hoursText(hoursFor(today))}</strong><br>${esc(S.address)}`;
  });

  // Hours table
  set("hours-table", (el) => {
    el.innerHTML = WEEK.map((d) => `<tr class="${d === today ? "today" : ""}"><td>${DAYS[d]}</td><td>${hoursText(hoursFor(d))}</td></tr>`).join("");
  });

  // Specials
  set("today-special", (el) => {
    el.innerHTML = `
      <div class="label">Today's Special · ${DAYS[today]}</div>
      <div class="item">${sp.item ? esc(sp.item) : "Ask your bartender about today's special"}</div>
      ${sp.price ? `<div class="price">${esc(sp.price)}</div>` : ""}
      ${sp.note ? `<div>${esc(sp.note)}</div>` : ""}`;
  });
  set("week-specials", (el) => {
    el.innerHTML = WEEK.map((d) => {
      const s = S.specials.find((x) => x.day === d) || {};
      return `<li class="${d === today ? "today" : ""}"><div class="day">${DAYS[d]}</div>
        <div class="sp-item">${s.item ? esc(s.item) : '<span class="placeholder">Coming soon</span>'}</div>
        ${s.price ? `<div class="sp-price">${esc(s.price)}</div>` : ""}${s.note ? `<div class="fine">${esc(s.note)}</div>` : ""}</li>`;
    }).join("");
  });

  // Kitchen hours + menu
  set("kitchen-hours", (el) => {
    el.innerHTML = S.kitchenHours.map((k) =>
      `<div class="kh"><div class="days">${esc(k.days)}</div><div class="time">${esc(k.time)}</div><div class="note">${esc(k.note)}</div></div>`).join("");
  });
  const money = (p) => (p ? "$" + esc(p) : "");
  const menuItem = (i) => `
    <div class="menu-item">
      <div class="menu-row"><span class="name">${esc(i.name)}</span><span class="price">${money(i.price)}</span></div>
      ${i.desc ? `<div class="desc">${esc(i.desc)}</div>` : ""}
      ${(i.options || []).map((o) => `<div class="menu-row option"><span>${esc(o.label)}</span><span class="price">${money(o.price)}</span></div>`).join("")}
    </div>`;
  set("menu-note", (el) => { el.textContent = S.menuNote || ""; });
  set("menu-footer", (el) => { el.textContent = S.menuFooter || ""; });
  set("menu-grid", (el) => {
    el.innerHTML = S.menu.map((sec) => `
      <div class="menu-section${sec.featured ? " featured" : ""}"><h3>${esc(sec.section)}</h3>
        ${sec.note ? `<p class="sub">${esc(sec.note)}</p>` : ""}
        ${sec.items.length ? sec.items.map(menuItem).join("") : '<p class="placeholder">Ask your bartender about this week\'s pizza and stromboli.</p>'}
        ${(sec.lists || []).map((l) => `<h4>${esc(l.title)}</h4><ul class="chip-list">${l.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`).join("")}
        ${sec.footnote ? `<p class="sub foot">${esc(sec.footnote)}</p>` : ""}
      </div>`).join("");
  });

  // Events + meetings
  set("event-list", (el) => {
    el.innerHTML = upcoming.length
      ? upcoming.map((e) => `<li class="event">${badge(e.d)}<div class="event-body">
          <div class="title">${esc(e.title)}</div>
          <div class="meta">${DAYS[e.d.getDay()]}, ${MONTHS[e.d.getMonth()]} ${e.d.getDate()}${e.time ? " · " + esc(e.time) : ""}</div>
          ${e.host ? `<div class="meta">${esc(e.host)}</div>` : ""}
          ${e.image ? `<img class="event-img" src="${esc(e.image)}" alt="${esc(e.title)}" loading="lazy">` : ""}
          ${e.body ? `<p>${esc(e.body)}</p>` : ""}
          ${e.tickets ? `<p class="tickets">${esc(e.tickets)}</p>` : ""}
        </div></li>`).join("")
      : '<li><span class="placeholder">No events posted right now. Check back soon!</span></li>';
  });
  set("meeting-list", (el) => {
    const ord = ["", "1st", "2nd", "3rd", "4th", "5th"];
    el.innerHTML = meetings.map((mt) =>
      `<li>${badge(mt.d)}<div><div class="title">${esc(mt.group)}</div><div class="meta">${ord[mt.week]} ${DAYS[mt.weekday]} · ${esc(mt.time)}</div>${mt.note ? `<div class="fine">${esc(mt.note)}</div>` : ""}</div></li>`).join("");
  });

  // Officers
  const officerList = (list) => (list && list.length
    ? list.map((o) => `<li><span class="t">${esc(o.title)}</span><span>${esc(o.name)}</span></li>`).join("")
    : '<li><span class="t">Officer list coming soon.</span></li>');
  set("officers", (el) => { el.innerHTML = officerList(S.officers); });
  set("sons-officers", (el) => { el.innerHTML = officerList(S.sonsOfficers); });
  set("auxiliary-officers", (el) => { el.innerHTML = officerList(S.auxiliaryOfficers); });

  // Hometown Hero online order form
  set("hh-form", (form) => {
    const alertBox = $("order-alert");
    const show = (msg, ok) => { alertBox.textContent = msg; alertBox.className = "form-alert" + (ok ? " ok" : ""); alertBox.hidden = false; };
    const MESSAGES = {
      notready: "Online ordering isn't set up yet. Please download the PDF order form for now, or call George Sabo at 440-813-3364.",
      missing: "Please fill in all the required fields and try again.",
      email: "Please check the email address and try again.",
      photo: "Please attach a photo of the veteran in uniform.",
      phototype: "The photo needs to be a JPG, PNG, GIF, WEBP or HEIC image.",
      toolarge: "That photo is too large. Please use one under 10 MB.",
      failed: "Sorry, something went wrong sending your order. Please try again, or use the PDF order form."
    };
    const code = new URLSearchParams(location.search).get("order");
    if (code && MESSAGES[code]) show(MESSAGES[code]);
    if (/github\.io$/.test(location.hostname)) {
      show("This is a preview copy of the site. The online form will work once the site is live at conneautlegionpost151.org. Until then, please use the PDF order form.");
    }
    form.addEventListener("submit", (e) => {
      const file = $("hh-photo").files[0];
      if (file && file.size > 10 * 1024 * 1024) { e.preventDefault(); show(MESSAGES.toolarge); return; }
      const btn = $("hh-submit");
      btn.disabled = true; btn.textContent = "Sending…";
    });
  });

  // Contact form on the Visit page
  set("contact-form-el", (form) => {
    const alertBox = $("contact-alert");
    const show = (msg, ok) => { alertBox.textContent = msg; alertBox.className = "form-alert" + (ok ? " ok" : ""); alertBox.hidden = false; };
    const phone = S.phone || "the Post";
    const MESSAGES = {
      sent: "Thank you! Your message has been sent. Someone from the Post will get back to you soon.",
      notready: `The message form isn't set up yet. Please call us at ${phone} or message us on Facebook.`,
      missing: "Please fill in your name, a topic and your message, then try again.",
      email: "Please check your email address and try again.",
      failed: `Sorry, something went wrong sending your message. Please try again, or call us at ${phone}.`
    };
    const params = new URLSearchParams(location.search);
    const code = params.get("contact");
    if (code && MESSAGES[code]) show(MESSAGES[code], code === "sent");
    const topic = params.get("topic");
    if (topic) {
      const opt = [...$("contact-topic").options].find(o => o.value.toLowerCase().includes(topic.toLowerCase()));
      if (opt) $("contact-topic").value = opt.value;
    }
    if (/github\.io$/.test(location.hostname)) {
      show(`This is a preview copy of the site. The message form will work once the site is live at conneautlegionpost151.org. Until then, please call ${phone}.`);
    }
    form.addEventListener("submit", () => {
      const btn = $("contact-submit");
      btn.disabled = true; btn.textContent = "Sending…";
    });
  });

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle"), nav = $("nav");
  if (toggle && nav) toggle.addEventListener("click", () => { const o = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
})();
