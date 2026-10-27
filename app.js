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
      notready: "Online ordering isn't set up yet. Please download the PDF order form for now, or email hero-banners@conneautlegionpost151.org.",
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
      sent: (S.formEmails || {}).contactThanks || "Thank you! Your message has been sent. Someone from the Post will get back to you soon.",
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
      const opts = [...$("contact-topic").options], t = topic.toLowerCase();
      const opt = opts.find(o => o.dataset.key === t) || opts.find(o => o.value && o.value.toLowerCase().includes(t));
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

  // Funeral honors request form
  set("honors-form-el", (form) => {
    const alertBox = $("honors-alert");
    const show = (msg, ok) => { alertBox.textContent = msg; alertBox.className = "form-alert" + (ok ? " ok" : ""); alertBox.hidden = false; };
    const MESSAGES = {
      sent: (S.formEmails || {}).honorsThanks || "Thank you. Your request has been sent to the Honor Guard, and someone from the Post will contact you to confirm. For a service in the next two days, please also call the Post.",
      missing: "Please fill in every required box, then try again.",
      email: "Please check your email address and try again.",
      failed: `Sorry, something went wrong sending your request. Please call the Post at ${S.phone}.`
    };
    const code = new URLSearchParams(location.search).get("honors");
    if (code && MESSAGES[code]) show(MESSAGES[code], code === "sent");
    if (/github\.io$/.test(location.hostname)) show(`This is a preview copy of the site. Please call the Post at ${S.phone} to request funeral honors.`);
    form.addEventListener("submit", () => { const btn = $("honors-submit"); btn.disabled = true; btn.textContent = "Sending…"; });
  });

  // Perform at the Post (entertainer booking) form
  set("perform-form-el", (form) => {
    const alertBox = $("perform-alert");
    const show = (msg, ok) => { alertBox.textContent = msg; alertBox.className = "form-alert" + (ok ? " ok" : ""); alertBox.hidden = false; };
    const MESSAGES = {
      sent: (S.formEmails || {}).performThanks || "Thank you! Your information has been sent to our entertainment committee, and someone will be in touch.",
      missing: "Please fill in every required box, then try again.",
      email: "Please check your email address and try again.",
      failed: `Sorry, something went wrong. Please try again, or call the Post at ${S.phone}.`
    };
    const code = new URLSearchParams(location.search).get("perform");
    if (code && MESSAGES[code]) show(MESSAGES[code], code === "sent");
    if (/github\.io$/.test(location.hostname)) show(`This is a preview copy of the site. Please call the Post at ${S.phone}.`);
    form.addEventListener("submit", () => { const btn = $("perform-submit"); btn.disabled = true; btn.textContent = "Sending…"; });
  });

  // Post history timeline. Rows without a year are intro paragraphs at the top.
  set("history", (el) => {
    const list = S.history || [];
    el.innerHTML = list.length ? list.map((h) => `<li class="${h.year ? "" : "intro"}">
        ${h.year ? `<span class="year">${esc(h.year)}</span>` : ""}
        <div>${h.title ? `<h3>${esc(h.title)}</h3>` : ""}${String(h.body || "").split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("")}
        ${h.image ? `<img src="${esc(h.image)}" alt="${esc(h.title || h.year)}" loading="lazy">` : ""}</div></li>`).join("")
      : '<li class="intro"><div><p>Our history page is being written. Check back soon.</p></div></li>';
  });

  // Business details in the format search engines read (Home and Visit pages)
  if ($("open-status") || $("contact-form-el")) {
    const ld = {
      "@context": "https://schema.org", "@type": "LocalBusiness", name: S.name,
      url: location.origin + "/", telephone: S.phone, email: S.email || undefined,
      logo: location.origin + "/images/emblems/legion.png", image: location.origin + "/images/og-image.jpg",
      address: { "@type": "PostalAddress", streetAddress: S.address.split(",")[0], addressLocality: "Conneaut", addressRegion: "OH", postalCode: "44030", addressCountry: "US" },
      openingHoursSpecification: S.hours.filter((h) => h.open).map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.label, opens: h.open, closes: h.close })),
      sameAs: S.facebook ? [S.facebook] : undefined
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json"; tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  }

  // Membership page
  set("join-cards", (el) => {
    el.innerHTML = (S.membership || []).map((m) => `<div class="join-card"${m.emblem ? ` data-emblem="${esc(m.emblem)}"` : ""}>
      <h3>${esc(m.group)}</h3>
      ${m.dues ? `<p class="dues"><span>${esc(m.dues)}</span> per year</p>` : ""}
      <p><strong>Who can join:</strong> ${esc(m.who)}</p>
      ${m.contact ? `<p class="fine light">Membership contact: ${esc(m.contact)}</p>` : ""}
      ${m.emblem ? `<a class="btn btn-red btn-small" href="contact.html?topic=${esc(m.emblem)}#contact-form">Ask About Joining</a>` : ""}
    </div>`).join("");
  });

  // Hall rental page
  set("hall-features", (el) => {
    const h = S.hallRental || {};
    el.innerHTML = (h.features || []).map((f) => `<li>${esc(f)}</li>`).join("");
    $("hall-facts").innerHTML = [["Rental", h.price], ["To book", h.booking], ["Capacity", h.capacity ? h.capacity + " guests" : ""]]
      .map(([k, v]) => `<div class="kh"><strong>${k}</strong><br>${v ? esc(v) : "Call for details"}</div>`).join("");
    $("hall-note").textContent = h.note || "";
    $("hall-call").href = tel; $("hall-call").textContent = "Call " + S.phone;
  });

  // Photo gallery
  set("gallery", (el) => {
    const g = S.gallery || [];
    el.innerHTML = g.length
      ? g.map((p) => `<figure><a href="${esc(p.file)}" target="_blank" rel="noopener"><img src="${esc(p.file)}" alt="${esc(p.caption || "Photo from American Legion Post 151")}" loading="lazy"></a>${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}</figure>`).join("")
      : '<p class="placeholder">Photos coming soon. Check our Facebook page for the latest pictures.</p>';
  });

  // The Sentinel: past issues
  set("sentinel-issues", (el) => {
    const list = S.sentinel || [];
    el.innerHTML = list.length
      ? list.map((n) => `<li><a href="${esc(n.file)}" target="_blank" rel="noopener"><strong>${esc(n.title || "The Sentinel")}</strong> ${esc(n.date)}</a>${/\.pdf$/i.test(n.file) ? ' <span class="fine">PDF</span>' : ""}</li>`).join("")
      : '<li class="placeholder">The first new issue is coming soon. Sign up above to get it by email.</li>';
  });

  // In Memoriam
  set("memoriam", (el) => {
    const list = S.inMemoriam || [];
    el.innerHTML = list.length
      ? list.map((p) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.5 5.8 21.2l1.6-7L2 9.5l7.1-.6z"/></svg>
        <div><strong>${esc(p.name)}</strong>${[p.branch, p.service].filter(Boolean).length ? `<span>${esc([p.branch, p.service].filter(Boolean).join(" · "))}</span>` : ""}${p.date ? `<span class="fine">${esc(p.date)}</span>` : ""}</div></li>`).join("")
      : '<li class="placeholder">Our honor roll is being gathered and will be posted soon.</li>';
  });

  // Hometown Hero banner map: search by name, click a name to fly to its pole.
  // In winter (bannerSeason.down) the map hides and the heroes show as an honor roll.
  set("banner-map", (el) => {
    const SUFFIX = /^(jr|sr|ii|iii|iv)\.?$/i;
    const lastName = (n) => { const w = String(n).trim().split(/\s+/).filter((x) => !SUFFIX.test(x)); return (w[w.length - 1] || "").toLowerCase(); };
    const slugOf = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const season = S.bannerSeason || {};
    const all = (S.heroBanners || []).map((b) => {
      const [lat, lng] = String(b.spot || "").split(",").map(Number);
      return { ...b, lat, lng, placed: !!b.spot && isFinite(lat) && isFinite(lng) };
    }).filter((b) => b.name)
      .sort((a, b) => lastName(a.name).localeCompare(lastName(b.name)) || a.name.localeCompare(b.name));
    const used = {};
    all.forEach((b) => { const id = slugOf(b.name); used[id] = (used[id] || 0) + 1; b.id = used[id] > 1 ? `${id}-${used[id]}` : id; });
    if (all.some((b) => b.sample) && !season.down) $("bm-sample").hidden = false;
    const details = (b) => [b.branch, b.years, b.era].filter(Boolean).join(" · ");
    const q = $("bm-q"), count = $("bm-count");
    const matches = (b, terms) => { const hay = [b.name, b.branch, b.era, b.where].join(" ").toLowerCase(); return terms.every((t) => hay.includes(t)); };
    const termsOf = () => q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const want = new URLSearchParams(location.search).get("hero");

    if (season.down) {
      const box = $("bm-winter");
      box.innerHTML = (season.message || "Our Hometown Hero banners are down for the winter. They go back up for Memorial Day.")
        .split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join("");
      box.hidden = false;
      $("bm-lead").textContent = "Our Hometown Hero banners fly on poles around Conneaut from Memorial Day through Veterans Day. These are the heroes we honored this year.";
      $("bm-layout").hidden = true;
      $("bm-near").hidden = true;
      $("bm-q").placeholder = "Search our heroes by name";
      const roll = $("bm-roll"), real = all.filter((b) => !b.sample);
      roll.hidden = false;
      const render = () => {
        const terms = termsOf(), hits = real.filter((b) => matches(b, terms));
        roll.innerHTML = hits.map((b) => `<li>${b.photo ? `<img src="${esc(b.photo)}" alt="Banner for ${esc(b.name)}" loading="lazy">` : ""}
          <strong>${esc(b.name)}</strong>${details(b) ? `<span>${esc(details(b))}</span>` : ""}</li>`).join("")
          || `<li class="placeholder">${real.length ? "No hero found with that name. Try just the last name." : "Our honor roll of heroes is coming soon."}</li>`;
        count.textContent = real.length ? (terms.length ? `${hits.length} of ${real.length} heroes` : `${real.length} heroes honored this year`) : "";
      };
      q.addEventListener("input", render);
      const hit = want && real.find((b) => b.id === want);
      if (hit) q.value = hit.name;
      render();
      return;
    }

    if (!window.L) { el.innerHTML = '<p class="placeholder">The map couldn\'t load. Please refresh the page.</p>'; return; }
    const map = L.map(el, { scrollWheelZoom: false }).setView([41.9476, -80.5542], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const pin = L.divIcon({ className: "bm-pin", html: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.5 5.8 21.2l1.6-7L2 9.5l7.1-.6z"/></svg>', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -12] });
    const popup = (b) => `<div class="bm-pop">${b.photo ? `<img src="${esc(b.photo)}" alt="Banner for ${esc(b.name)}">` : ""}
      <strong>${esc(b.name)}</strong>${details(b) ? `<span>${esc(details(b))}</span>` : ""}${b.where ? `<span class="fine">${esc(b.where)}</span>` : ""}
      <span class="bm-pop-links"><a href="https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}" target="_blank" rel="noopener">Directions</a>
      <a href="?hero=${esc(b.id)}" data-share="${esc(b.id)}">Share link</a></span></div>`;
    const placed = all.filter((b) => b.placed);
    placed.forEach((b) => { b.marker = L.marker([b.lat, b.lng], { icon: pin, title: b.name, alt: b.name }).bindPopup(popup(b)).addTo(map); });
    if (placed.length) map.fitBounds(L.latLngBounds(placed.map((b) => [b.lat, b.lng])), { padding: [30, 30], maxZoom: 16 });
    // Two-finger / click-to-zoom so the page still scrolls past the map
    map.once("focus click", () => map.scrollWheelZoom.enable());

    const show = (b) => {
      if (!b.placed) return;
      map.setView([b.lat, b.lng], Math.max(map.getZoom(), 17));
      b.marker.openPopup();
      if (window.innerWidth <= 760) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const list = $("bm-list");
    const render = () => {
      const terms = termsOf();
      const hits = all.filter((b) => matches(b, terms));
      placed.forEach((b) => { const on = hits.includes(b); if (on !== map.hasLayer(b.marker)) on ? b.marker.addTo(map) : b.marker.remove(); });
      list.innerHTML = hits.map((b) => `<li><button type="button" data-id="${esc(b.id)}"><strong>${esc(b.name)}</strong>${details(b) ? `<span>${esc(details(b))}</span>` : ""}${!b.placed ? '<span class="fine">Location coming soon</span>' : b.where ? `<span class="fine">${esc(b.where)}</span>` : ""}</button></li>`).join("")
        || `<li class="placeholder">${all.length ? "No banner found with that name. Try just the last name." : "Banner locations are coming soon."}</li>`;
      count.textContent = all.length ? (terms.length ? `${hits.length} of ${all.length} banners` : `${all.length} banners`) : "";
      const onMap = hits.filter((b) => b.placed);
      if (terms.length && onMap.length) map.fitBounds(L.latLngBounds(onMap.map((b) => [b.lat, b.lng])), { padding: [30, 30], maxZoom: 17 });
    };
    q.addEventListener("input", render);
    list.addEventListener("click", (e) => { const btn = e.target.closest("[data-id]"); if (btn) show(all.find((b) => b.id === btn.dataset.id)); });
    el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-share]"); if (!a) return;
      e.preventDefault();
      const url = new URL(location.href); url.search = "?hero=" + a.dataset.share; url.hash = "";
      if (navigator.share) navigator.share({ title: document.title, url: url.href }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url.href).then(() => { a.textContent = "Link copied"; });
    });
    $("bm-near").addEventListener("click", () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((p) => {
        L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 8, color: "#0a2240", fillColor: "#3b82f6", fillOpacity: 1 }).addTo(map).bindTooltip("You are here");
        map.setView([p.coords.latitude, p.coords.longitude], 17);
      }, () => { count.textContent = "Your location isn't available. Check that location is allowed for this site."; });
    });
    render();
    const hit = want && all.find((b) => b.id === want);
    if (hit) { q.value = hit.name; render(); show(hit); }
  });

  // Sentinel sign-up form
  set("sub-form", (form) => {
    const alertBox = $("sub-alert");
    const show = (msg, ok) => { alertBox.textContent = msg; alertBox.className = "form-alert" + (ok ? " ok" : ""); alertBox.hidden = false; };
    const MESSAGES = {
      sent: (S.formEmails || {}).sentinelThanks || "You're signed up! The Sentinel will come to your inbox.",
      missing: "Please fill in your name and email, then try again.",
      email: "Please check your email address and try again.",
      failed: `Sorry, something went wrong. Please try again, or call us at ${S.phone}.`
    };
    const code = new URLSearchParams(location.search).get("signup");
    if (code && MESSAGES[code]) show(MESSAGES[code], code === "sent");
    if (/github\.io$/.test(location.hostname)) {
      show("This is a preview copy of the site. Sign-up will work once the site is live at conneautlegionpost151.org.");
    }
    form.addEventListener("submit", () => { const b = $("sub-submit"); b.disabled = true; b.textContent = "Signing up…"; });
  });

  // Post, Sons and Auxiliary emblems: on cards marked data-emblem, and in every footer
  const EMBLEM_NAMES = { legion: "The American Legion", sons: "Sons of the American Legion", auxiliary: "American Legion Auxiliary" };
  const emblemImg = (k, cls) => `<img class="${cls}" src="${esc(S.emblems[k])}" alt="${EMBLEM_NAMES[k]} emblem">`;
  if (S.emblems) {
    document.querySelectorAll("[data-emblem]").forEach((el) => {
      if (S.emblems[el.dataset.emblem]) el.insertAdjacentHTML("afterbegin", emblemImg(el.dataset.emblem, "card-emblem"));
    });
    const set3 = Object.keys(EMBLEM_NAMES).filter((k) => S.emblems[k]);
    const foot = document.querySelector(".site-footer .wrap");
    if (foot && set3.length) foot.insertAdjacentHTML("afterbegin", `<p class="footer-emblems">${set3.map((k) => emblemImg(k, "")).join("")}</p>`);
  }

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle"), nav = $("nav");
  if (toggle && nav) toggle.addEventListener("click", () => { const o = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
})();
