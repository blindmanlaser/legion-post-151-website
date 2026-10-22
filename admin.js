// Site editor (admin.html). Edits content.js and uploads photos/PDFs by committing
// to the GitHub repo with the editor's own GitHub key, so there's no server or
// password stored on the website. Each save is one commit; the site updates from it.
(function () {
  const OWNER = "blindmanlaser", REPO = "legion-post-151-website", BRANCH = "main";
  const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const KEY_NAME = "post151-editor-key";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // What the editor can change. "list" sections are arrays of rows; "object" is one set of fields.
  // fixed: rows can't be added or removed. New rows always go at the top.
  const SECTIONS = [
    { key: "specials", label: "Daily Specials", type: "list", fixed: true,
      help: "One special per day. Today's special is highlighted on the website automatically.",
      title: (r) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][r.day],
      fields: [["item", "Special"], ["price", "Price (optional)"], ["note", "Note (optional)"]] },
    { key: "announcements", label: "Announcements", type: "list",
      help: "Banners at the top of the Home and Events pages. Newest first.",
      blank: { title: "", body: "", link: "" },
      fields: [["title", "Headline"], ["body", "Text", "textarea"], ["link", "Link (optional, like events.html)"]] },
    { key: "events", label: "Events", type: "list", sortBy: "date",
      help: "One-time events. Past events hide on their own, so you never have to delete them. Listed by date when you save.",
      blank: { date: "", time: "", title: "", host: "", image: "", body: "", tickets: "" },
      fields: [["date", "Date", "date"], ["time", "Time (like 7:00 pm)"], ["title", "Event name"], ["host", "Hosted by (optional)"],
        ["body", "Description", "textarea"], ["tickets", "Tickets / how to sign up (optional)"], ["image", "Flyer or photo (optional)", "image"]] },
    { key: "inMemoriam", label: "In Memoriam", type: "list",
      help: "Members who have passed, newest first.",
      blank: { name: "", branch: "", service: "", date: "" },
      fields: [["name", "Name"], ["branch", "Branch (optional)"], ["service", "Era or service (optional, like Vietnam)"], ["date", "Date of passing (optional, like October 2026)"]] },
    { key: "heroBanners", label: "Banner Map", type: "list",
      help: "Hometown Hero banners on the Banner Map page. Standing at a pole with your phone? Add a banner, type the name and tap \"Use my location\". You can also paste a spot copied from Google Maps (right-click the spot and click the numbers), or add a photo of the banner taken with location turned on. Save every few banners.",
      title: (r) => (r.name || "New banner") + (r.sample ? " (sample, delete me)" : ""),
      blank: { name: "", branch: "", years: "", era: "", spot: "", where: "", photo: "" },
      fields: [["name", "Name on the banner"], ["branch", "Branch (optional)"], ["years", "Years of service (optional, like 1965 – 1968)"], ["era", "Era (optional, like Vietnam)"],
        ["spot", "Pole location", "spot"], ["where", "Street or landmark (optional, like Broad St at Main St)"], ["photo", "Photo of the banner (optional)", "image"]] },
    { key: "gallery", label: "Photo Gallery", type: "list",
      help: "Photos for the Gallery page. Big phone photos are shrunk automatically before upload.",
      blank: { file: "", caption: "" },
      fields: [["file", "Photo", "image"], ["caption", "Caption (optional)"]] },
    { key: "sentinel", label: "The Sentinel", type: "list",
      help: "Newsletter issues on the Sentinel page, newest first.",
      blank: { title: "The Sentinel", date: "", file: "" },
      fields: [["title", "Title"], ["date", "Issue (like November 2026)"], ["file", "PDF", "pdf"]] },
    { key: "sentinelDraft", label: "Write The Sentinel", type: "object", newsletter: true,
      help: "Write this week's newsletter. Events, specials, hours, meetings and officers fill in on their own from the rest of the site. Leave a box empty to leave that section out. Click Save Changes to keep your draft.",
      fields: [["issue", "Issue (like Week of November 2, 2026)"], ["preheader", "Inbox preview line (optional)"],
        ["coverImage", "Cover photo (optional)", "image"], ["coverCaption", "Cover photo caption (optional)"],
        ["commanderMessage", "Message from the Commander (leave a blank line between paragraphs)", "textarea"], ["commanderSign", "Signed (like Kirk Jennings, Commander)"],
        ["spotlightTitle", "Spotlight headline (optional)"], ["spotlightBody", "Spotlight text", "textarea"],
        ["includeHours", "Include hours and meeting dates", "check"], ["includeEvents", "Include upcoming events from the Events tab", "check"],
        ["eventDays", "How many days ahead to list events (like 14)"],
        ["includeSpecials", "Include the daily specials", "check"], ["kitchenNews", "Canteen & kitchen news: new items, drink specials (optional)", "textarea"],
        ["includeHeroes", "Include the Hometown Hero flags ad", "check"],
        ["auxNews", "Auxiliary Corner (optional)", "textarea"], ["sonsNews", "Sons of the Legion news (optional)", "textarea"],
        ["communityTitle", "Community & charity headline (optional)"], ["communityBody", "Community & charity story", "textarea"],
        ["newMembers", "New members to welcome (optional, like John Smith and Jane Doe.)"],
        ["drawings", "Drawings & winners (optional, one per line)", "textarea"],
        ["taps", "Taps (optional, one name per line, like John Smith, U.S. Army, Vietnam)", "textarea"],
        ["includeOfficers", "Include the officer lists", "check"],
        ["memberNotice", "Member notice (optional, like dues reminders)", "textarea"]] },
    { key: "hallRental", label: "Hall Rental", type: "object",
      help: "Leave any of these empty to show \"Call for details\".",
      fields: [["price", "Rental price (like $30 per hour)"], ["booking", "Due at booking (like $30 due when you book)"], ["capacity", "Capacity (number of guests)"], ["note", "Note under the details", "textarea"]] },
    { key: "membership", label: "Membership Dues", type: "list", fixed: true,
      help: "Yearly dues and who to contact on the Join page.",
      title: (r) => r.group,
      fields: [["dues", "Dues per year"], ["contact", "Membership contact"]] },
  ];

  let token = "", site = null, dirty = new Set(), uploads = new Map(), open = "specials";

  // ---------- GitHub API ----------
  async function gh(path, opts = {}) {
    const res = await fetch(path.startsWith("http") ? path : API + path, {
      ...opts,
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", ...(opts.body ? { "Content-Type": "application/json" } : {}) },
    });
    if (!res.ok) {
      const err = new Error(`GitHub said ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  const b64ToText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const bytesToB64 = (bytes) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

  async function loadContent(ref) {
    const f = await gh(`/contents/content.js?ref=${ref}`);
    return b64ToText(f.content);
  }
  const evalContent = (src) => { const win = {}; new Function("window", src)(win); return win.SITE; };

  // ---------- Rewriting content.js ----------
  // Replaces just the value of one top-level key, keeping every comment and the rest of the file.
  function valueSpan(src, key) {
    const m = new RegExp(`^  ${key}:\\s*`, "m").exec(src);
    if (!m) return null;
    const start = m.index + m[0].length;
    let depth = 0, i = start;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '"' || c === "'" || c === "`") { for (i++; i < src.length && src[i] !== c; i++) if (src[i] === "\\") i++; continue; }
      if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); continue; }
      if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i) + 1; continue; }
      if (c === "[" || c === "{") depth++;
      else if (c === "]" || c === "}") { depth--; if (depth === 0) return [start, i + 1]; }
    }
    return null;
  }
  const IDENT = /^[A-Za-z_$][\w$]*$/;
  function inline(v) {
    if (Array.isArray(v)) return "[" + v.map(inline).join(", ") + "]";
    if (v && typeof v === "object") return "{ " + Object.entries(v).map(([k, x]) => (IDENT.test(k) ? k : JSON.stringify(k)) + ": " + inline(x)).join(", ") + " }";
    return JSON.stringify(v);
  }
  function serialize(v) {
    // One row per line; long rows get one field per line so they're easy to edit on GitHub too.
    const row = (x) => {
      const one = inline(x);
      if (one.length <= 130 || !x || typeof x !== "object" || Array.isArray(x)) return "    " + one;
      return "    { " + Object.entries(x).map(([k, y]) => k + ": " + inline(y)).join(",\n      ") + " }";
    };
    if (Array.isArray(v)) return v.length ? "[\n" + v.map(row).join(",\n") + "\n  ]" : "[\n  ]";
    return "{\n" + Object.entries(v).map(([k, x]) =>
      "    " + k + ": " + (Array.isArray(x) ? "[\n" + x.map((y) => "      " + inline(y)).join(",\n") + "\n    ]" : inline(x))).join(",\n") + "\n  }";
  }
  // Drop empty optional fields so content.js stays tidy (specials keep all their fields).
  const tidy = (key, v) => Array.isArray(v) && key !== "specials"
    ? v.map((r) => (r && typeof r === "object" ? Object.fromEntries(Object.entries(r).filter(([, x]) => x !== "")) : r))
    : v;

  // ---------- Files ----------
  const slug = (s) => String(s || "file").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
  const stamp = () => new Date().toISOString().slice(0, 10);

  async function shrinkImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
      const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.85));
      return new Uint8Array(await blob.arrayBuffer());
    } finally { URL.revokeObjectURL(url); }
  }

  async function pickFile(kind, row, field, nameHint) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "pdf" ? "application/pdf" : "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        let bytes, path;
        if (kind === "pdf") {
          if (file.size > 25 * 1024 * 1024) return status("That PDF is over 25 MB. Please use a smaller file.", true);
          bytes = new Uint8Array(await file.arrayBuffer());
          path = `downloads/${slug(nameHint || file.name.replace(/\.pdf$/i, ""))}-${stamp()}.pdf`;
        } else {
          if ("spot" in row && !row.spot) {
            const spot = await photoSpot(file);
            if (spot) { row.spot = spot; status("The pole location was filled in from the photo. Click Check on map to make sure it's right."); }
          }
          bytes = await shrinkImage(file);
          path = `images/${field === "file" ? "gallery/" : ""}${slug(nameHint || file.name.replace(/\.\w+$/, ""))}-${stamp()}.jpg`;
        }
        uploads.set(path, { bytes, preview: kind === "pdf" ? null : URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" })) });
        row[field] = path;
        markDirty();
        render();
      } catch (e) {
        status("That file couldn't be read. Please use a JPG or PNG photo (iPhone HEIC photos may need to be shared as JPG).", true);
      }
    };
    input.click();
  }

  // Phone GPS for the banner map: fills "lat, lng" while standing at the pole
  function locate(row, field, btn) {
    if (!navigator.geolocation) return status("This device can't share its location. Paste the spot from Google Maps instead.", true);
    btn.disabled = true; btn.textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition((p) => {
      row[field] = `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;
      delete row.sample;
      status(`Location set, accurate to about ${Math.round(p.coords.accuracy * 3.28)} feet. Click Save Changes when you're done.`);
      markDirty(); render();
    }, () => {
      btn.disabled = false; btn.textContent = "Use my location";
      status("Your location isn't available. Allow location for this site in your phone's browser settings, then try again.", true);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  // Reads the GPS spot saved in a phone photo (JPG with location on), or null
  async function photoSpot(file) {
    try {
      const v = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
      if (v.getUint16(0) !== 0xffd8) return null;
      for (let o = 2; o + 10 < v.byteLength; o += 2 + v.getUint16(o + 2)) {
        if (v.getUint16(o) === 0xffe1 && v.getUint32(o + 4) === 0x45786966) {
          const t = o + 10, le = v.getUint16(t) === 0x4949;
          const u16 = (p) => v.getUint16(p, le), u32 = (p) => v.getUint32(p, le);
          const ifd = (p) => { const out = {}; for (let i = 0, n = u16(p); i < n; i++) out[u16(p + 2 + i * 12)] = p + 2 + i * 12; return out; };
          const gpsPtr = ifd(t + u32(t + 4))[0x8825];
          if (!gpsPtr) return null;
          const g = ifd(t + u32(gpsPtr + 8));
          const coord = (tag, ref) => {
            if (!g[tag] || !g[ref]) return NaN;
            const p = t + u32(g[tag] + 8), part = (k) => u32(p + k * 8) / u32(p + k * 8 + 4);
            const d = part(0) + part(1) / 60 + part(2) / 3600;
            return /[SW]/.test(String.fromCharCode(v.getUint8(g[ref] + 8))) ? -d : d;
          };
          const lat = coord(2, 1), lng = coord(4, 3);
          return isFinite(lat) && isFinite(lng) && (lat || lng) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : null;
        }
      }
    } catch (e) {}
    return null;
  }

  // ---------- UI ----------
  function status(msg, bad) { const s = $("ed-status"); s.textContent = msg; s.className = "form-alert" + (bad ? "" : " ok"); s.hidden = !msg; }
  function markDirty() { dirty.add(open); $("ed-save").disabled = false; $("ed-save-note").textContent = "You have unsaved changes."; }

  function fieldHtml(sec, r, idx, [name, label, kind]) {
    const v = r[name] ?? "";
    const id = `f-${idx}-${name}`;
    if (kind === "image" || kind === "pdf") {
      const up = uploads.get(v);
      const preview = kind === "image" && v ? `<img class="ed-thumb" src="${esc(up ? up.preview : v)}" alt="">` : (v ? `<span class="fine">${esc(v.split("/").pop())}</span>` : "");
      return `<div class="ed-file"><span class="group-label">${esc(label)}</span>${preview}
        <button type="button" class="btn btn-small" data-pick="${kind}" data-idx="${idx}" data-field="${name}">${v ? "Replace" : "Choose"} ${kind === "pdf" ? "PDF" : "photo"}</button>
        ${v && kind === "image" ? `<button type="button" class="btn btn-small btn-ghost" data-clear="${idx}" data-field="${name}">Remove</button>` : ""}</div>`;
    }
    if (kind === "spot") {
      const [lat, lng] = String(v).split(",").map((x) => x.trim());
      return `<label for="${id}">${esc(label)}<input id="${id}" type="text" inputmode="decimal" value="${esc(v)}" placeholder="like 41.94681, -80.55430" data-idx="${idx}" data-field="${name}"></label>
        <div class="ed-row-actions ed-spot"><button type="button" class="btn btn-small btn-red" data-locate="${idx}" data-field="${name}">Use my location</button>
        ${v ? `<a class="btn btn-small btn-ghost" href="https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lng)}#map=19/${encodeURIComponent(lat)}/${encodeURIComponent(lng)}" target="_blank" rel="noopener">Check on map</a>` : ""}</div>`;
    }
    if (kind === "check") return `<label class="ed-check"><input type="checkbox" data-idx="${idx}" data-field="${name}" ${v ? "checked" : ""}> ${esc(label)}</label>`;
    const input = kind === "textarea"
      ? `<textarea id="${id}" rows="3" data-idx="${idx}" data-field="${name}">${esc(v)}</textarea>`
      : `<input id="${id}" type="${kind === "date" ? "date" : "text"}" value="${esc(v)}" data-idx="${idx}" data-field="${name}">`;
    return `<label for="${id}">${esc(label)}${input}</label>`;
  }

  function render() {
    $("ed-tabs").innerHTML = SECTIONS.map((s) => `<button type="button" class="${s.key === open ? "active" : ""}" data-tab="${s.key}">${esc(s.label)}${dirty.has(s.key) ? " •" : ""}</button>`).join("");
    const sec = SECTIONS.find((s) => s.key === open);
    const data = site[sec.key];
    let html = `<p class="fine">${esc(sec.help)}</p>`;
    if (sec.type === "object") {
      html += `<fieldset>${sec.fields.map((f) => fieldHtml(sec, data, -1, f)).join("")}</fieldset>`;
      if (sec.newsletter) html += `<div class="ed-row-actions">
        <button type="button" class="btn btn-small btn-ghost" data-nl="preview">Preview</button>
        <button type="button" class="btn btn-small btn-ghost" data-nl="copy">Copy for Mailchimp</button>
        <button type="button" class="btn btn-small btn-ghost" data-nl="download">Download</button>
        <button type="button" class="btn btn-small btn-red" data-nl="publish">Save &amp; Post on the Website</button>
        <button type="button" class="btn btn-small btn-danger" data-nl="next">Start Next Week's Issue</button></div>
        <p class="fine">"Copy for Mailchimp" copies the finished email so you can paste it into Mailchimp's "Code your own" editor. "Save &amp; Post on the Website" adds this issue to the Sentinel page.</p>`;
    } else {
      if (!sec.fixed) html += `<button type="button" class="btn btn-red btn-small" data-add="1">+ Add new</button>`;
      html += data.map((r, i) => `<fieldset><legend>${esc(sec.title ? sec.title(r) : (r.title || r.name || r.caption || r.date || "New"))}</legend>
        ${sec.fields.map((f) => fieldHtml(sec, r, i, f)).join("")}
        ${sec.fixed ? "" : `<div class="ed-row-actions">
          <button type="button" class="btn btn-small btn-ghost" data-move="-1" data-idx="${i}" ${i === 0 ? "disabled" : ""}>Move up</button>
          <button type="button" class="btn btn-small btn-ghost" data-move="1" data-idx="${i}" ${i === data.length - 1 ? "disabled" : ""}>Move down</button>
          <button type="button" class="btn btn-small btn-danger" data-del="${i}">Delete</button></div>`}
      </fieldset>`).join("") || `<p class="placeholder">Nothing here yet.</p>`;
    }
    $("ed-panel").innerHTML = html;
  }

  const rowFor = (idx) => (idx < 0 ? site[open] : site[open][idx]);

  function wire() {
    $("ed-tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) { open = b.dataset.tab; render(); } });
    $("ed-panel").addEventListener("input", (e) => {
      const el = e.target; if (!el.dataset.field) return;
      const r = rowFor(+el.dataset.idx);
      r[el.dataset.field] = el.type === "checkbox" ? el.checked : el.value;
      delete r.sample; // an edited sample row is a real one now
      if (!dirty.has(open)) { markDirty(); $("ed-tabs").querySelector(`[data-tab="${open}"]`).textContent += " •"; }
    });
    $("ed-panel").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const sec = SECTIONS.find((s) => s.key === open), list = site[open];
      if (b.dataset.add) list.unshift({ ...sec.blank });
      else if (b.dataset.del !== undefined) { if (!confirmDelete(list[+b.dataset.del])) return; list.splice(+b.dataset.del, 1); }
      else if (b.dataset.move) { const i = +b.dataset.idx, j = i + +b.dataset.move; [list[i], list[j]] = [list[j], list[i]]; }
      else if (b.dataset.pick) { const r = rowFor(+b.dataset.idx); return pickFile(b.dataset.pick, r, b.dataset.field, r.title || r.caption || r.name || r.date); }
      else if (b.dataset.locate !== undefined) return locate(rowFor(+b.dataset.locate), b.dataset.field, b);
      else if (b.dataset.clear !== undefined) { rowFor(+b.dataset.clear)[b.dataset.field] = ""; }
      else if (b.dataset.nl) return newsletter(b.dataset.nl);
      else return;
      markDirty(); render();
    });
    $("ed-save").addEventListener("click", save);
    $("ed-signout").addEventListener("click", () => { try { localStorage.removeItem(KEY_NAME); sessionStorage.removeItem(KEY_NAME); } catch (e) {} location.reload(); });
    window.addEventListener("beforeunload", (e) => { if (dirty.size) { e.preventDefault(); e.returnValue = ""; } });
  }
  // ---------- The Sentinel ----------
  const siteBase = new URL(".", location.href).href;
  function newsletterHtml(forEmail, forPreview, wide) {
    const img = (p) => (forPreview && uploads.get(p) ? uploads.get(p).preview : /^https?:/.test(p) ? p : siteBase + p);
    return window.buildSentinel(site, site.sentinelDraft, img, forEmail, wide);
  }
  async function newsletter(action) {
    const d = site.sentinelDraft;
    if (action === "preview") {
      window.open(URL.createObjectURL(new Blob([newsletterHtml(true, true, true)], { type: "text/html" })), "_blank");
    } else if (action === "copy") {
      try { await navigator.clipboard.writeText(newsletterHtml(true)); status("Copied! In Mailchimp, choose \"Code your own\", paste, and send. (Save first if you added new photos, so they're online.)"); }
      catch (e) { status("Your browser blocked copying. Use Download instead, then open the file and paste its contents into Mailchimp.", true); }
    } else if (action === "download") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([newsletterHtml(true)], { type: "text/html" }));
      a.download = `sentinel-${slug(d.issue || stamp())}.html`;
      a.click();
    } else if (action === "next") {
      if (pendingDelete !== d) { pendingDelete = d; return status("Click \"Start Next Week's Issue\" again to clear this week's stories. Your checkboxes and signature stay.", true); }
      pendingDelete = null;
      const t = new Date(), mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() + ((8 - t.getDay()) % 7 || 7));
      ["preheader", "coverImage", "coverCaption", "commanderMessage", "spotlightTitle", "spotlightBody", "kitchenNews", "auxNews", "sonsNews",
        "communityTitle", "communityBody", "newMembers", "drawings", "taps", "memberNotice"].forEach((k) => { d[k] = ""; });
      d.issue = "Week of " + mon.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      markDirty(); render();
      status("Ready for next week. Click Save Changes to keep the fresh draft.");
    } else if (action === "publish") {
      if (!d.issue) return status("Add the issue name (like November 2026) first.", true);
      const path = `newsletter/issues/sentinel-${slug(d.issue)}.html`;
      uploads.set(path, { bytes: new TextEncoder().encode(newsletterHtml(false, false, true)) });
      if (!site.sentinel.some((n) => n.file === path)) site.sentinel.unshift({ title: "The Sentinel", date: d.issue, file: path });
      dirty.add("sentinel"); dirty.add("sentinelDraft");
      await save();
    }
  }

  // A plain inline "are you sure" instead of a browser pop-up.
  let pendingDelete = null;
  function confirmDelete(row) {
    if (pendingDelete === row) { pendingDelete = null; return true; }
    pendingDelete = row;
    status("Click Delete again to remove it. (Nothing is removed from the website until you click Save.)", true);
    return false;
  }

  async function save() {
    const btn = $("ed-save");
    btn.disabled = true; btn.textContent = "Saving…";
    try {
      for (let attempt = 0; ; attempt++) {
        const ref = await gh(`/git/ref/heads/${BRANCH}`);
        const head = ref.object.sha;
        const commit = await gh(`/git/commits/${head}`);
        let src = await loadContent(head);
        for (const key of dirty) {
          const sec = SECTIONS.find((s) => s.key === key);
          let v = site[key];
          if (sec.sortBy) v = [...v].sort((a, b) => String(a[sec.sortBy]).localeCompare(String(b[sec.sortBy])));
          const span = valueSpan(src, key);
          if (!span) throw new Error(`Couldn't find "${key}" in content.js`);
          src = src.slice(0, span[0]) + serialize(tidy(key, v)) + src.slice(span[1]);
        }
        evalContent(src); // never commit a content.js the website can't read
        const tree = [{ path: "content.js", mode: "100644", type: "blob", content: src }];
        const used = JSON.stringify(site);
        for (const [path, up] of uploads) {
          if (!used.includes(JSON.stringify(path))) continue; // replaced or removed before saving
          const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: bytesToB64(up.bytes), encoding: "base64" }) });
          tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
        }
        const newTree = await gh("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
        const labels = [...dirty].map((k) => SECTIONS.find((s) => s.key === k).label).join(", ");
        const newCommit = await gh("/git/commits", { method: "POST", body: JSON.stringify({ message: `Update ${labels} from the site editor`, tree: newTree.sha, parents: [head] }) });
        try {
          await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: newCommit.sha }) });
          break;
        } catch (e) {
          if (e.status !== 422 || attempt >= 2) throw e; // someone else saved at the same moment: redo on top of theirs
        }
      }
      dirty.clear(); uploads.clear();
      $("ed-save-note").textContent = "";
      status("Saved! The website will show your changes in a minute or two.");
      render();
    } catch (e) {
      status(e.status === 401 || e.status === 403 || e.status === 404
        ? "GitHub didn't accept your key for saving. Check that it has Contents: Read and write for this repository, or sign out and add a new key."
        : "Saving didn't work: " + e.message + ". Your changes are still here, so you can try again.", true);
      btn.disabled = false;
    } finally {
      btn.textContent = "Save Changes";
    }
  }

  async function start(key, remember) {
    token = key.trim();
    status("");
    $("ed-login-btn").disabled = true;
    try {
      site = evalContent(await loadContent(BRANCH));
      SECTIONS.forEach((s) => { if (!site[s.key]) site[s.key] = s.type === "object" ? {} : []; });
      try { (remember ? localStorage : sessionStorage).setItem(KEY_NAME, token); } catch (e) {}
      $("ed-login").hidden = true; $("ed-app").hidden = false;
      render();
    } catch (e) {
      try { localStorage.removeItem(KEY_NAME); sessionStorage.removeItem(KEY_NAME); } catch (x) {}
      $("ed-login").hidden = false; $("ed-app").hidden = true;
      status(e.status ? "That key didn't work. Check that you copied all of it and that it has access to the legion-post-151-website repository." : "Couldn't reach GitHub. Check your internet connection and try again.", true);
    } finally { $("ed-login-btn").disabled = false; }
  }

  wire();
  $("ed-login-form").addEventListener("submit", (e) => { e.preventDefault(); start($("ed-key").value, $("ed-remember").checked); });
  let saved = "", remembered = false;
  try { remembered = !!localStorage.getItem(KEY_NAME); saved = localStorage.getItem(KEY_NAME) || sessionStorage.getItem(KEY_NAME) || ""; } catch (e) {}
  if (saved) start(saved, remembered);
})();
