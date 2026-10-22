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
    { key: "gallery", label: "Photo Gallery", type: "list",
      help: "Photos for the Gallery page. Big phone photos are shrunk automatically before upload.",
      blank: { file: "", caption: "" },
      fields: [["file", "Photo", "image"], ["caption", "Caption (optional)"]] },
    { key: "sentinel", label: "The Sentinel", type: "list",
      help: "Newsletter issues on the Sentinel page, newest first.",
      blank: { title: "The Sentinel", date: "", file: "" },
      fields: [["title", "Title"], ["date", "Issue (like November 2026)"], ["file", "PDF", "pdf"]] },
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
      rowFor(+el.dataset.idx)[el.dataset.field] = el.value;
      if (!dirty.has(open)) { markDirty(); $("ed-tabs").querySelector(`[data-tab="${open}"]`).textContent += " •"; }
    });
    $("ed-panel").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const sec = SECTIONS.find((s) => s.key === open), list = site[open];
      if (b.dataset.add) list.unshift({ ...sec.blank });
      else if (b.dataset.del !== undefined) { if (!confirmDelete(list[+b.dataset.del])) return; list.splice(+b.dataset.del, 1); }
      else if (b.dataset.move) { const i = +b.dataset.idx, j = i + +b.dataset.move; [list[i], list[j]] = [list[j], list[i]]; }
      else if (b.dataset.pick) { const r = rowFor(+b.dataset.idx); return pickFile(b.dataset.pick, r, b.dataset.field, r.title || r.caption || r.name || r.date); }
      else if (b.dataset.clear !== undefined) { rowFor(+b.dataset.clear)[b.dataset.field] = ""; }
      else return;
      markDirty(); render();
    });
    $("ed-save").addEventListener("click", save);
    $("ed-signout").addEventListener("click", () => { try { localStorage.removeItem(KEY_NAME); sessionStorage.removeItem(KEY_NAME); } catch (e) {} location.reload(); });
    window.addEventListener("beforeunload", (e) => { if (dirty.size) { e.preventDefault(); e.returnValue = ""; } });
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
