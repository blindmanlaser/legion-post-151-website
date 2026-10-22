// Builds The Sentinel email newsletter from the editor's "Write The Sentinel" tab (site.sentinelDraft)
// plus the live site content (events, specials, hours, meetings, officers).
// Same layout as newsletter/sentinel-template.html: tables and inline styles so email programs show it right.
// Empty fields leave their section out.
window.buildSentinel = function (S, d, img, forEmail) {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = (t, size = 15) => String(t || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p style="font-size:${size}px; line-height:1.6; margin:10px 0 0;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const lines = (t) => String(t || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fmtTime = (hhmm) => { let [h, m] = hhmm.split(":").map(Number); if (!h && !m) return "midnight"; const ap = h >= 12 ? "pm" : "am"; h = h % 12 || 12; return m ? `${h}:${String(m).padStart(2, "0")} ${ap}` : (h === 12 && ap === "pm" ? "noon" : `${h} ${ap}`); };
  const parseDate = (s) => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };

  const row = (inner, pad = "28px 24px 0") => `<tr><td style="padding:${pad};">${inner}</td></tr>`;
  const heading = (t) => `<div style="font-family:Georgia, serif; font-size:24px; font-weight:bold; color:#0a2240; border-bottom:3px solid #c9a227; padding-bottom:6px;">&#9733; ${esc(t)}</div>`;
  const small = (t) => `<div style="font-size:17px; font-weight:bold; color:#0a2240;">&#9733; ${esc(t)}</div>`;
  const stripe = (c, h) => `<tr><td style="height:${h}px; font-size:0; line-height:0; background:${c};">&nbsp;</td></tr>`;
  const out = [];

  // Masthead
  out.push(stripe("#b22234", 8), stripe("#ffffff", 4), `<tr><td align="center" style="background:#0a2240; padding:26px 20px 22px;">
    <img src="${img("images/emblems/legion.png")}" width="96" height="100" alt="American Legion emblem" style="display:block; border:0; margin:0 auto 10px;">
    <div style="font-family:Georgia, 'Times New Roman', serif; font-size:44px; line-height:1; font-weight:bold; letter-spacing:4px; color:#ffffff;">THE SENTINEL</div>
    <div style="font-size:14px; letter-spacing:3px; color:#c9a227; text-transform:uppercase; padding-top:10px;">American Legion Cowle Post 151 &middot; Conneaut, Ohio</div>
    <div style="font-size:13px; color:#c8d1e0; padding-top:12px;">&#9733; &nbsp;${esc(d.issue || "")} &nbsp;&middot;&nbsp; For God and Country &nbsp;&#9733;</div>
  </td></tr>`, stripe("#ffffff", 4), stripe("#b22234", 8));

  if (d.coverImage) out.push(row(`<img src="${img(d.coverImage)}" width="592" alt="${esc(d.coverCaption || "Cover photo")}" style="display:block; width:100%; max-width:592px; height:auto; border:0; border-radius:6px;">
    ${d.coverCaption ? `<div style="font-size:12px; color:#6b7280; padding-top:6px; font-style:italic;">${esc(d.coverCaption)}</div>` : ""}`, "24px 24px 0"));

  if (d.commanderMessage) out.push(row(`${heading("A Message from the Commander")}
    <p style="font-size:15px; line-height:1.6; margin:16px 0 0;"><em>Comrades, Auxiliary members and Sons,</em></p>
    ${paras(d.commanderMessage)}
    <p style="font-size:15px; line-height:1.4; margin:18px 0 0;"><strong>For God and Country,</strong><br>${(() => { const [name, ...rest] = esc(d.commanderSign || "").split(","); return `<em>${name.trim()}</em>${rest.length ? `<br><strong>${rest.join(",").trim()}</strong>` : ""}`; })()}</p>`));

  if (d.spotlightTitle || d.spotlightBody) out.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f4ec; border-left:6px solid #b22234;"><tr><td style="padding:16px 18px;">
    <div style="font-size:18px; font-weight:bold; color:#b22234;">${esc(d.spotlightTitle)}</div>${paras(d.spotlightBody)}</td></tr></table>`, "20px 24px 4px"));

  if (d.includeHours) {
    const same = S.hours.every((h) => h.open === S.hours[0].open && h.close === S.hours[0].close);
    const hours = same ? `Open every day, ${fmtTime(S.hours[0].open)} to ${fmtTime(S.hours[0].close)}.`
      : S.hours.map((h) => `${h.label}: ${h.open ? fmtTime(h.open) + " to " + fmtTime(h.close) : "closed"}`).join(" &middot; ");
    const kitchen = (S.kitchenHours || []).filter((k) => k.time !== "Closed").map((k) => `${esc(k.days)} ${esc(k.time)}`).join("; ");
    const nth = (y, m, w, wd) => { const f = new Date(y, m, 1); return new Date(y, m, 1 + ((wd - f.getDay() + 7) % 7) + (w - 1) * 7); };
    const ord = ["", "1st", "2nd", "3rd", "4th", "5th"];
    const meets = (S.meetings || []).map((mt) => {
      let dt = nth(today.getFullYear(), today.getMonth(), mt.week, mt.weekday);
      if (dt < today) dt = nth(today.getFullYear(), today.getMonth() + 1, mt.week, mt.weekday);
      return `${esc(mt.group)}: ${ord[mt.week]} ${DAYS[mt.weekday]}, ${esc(mt.time)} &middot; <strong>${MONTHS[dt.getMonth()]} ${dt.getDate()}</strong>`;
    }).join("<br>");
    out.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a2240; border-radius:6px;"><tr><td style="padding:18px 20px; color:#ffffff;">
      <div style="font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#c9a227; font-weight:bold;">Post Hours</div>
      <div style="font-size:15px; line-height:1.6; padding-top:4px;">${hours}${kitchen ? ` Kitchen: ${kitchen}.` : ""}</div>
      ${meets ? `<div style="font-size:13px; letter-spacing:2px; text-transform:uppercase; color:#c9a227; font-weight:bold; padding-top:14px;">Monthly Meetings</div><div style="font-size:15px; line-height:1.7; padding-top:4px;">${meets}</div>` : ""}
    </td></tr></table>`, "24px 24px 4px"));
  }

  if (d.includeEvents) {
    const days = Number(d.eventDays) || 60, until = new Date(today.getTime() + days * 864e5);
    const evs = (S.events || []).map((e) => ({ ...e, dt: parseDate(e.date) })).filter((e) => e.dt >= today && e.dt <= until).sort((a, b) => a.dt - b.dt);
    if (evs.length) out.push(row(heading("Upcoming Events")) + evs.map((e) => row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="70" valign="top" style="width:70px;"><table role="presentation" width="62" cellpadding="0" cellspacing="0" border="0" style="background:#b22234; border-radius:6px;">
        <tr><td align="center" style="padding:6px 0; color:#ffffff; font-size:12px; text-transform:uppercase; letter-spacing:1px;">${MONTHS[e.dt.getMonth()]}</td></tr>
        <tr><td align="center" style="padding:0 0 8px; color:#ffffff; font-size:26px; font-weight:bold; line-height:1;">${e.dt.getDate()}</td></tr></table></td>
      <td valign="top">
        <div style="font-size:18px; font-weight:bold; color:#0a2240;">${esc(e.title)}</div>
        <div style="font-size:14px; color:#b22234; font-weight:bold; padding-top:2px;">${DAYS[e.dt.getDay()]}${e.time ? ", " + esc(e.time) : ""}${e.host ? " &middot; " + esc(e.host) : ""}</div>
        ${e.body ? `<p style="font-size:15px; line-height:1.6; margin:6px 0 0;">${esc(e.body)}</p>` : ""}
        ${e.tickets ? `<p style="font-size:15px; line-height:1.6; margin:6px 0 0;"><strong>${esc(e.tickets)}</strong></p>` : ""}
        ${e.image ? `<img src="${img(e.image)}" width="300" alt="${esc(e.title)}" style="display:block; width:100%; max-width:300px; height:auto; border:0; border-radius:4px; margin-top:10px;">` : ""}
      </td></tr></table>`, "18px 24px 0")).join(""));
  }

  if (d.includeSpecials || d.kitchenNews) {
    const sp = d.includeSpecials ? [1, 2, 3, 4, 5, 6, 0].map((n) => (S.specials || []).find((s) => s.day === n))
      .filter((s) => s && s.item && !/closed/i.test(s.item))
      .map((s) => `<tr><td style="padding:7px 0; border-bottom:1px dotted #d8d2c2; width:120px;"><strong>${DAYS[s.day]}</strong></td><td style="padding:7px 0; border-bottom:1px dotted #d8d2c2;">${esc(s.item)}${s.price ? ` &middot; <span style="color:#b22234; font-weight:bold;">${esc(s.price)}</span>` : ""}</td></tr>`).join("") : "";
    out.push(row(`${heading("Canteen & Kitchen")}
      ${sp ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; font-size:15px;">${sp}</table>` : ""}
      ${paras(d.kitchenNews)}`, "30px 24px 0"));
  }

  if (d.includeHeroes) out.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f4ec; border-top:4px solid #0a2240;"><tr>
    <td width="170" valign="top" style="padding:16px 0 16px 16px; width:170px;"><img src="${img("images/hometown-hero-flags.jpg")}" width="150" alt="Hometown Hero flags" style="display:block; width:150px; height:auto; border:0; border-radius:4px;"></td>
    <td valign="top" style="padding:16px 18px;"><div style="font-size:18px; font-weight:bold; color:#0a2240;">Hometown Hero Flags</div>
    <p style="font-size:15px; line-height:1.6; margin:6px 0 0;">Honor a veteran with a tribute flag displayed in Conneaut from Memorial Day through Veterans Day. $200 per flag. Order online at our website, or call George Sabo at 440-813-3364.</p></td>
  </tr></table>`, "30px 24px 0"));

  if (d.auxNews || d.sonsNews) {
    const box = (emb, w, title, txt) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d8d2c2; border-radius:6px;"><tr><td style="padding:16px;">
      <img src="${img("images/emblems/" + emb + ".png")}" width="${w}" height="56" alt="" style="display:block; border:0;">
      <div style="font-size:17px; font-weight:bold; color:#0a2240; padding-top:8px;">${title}</div>${paras(txt, 14)}</td></tr></table>`;
    const cells = [d.auxNews && box("auxiliary", 54, "Auxiliary Corner", d.auxNews), d.sonsNews && box("sons", 46, "Sons of the Legion", d.sonsNews)].filter(Boolean);
    out.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells.map((c, i) =>
      `<td width="${100 / cells.length}%" valign="top" style="${cells.length > 1 ? (i ? "padding-left:8px;" : "padding-right:8px;") : ""}">${c}</td>`).join("")}</tr></table>`, "24px 24px 0"));
  }

  if (d.communityTitle || d.communityBody) out.push(row(`${heading("Community & Charity")}
    ${d.communityTitle ? `<div style="font-size:17px; font-weight:bold; color:#b22234; padding-top:14px;">${esc(d.communityTitle)}</div>` : ""}${paras(d.communityBody)}`, "30px 24px 0"));

  if (d.newMembers) out.push(row(`${small("Welcome, New Members")}<p style="font-size:15px; line-height:1.6; margin:6px 0 0;">${esc(d.newMembers)} Thank you for joining our Legion family!</p>`, "24px 24px 0"));

  if (lines(d.drawings).length) out.push(row(`${small("Drawings & Winners")}<p style="font-size:15px; line-height:1.7; margin:6px 0 0;">${lines(d.drawings).map(esc).join("<br>")}</p>`, "24px 24px 0"));

  if (lines(d.taps).length) out.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a2240; border-radius:6px;"><tr><td align="center" style="padding:20px; color:#ffffff;">
    <div style="font-family:Georgia, serif; font-size:22px; color:#c9a227; letter-spacing:2px;">TAPS</div>
    <div style="font-size:13px; color:#c8d1e0; font-style:italic; padding-top:4px;">We honor our comrades who have answered their final roll call.</div>
    <div style="font-size:16px; line-height:1.8; padding-top:10px;">${lines(d.taps).map(esc).join("<br>")}</div></td></tr></table>`));

  if (d.includeOfficers) {
    const col = (title, list) => `<td width="33%" valign="top" style="padding-right:8px;"><div style="font-weight:bold; color:#b22234; text-transform:uppercase; font-size:12px; letter-spacing:1px;">${title}</div>${(list || []).map((o) => `${esc(o.title)}: ${esc(o.name)}`).join("<br>")}</td>`;
    out.push(row(`${heading("Officers")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; font-size:14px; line-height:1.6;"><tr>
      ${col("Post 151", S.officers)}${col("Sons (SAL)", S.sonsOfficers)}${col("Auxiliary", S.auxiliaryOfficers)}</tr></table>`, "30px 24px 0"));
  }

  if (d.memberNotice) out.push(row(`<p style="font-size:14px; line-height:1.6; margin:0; padding:12px 14px; background:#f7f4ec; border-radius:6px;"><strong>Members:</strong> ${esc(d.memberNotice)}</p>`, "24px 24px 0"));

  out.push(row(`<p style="font-size:14px; line-height:1.6; margin:0; text-align:center; color:#0a2240;"><strong>Veterans Crisis Line:</strong> Dial 988, then press 1 &middot; Text 838255 &middot; VA benefits 1-800-827-1000</p>`, "24px 24px 0"));

  // Footer
  const seal = (n, w, alt) => `<td style="padding:0 8px;"><img src="${img("images/emblems/" + n + ".png")}" width="${w}" height="60" alt="${alt}" style="display:block; border:0;"></td>`;
  out.push(`<tr><td align="center" style="padding:28px 24px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    ${seal("legion", 58, "The American Legion")}${seal("sons", 49, "Sons of the American Legion")}${seal("auxiliary", 58, "American Legion Auxiliary")}</tr></table></td></tr>
  <tr><td align="center" style="padding:16px 24px 26px; font-size:13px; line-height:1.7; color:#4b5563;">
    <strong style="color:#0a2240;">American Legion Cowle Post 151</strong><br>${esc(S.address)} &middot; ${esc(S.phone)}<br>
    <a href="https://conneautlegionpost151.org" style="color:#b22234;">conneautlegionpost151.org</a>${S.facebook ? ` &middot; <a href="${esc(S.facebook)}" style="color:#b22234;">Facebook</a>` : ""}<br>
    <span style="font-size:12px; color:#6b7280;">${forEmail
      ? `You're getting The Sentinel because you signed up at our website or at the Post. <a href="*|UNSUB|*" style="color:#6b7280;">Unsubscribe</a>`
      : `Get The Sentinel by email: <a href="https://conneautlegionpost151.org/sentinel.html" style="color:#6b7280;">sign up at our website</a>.`}</span>
  </td></tr>`, stripe("#0a2240", 4), stripe("#b22234", 8));

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Sentinel${d.issue ? " · " + esc(d.issue) : ""} · American Legion Post 151</title></head>
<body style="margin:0; padding:0; background:#e9e4d6;">
<div style="display:none; max-height:0; overflow:hidden;">${esc(d.preheader || "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e4d6;"><tr><td align="center" style="padding:20px 10px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:640px; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#1d2433;">
${out.join("\n")}
</table></td></tr></table></body></html>`;
};
