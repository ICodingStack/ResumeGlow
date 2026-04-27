/**
 * ResumeGlow — js/preview-renderer.js
 * Generates rich HTML strings for each resume template.
 * Called whenever resume data or template selection changes.
 */

/**
 * Main entry: renders the resume preview HTML
 * @param {Object} data - resume data
 * @param {string} templateId - template identifier
 * @param {Array} sectionVisibility - which sections to show
 * @returns {string} HTML string
 */
function renderResume(data, templateId, sectionVisibility) {
  // Build visibility map
  const vis = {};
  (sectionVisibility || []).forEach((s) => {
    vis[s.key] = s.visible;
  });

  const css = `--accent: ${data.accentColor || "#d4852a"}; font-size: ${data.fontSize || 12}px; font-family: 'DM Sans', Arial, sans-serif; letter-spacing: normal; word-spacing: normal`;

  switch (templateId) {
    case "minimal":
      return renderMinimal(data, vis, css);
    case "executive":
      return renderExecutive(data, vis, css);
    case "creative":
      return renderCreative(data, vis, css);
    case "elegant":
      return renderElegant(data, vis, css);
    case "tech":
      return renderTech(data, vis, css);
    default:
      return renderModern(data, vis, css);
  }
}

/* ─── Shared helpers ──────────────────────────────── */

function contactItems(data, light = false) {
  const items = [];
  const color = light ? "rgba(255,255,255,0.75)" : "#666";
  const dot = `<span style="color:${color};margin:0 2px">·</span>`;
  if (data.email) items.push(`<span>${escapeHtml(data.email)}</span>`);
  if (data.phone) items.push(`<span>${escapeHtml(data.phone)}</span>`);
  if (data.location) items.push(`<span>${escapeHtml(data.location)}</span>`);
  if (data.website) items.push(`<span>${escapeHtml(data.website)}</span>`);
  return items.join(`${dot}`);
}

function renderBullets(bullets, accentColor) {
  if (!bullets || !bullets.filter((b) => b.trim()).length) return "";
  return `<ul style="list-style:none;padding:0;margin:6px 0 0;font-family:'DM Sans',Arial,sans-serif">
    ${bullets
      .filter((b) => b.trim())
      .map(
        (b) => `
      <li style="display:flex;align-items:flex-start;gap:7px;font-size:11px;color:#333;margin-bottom:4px;line-height:1.6;font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal">
        <span style="width:4px;height:4px;border-radius:50%;background:${accentColor};flex-shrink:0;margin-top:5px;display:inline-block"></span>
        <span style="font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal">${escapeHtml(b)}</span>
      </li>`,
      )
      .join("")}
  </ul>`;
}

function renderSkillPills(skills, accentColor, style = "filled") {
  if (!skills || !skills.length) return "";
  if (style === "outline") {
    return skills
      .map(
        (s) =>
          `<span style="display:inline-block;padding:3px 9px;border-radius:4px;font-size:10.5px;font-weight:500;border:1px solid ${accentColor};color:${accentColor};margin:2px 2px 2px 0;">${escapeHtml(s)}</span>`,
      )
      .join("");
  }
  if (style === "soft") {
    const hex = accentColor;
    return skills
      .map(
        (s) =>
          `<span style="display:inline-block;padding:3px 9px;border-radius:20px;font-size:10.5px;font-weight:500;background:rgba(0,0,0,0.06);color:#333;margin:2px 2px 2px 0;">${escapeHtml(s)}</span>`,
      )
      .join("");
  }
  return skills
    .map(
      (s) =>
        `<span style="display:inline-block;padding:3px 9px;border-radius:4px;font-size:10.5px;font-weight:500;background:${accentColor};color:white;margin:2px 2px 2px 0;">${escapeHtml(s)}</span>`,
    )
    .join("");
}

function photoEl(src, size, radius, border, style = "") {
  if (!src) return "";
  return `<img src="${escapeHtml(src)}" style="width:${size}px;height:${size}px;border-radius:${radius};object-fit:cover;${border};${style}" alt="Profile" />`;
}

function summarySection(data, vis, accentColor) {
  if (!vis.summary || !data.summary) return "";
  return `<p style="font-size:11.5px;line-height:1.65;color:#444">${escapeHtml(data.summary)}</p>`;
}

function experienceEntries(data, vis, accentColor) {
  if (!vis.experience) return "";
  const F = "font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal";
  const jobs = (data.experience || []).filter((j) => j.title || j.company);
  return jobs
    .map(
      (job) => `
    <div style="margin-bottom:18px;${F}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-weight:600;font-size:12.5px;color:#111;${F}">${escapeHtml(job.title)}</div>
          <div style="font-size:11.5px;color:#555;margin-top:1px;${F}">${escapeHtml(job.company)}${job.location ? ` · ${escapeHtml(job.location)}` : ""}</div>
        </div>
        <div style="font-size:10.5px;color:#888;white-space:nowrap;flex-shrink:0;padding-left:8px;${F}">${escapeHtml(job.startDate || "")}${job.endDate ? ` – ${escapeHtml(job.endDate)}` : ""}</div>
      </div>
      ${renderBullets(job.bullets, accentColor)}
    </div>`,
    )
    .join("");
}

function educationEntries(data, vis) {
  if (!vis.education) return "";
  const F = "font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal";
  return (data.education || [])
    .filter((e) => e.degree || e.school)
    .map(
      (edu) => `
    <div style="margin-bottom:12px;${F}">
      <div style="font-weight:600;font-size:12px;color:#111;${F}">${escapeHtml(edu.degree)}</div>
      <div style="font-size:11px;color:#555;${F}">${escapeHtml(edu.school)}</div>
      <div style="font-size:10.5px;color:#888;${F}">${escapeHtml(edu.year)}${edu.gpa ? ` · ${escapeHtml(edu.gpa)}` : ""}</div>
    </div>`,
    )
    .join("");
}

function projectEntries(data, vis, accentColor) {
  if (!vis.projects) return "";
  const F = "font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal";
  return (data.projects || [])
    .filter((p) => p.name)
    .map(
      (proj) => `
    <div style="margin-bottom:14px;${F}">
      <div style="font-weight:600;font-size:12px;color:#111;${F}">${escapeHtml(proj.name)}${proj.link ? ` <span style="font-size:10px;color:${accentColor};font-weight:400;${F}">${escapeHtml(proj.link)}</span>` : ""}</div>
      ${proj.tech ? `<div style="font-size:10.5px;color:${accentColor};margin:2px 0 4px;${F}">${escapeHtml(proj.tech)}</div>` : ""}
      ${proj.description ? `<div style="font-size:11px;color:#444;line-height:1.6;${F}">${escapeHtml(proj.description)}</div>` : ""}
    </div>`,
    )
    .join("");
}

function certEntries(data, vis) {
  if (!vis.certifications) return "";
  const F = "font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal";
  return (data.certifications || [])
    .filter((c) => c)
    .map(
      (c) => `
    <div style="font-size:11px;color:#444;padding:3px 0;border-bottom:1px solid #f5f5f5;${F}">${escapeHtml(c)}</div>`,
    )
    .join("");
}

function langEntries(data, vis, accentColor) {
  if (!vis.languages) return "";
  const F = "font-family:'DM Sans',Arial,sans-serif;letter-spacing:normal";
  return (data.languages || [])
    .filter((l) => l.name)
    .map(
      (l) => `
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10.5px;margin-bottom:5px;color:#444;${F}">
      <span style="${F}">${escapeHtml(l.name)}</span>
      <span style="font-size:9.5px;color:${accentColor};font-weight:500;${F}">${escapeHtml(l.level)}</span>
    </div>`,
    )
    .join("");
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 1: MODERN (dark header, two-column)
═══════════════════════════════════════════════════ */
function renderModern(data, vis, cssVars) {
  const accent = data.accentColor || "#d4852a";
  return `
<div class="resume-modern" style="${cssVars}">
  <!-- Header -->
  <div class="resume-header" style="padding:36px 40px 28px;border-bottom:2px solid ${accent};background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:white;display:flex;align-items:flex-start;gap:24px">
    ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid ${accent};flex-shrink:0" alt="Profile" />` : ""}
    <div style="flex:1">
      <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:32px;font-weight:600;line-height:1.1;letter-spacing:-0.5px;color:white">${escapeHtml(data.name) || '<span style="opacity:0.3">Your Name</span>'}</div>
      ${data.title ? `<div style="font-size:12px;color:${accent};font-weight:500;letter-spacing:0.08em;text-transform:uppercase;margin-top:5px">${escapeHtml(data.title)}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:10.5px;color:rgba(255,255,255,0.7)">
        ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ""}
        ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ""}
        ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ""}
        ${data.website ? `<span>${escapeHtml(data.website)}</span>` : ""}
      </div>
    </div>
  </div>

  <!-- Body: main + sidebar -->
  <div style="display:grid;grid-template-columns:1fr 200px;min-height:900px">
    <!-- Main -->
    <div style="padding:28px 32px;border-right:1px solid #f0f0f0">
      ${
        vis.summary && data.summary
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:15px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid ${accent};padding-bottom:5px;margin-bottom:12px">Summary</div>
        <p style="font-size:11.5px;line-height:1.65;color:#444;margin-bottom:20px">${escapeHtml(data.summary)}</p>`
          : ""
      }

      ${
        vis.experience &&
        (data.experience || []).filter((j) => j.title || j.company).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:15px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid ${accent};padding-bottom:5px;margin-bottom:14px">Experience</div>
        ${experienceEntries(data, vis, accent)}`
          : ""
      }

      ${
        vis.projects && (data.projects || []).filter((p) => p.name).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:15px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid ${accent};padding-bottom:5px;margin:20px 0 14px">Projects</div>
        ${projectEntries(data, vis, accent)}`
          : ""
      }
    </div>

    <!-- Sidebar -->
    <div style="padding:28px 20px;background:#fafaf9">
      ${
        vis.education &&
        (data.education || []).filter((e) => e.degree || e.school).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:13px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(212,133,42,0.3);padding-bottom:4px;margin-bottom:10px">Education</div>
        ${educationEntries(data, vis)}`
          : ""
      }

      ${
        vis.skills && (data.skills || []).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:13px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(212,133,42,0.3);padding-bottom:4px;margin:18px 0 10px">Skills</div>
        <div>${renderSkillPills(data.skills, accent)}</div>`
          : ""
      }

      ${
        vis.certifications &&
        (data.certifications || []).filter((c) => c).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:13px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(212,133,42,0.3);padding-bottom:4px;margin:18px 0 10px">Certifications</div>
        ${certEntries(data, vis)}`
          : ""
      }

      ${
        vis.languages && (data.languages || []).filter((l) => l.name).length
          ? `
        <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:13px;font-weight:600;color:${accent};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(212,133,42,0.3);padding-bottom:4px;margin:18px 0 10px">Languages</div>
        ${langEntries(data, vis, accent)}`
          : ""
      }
    </div>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 2: MINIMAL (ultra-clean, single-column)
═══════════════════════════════════════════════════ */
function renderMinimal(data, vis, cssVars) {
  const accent = data.accentColor || "#d4852a";
  const ST = (label) =>
    `<div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${accent};margin:24px 0 10px">${label}</div>`;
  return `
<div class="resume-minimal" style="${cssVars};padding:52px 56px;background:white;font-size:11.5px;color:#1a1a1a">
  <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:42px;font-weight:300;letter-spacing:-1px;color:#111;line-height:1">${escapeHtml(data.name) || '<span style="opacity:0.2">Your Name</span>'}</div>
  ${data.title ? `<div style="font-size:12px;color:${accent};font-weight:400;letter-spacing:0.15em;text-transform:uppercase;margin-top:7px">${escapeHtml(data.title)}</div>` : ""}
  <div style="height:1px;background:linear-gradient(to right,${accent},transparent);margin:16px 0"></div>
  <div style="display:flex;flex-wrap:wrap;gap:18px;font-size:10.5px;color:#666">${contactItems(data)}</div>

  ${vis.summary && data.summary ? `${ST("Summary")}<p style="font-size:11.5px;line-height:1.7;color:#444">${escapeHtml(data.summary)}</p>` : ""}

  ${
    vis.experience &&
    (data.experience || []).filter((j) => j.title || j.company).length
      ? `
    ${ST("Experience")}
    ${(data.experience || [])
      .filter((j) => j.title || j.company)
      .map(
        (job) => `
      <div style="margin-bottom:20px">
        <div style="font-weight:600;font-size:12.5px;color:#111">${escapeHtml(job.title)}</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#777;margin:2px 0 7px">
          <span>${escapeHtml(job.company)}${job.location ? ` · ${escapeHtml(job.location)}` : ""}</span>
          <span>${escapeHtml(job.startDate || "")}${job.endDate ? ` – ${escapeHtml(job.endDate)}` : ""}</span>
        </div>
        ${(job.bullets || [])
          .filter((b) => b.trim())
          .map(
            (b) =>
              `<div style="font-size:11px;color:#333;line-height:1.6;margin-bottom:3px;padding-left:12px;position:relative"><span style="position:absolute;left:0;color:${accent}">–</span>${escapeHtml(b)}</div>`,
          )
          .join("")}
      </div>`,
      )
      .join("")}`
      : ""
  }

  ${
    vis.skills && (data.skills || []).length
      ? `
    ${ST("Skills")}
    <div style="display:flex;flex-wrap:wrap;gap:4px">${renderSkillPills(data.skills, accent, "outline")}</div>`
      : ""
  }

  ${
    vis.education &&
    (data.education || []).filter((e) => e.degree || e.school).length
      ? `
    ${ST("Education")}
    ${educationEntries(data, vis)}`
      : ""
  }

  ${
    vis.projects && (data.projects || []).filter((p) => p.name).length
      ? `
    ${ST("Projects")}
    ${projectEntries(data, vis, accent)}`
      : ""
  }

  ${
    vis.certifications && (data.certifications || []).filter((c) => c).length
      ? `
    ${ST("Certifications")}
    ${certEntries(data, vis)}`
      : ""
  }

  ${
    vis.languages && (data.languages || []).filter((l) => l.name).length
      ? `
    ${ST("Languages")}
    ${langEntries(data, vis, accent)}`
      : ""
  }
</div>`;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 3: EXECUTIVE (centered, ceremonial)
═══════════════════════════════════════════════════ */
function renderExecutive(data, vis, cssVars) {
  const accent = data.accentColor || "#d4852a";
  const ST = (label) => `
    <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:18px;font-weight:500;color:#111;text-align:center;letter-spacing:0.05em;margin:24px 0 14px;position:relative">
      <span style="background:white;padding:0 12px;position:relative;z-index:1">${label}</span>
      <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:#e5e5e5;z-index:0"></div>
    </div>`;
  return `
<div style="${cssVars};background:white;font-size:11.5px;color:#1a1a1a">
  <!-- Header -->
  <div style="padding:44px 48px 28px;text-align:center;border-bottom:3px solid ${accent}">
    ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:4px solid ${accent};margin:0 auto 16px;display:block" />` : ""}
    <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:40px;font-weight:500;letter-spacing:-0.5px;color:#111">${escapeHtml(data.name) || '<span style="opacity:0.2">Your Name</span>'}</div>
    ${data.title ? `<div style="font-size:12px;color:${accent};letter-spacing:0.2em;text-transform:uppercase;font-weight:400;margin-top:7px">${escapeHtml(data.title)}</div>` : ""}
    <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:20px;margin-top:14px;font-size:10.5px;color:#666">${contactItems(data)}</div>
  </div>

  <!-- Body -->
  <div style="padding:32px 48px">
    ${vis.summary && data.summary ? `${ST("Executive Summary")}<p style="font-size:11.5px;line-height:1.7;color:#444;text-align:center;max-width:600px;margin:0 auto">${escapeHtml(data.summary)}</p>` : ""}
    ${vis.experience && (data.experience || []).filter((j) => j.title || j.company).length ? `${ST("Professional Experience")}${experienceEntries(data, vis, accent)}` : ""}
    ${vis.skills && (data.skills || []).length ? `${ST("Core Competencies")}<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px">${renderSkillPills(data.skills, accent, "outline")}</div>` : ""}
    ${vis.education && (data.education || []).filter((e) => e.degree || e.school).length ? `${ST("Education")}${educationEntries(data, vis)}` : ""}
    ${vis.projects && (data.projects || []).filter((p) => p.name).length ? `${ST("Notable Projects")}${projectEntries(data, vis, accent)}` : ""}
    ${vis.certifications && (data.certifications || []).filter((c) => c).length ? `${ST("Certifications")}${certEntries(data, vis)}` : ""}
    ${
      vis.languages && (data.languages || []).filter((l) => l.name).length
        ? `${ST("Languages")}<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center">${(
            data.languages || []
          )
            .filter((l) => l.name)
            .map(
              (l) =>
                `<span style="font-size:11px;color:#444">${escapeHtml(l.name)} <span style="color:${accent};font-size:9.5px;font-weight:600">${escapeHtml(l.level)}</span></span>`,
            )
            .join("")}</div>`
        : ""
    }
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 4: CREATIVE (colored sidebar)
═══════════════════════════════════════════════════ */
function renderCreative(data, vis, cssVars) {
  const accent = data.accentColor || "#6c63ff";
  const SST = (label) =>
    `<div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);margin:16px 0 8px;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:4px">${label}</div>`;
  const MST = (label) =>
    `<div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:16px;font-weight:600;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin:22px 0 12px">${label}</div>`;
  return `
<div style="${cssVars};background:white;font-size:11.5px;color:#1a1a1a;display:grid;grid-template-columns:200px 1fr;min-height:1123px">
  <!-- Sidebar -->
  <div style="background:${accent};padding:36px 20px;color:white">
    ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid white;margin:0 auto 14px;display:block" />` : ""}
    <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:22px;font-weight:600;line-height:1.2;text-align:center;margin-bottom:4px">${escapeHtml(data.name) || "Your Name"}</div>
    ${data.title ? `<div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;text-align:center;opacity:0.85;margin-bottom:20px">${escapeHtml(data.title)}</div>` : ""}

    ${SST("Contact")}
    ${data.email ? `<div style="font-size:10px;opacity:0.9;margin-bottom:4px;line-height:1.5">${escapeHtml(data.email)}</div>` : ""}
    ${data.phone ? `<div style="font-size:10px;opacity:0.9;margin-bottom:4px">${escapeHtml(data.phone)}</div>` : ""}
    ${data.location ? `<div style="font-size:10px;opacity:0.9;margin-bottom:4px">${escapeHtml(data.location)}</div>` : ""}
    ${data.website ? `<div style="font-size:10px;opacity:0.9;margin-bottom:4px">${escapeHtml(data.website)}</div>` : ""}

    ${
      vis.skills && (data.skills || []).length
        ? `
      ${SST("Skills")}
      ${(data.skills || []).map((s) => `<div style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:500;border:1px solid rgba(255,255,255,0.4);color:white;margin:2px 2px 2px 0;">${escapeHtml(s)}</div>`).join("")}`
        : ""
    }

    ${
      vis.languages && (data.languages || []).filter((l) => l.name).length
        ? `
      ${SST("Languages")}
      ${(data.languages || [])
        .filter((l) => l.name)
        .map(
          (l) =>
            `<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;opacity:0.9"><span>${escapeHtml(l.name)}</span><span style="opacity:0.7">${escapeHtml(l.level)}</span></div>`,
        )
        .join("")}`
        : ""
    }

    ${
      vis.certifications && (data.certifications || []).filter((c) => c).length
        ? `
      ${SST("Certifications")}
      ${(data.certifications || [])
        .filter((c) => c)
        .map(
          (c) =>
            `<div style="font-size:10px;opacity:0.9;margin-bottom:4px;line-height:1.5">${escapeHtml(c)}</div>`,
        )
        .join("")}`
        : ""
    }
  </div>

  <!-- Main -->
  <div style="padding:32px 32px">
    ${
      vis.summary && data.summary
        ? `
      ${MST("About Me")}
      <p style="font-size:11.5px;line-height:1.7;color:#444">${escapeHtml(data.summary)}</p>`
        : ""
    }
    ${vis.experience && (data.experience || []).filter((j) => j.title || j.company).length ? `${MST("Experience")}${experienceEntries(data, vis, accent)}` : ""}
    ${vis.education && (data.education || []).filter((e) => e.degree || e.school).length ? `${MST("Education")}${educationEntries(data, vis)}` : ""}
    ${vis.projects && (data.projects || []).filter((p) => p.name).length ? `${MST("Projects")}${projectEntries(data, vis, accent)}` : ""}
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 5: ELEGANT (calligraphic, editorial)
═══════════════════════════════════════════════════ */
function renderElegant(data, vis, cssVars) {
  const accent = data.accentColor || "#c4956a";
  const DL = `<div style="display:flex;align-items:center;gap:10px;margin:16px 0"><div style="flex:1;height:1px;background:linear-gradient(to right,transparent,${accent},transparent);opacity:0.35"></div><div style="width:5px;height:5px;border-radius:50%;background:${accent};opacity:0.5"></div><div style="flex:1;height:1px;background:linear-gradient(to right,${accent},transparent);opacity:0.35"></div></div>`;
  const ST = (label) =>
    `<div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:18px;font-weight:400;color:#111;letter-spacing:2px;text-transform:uppercase;text-align:center;margin:22px 0 14px">${label}</div>${DL}`;
  return `
<div style="${cssVars};background:white;font-size:11.5px;color:#2c2c2c;padding:48px 52px">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #e8e0d4">
    ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid ${accent};margin:0 auto 12px;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.12)" />` : ""}
    <div style="font-family:'Cormorant Garamond','Georgia',serif;font-size:46px;font-weight:300;letter-spacing:3px;color:#111;line-height:1">${escapeHtml(data.name) || '<span style="opacity:0.2">Your Name</span>'}</div>
    ${data.title ? `<div style="font-size:10.5px;font-weight:500;letter-spacing:0.35em;text-transform:uppercase;color:${accent};margin-top:10px">${escapeHtml(data.title)}</div>` : ""}
    <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:20px;margin-top:12px;font-size:10.5px;color:#888">${contactItems(data)}</div>
  </div>
  ${DL}

  ${vis.summary && data.summary ? `${ST("Profile")}<p style="font-size:11.5px;line-height:1.75;color:#555;text-align:center;font-style:italic;max-width:580px;margin:0 auto">${escapeHtml(data.summary)}</p>` : ""}
  ${vis.experience && (data.experience || []).filter((j) => j.title || j.company).length ? `${ST("Experience")}${experienceEntries(data, vis, accent)}` : ""}
  ${vis.skills && (data.skills || []).length ? `${ST("Areas of Expertise")}<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:5px">${renderSkillPills(data.skills, accent, "soft")}</div>` : ""}
  ${vis.education && (data.education || []).filter((e) => e.degree || e.school).length ? `${ST("Education")}${educationEntries(data, vis)}` : ""}
  ${
    vis.projects && (data.projects || []).filter((p) => p.name).length
      ? `${ST("Portfolio")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${(
          data.projects || []
        )
          .filter((p) => p.name)
          .map(
            (proj) =>
              `<div style="padding:12px;border:1px solid #e8e0d4;border-radius:8px"><div style="font-weight:600;font-size:12px;color:#111">${escapeHtml(proj.name)}</div>${proj.tech ? `<div style="font-size:10px;color:${accent};margin:3px 0">${escapeHtml(proj.tech)}</div>` : ""}${proj.description ? `<div style="font-size:11px;color:#555;line-height:1.55">${escapeHtml(proj.description)}</div>` : ""}</div>`,
          )
          .join("")}</div>`
      : ""
  }
  ${vis.certifications && (data.certifications || []).filter((c) => c).length ? `${ST("Certifications")}${certEntries(data, vis)}` : ""}
  ${
    vis.languages && (data.languages || []).filter((l) => l.name).length
      ? `${ST("Languages")}<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:14px">${(
          data.languages || []
        )
          .filter((l) => l.name)
          .map(
            (l) =>
              `<span style="font-size:11px;color:#444">${escapeHtml(l.name)} <span style="color:${accent};font-size:9.5px;font-weight:500">${escapeHtml(l.level)}</span></span>`,
          )
          .join("")}</div>`
      : ""
  }
</div>`;
}

/* ═══════════════════════════════════════════════════
   TEMPLATE 6: TECH (developer-focused, dark header)
═══════════════════════════════════════════════════ */
function renderTech(data, vis, cssVars) {
  const accent = data.accentColor || "#58a6ff";
  const badge = (txt) =>
    `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(88,166,255,0.1);border:1px solid rgba(88,166,255,0.2);color:${accent};margin:2px 2px 2px 0;">${escapeHtml(txt)}</span>`;
  const MST = (label) =>
    `<div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${accent};background:rgba(88,166,255,0.07);padding:4px 10px;border-radius:4px;border-left:3px solid ${accent};margin:20px 0 12px;display:inline-block">${label}</div><br>`;
  const SST = (label) =>
    `<div style="font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${accent};margin:14px 0 7px;border-bottom:1px solid rgba(88,166,255,0.2);padding-bottom:3px">${label}</div>`;
  return `
<div style="${cssVars};background:white;font-size:11px;color:#1a1a1a">
  <!-- Header -->
  <div style="padding:32px 40px;background:#0d1117;color:white;display:flex;align-items:flex-start;gap:24px;border-bottom:3px solid ${accent}">
    ${data.photo ? `<img src="${escapeHtml(data.photo)}" style="width:68px;height:68px;border-radius:8px;object-fit:cover;border:2px solid ${accent};flex-shrink:0" />` : ""}
    <div>
      <div style="font-family:'DM Sans',sans-serif;font-size:28px;font-weight:700;color:white;letter-spacing:-0.5px">${escapeHtml(data.name) || '<span style="opacity:0.3">Your Name</span>'}</div>
      ${data.title ? `<div style="font-size:12px;color:${accent};font-weight:600;letter-spacing:0.08em;margin-top:4px">${escapeHtml(data.title)}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:10.5px;color:rgba(255,255,255,0.6)">
        ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ""}
        ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ""}
        ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ""}
        ${data.website ? `<span>${escapeHtml(data.website)}</span>` : ""}
      </div>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:28px 40px;display:grid;grid-template-columns:1fr 190px;gap:0">
    <!-- Main -->
    <div style="padding-right:28px;border-right:1px solid #f0f0f0">
      ${vis.summary && data.summary ? `${MST("// About")}<p style="font-size:11.5px;line-height:1.65;color:#444;margin-bottom:16px">${escapeHtml(data.summary)}</p>` : ""}
      ${vis.experience && (data.experience || []).filter((j) => j.title || j.company).length ? `${MST("// Experience")}${experienceEntries(data, vis, accent)}` : ""}
      ${
        vis.projects && (data.projects || []).filter((p) => p.name).length
          ? `${MST("// Projects")}${(data.projects || [])
              .filter((p) => p.name)
              .map(
                (proj) => `
        <div style="margin-bottom:14px">
          <div style="font-weight:700;font-size:12px;color:#111">${escapeHtml(proj.name)}${proj.link ? ` <span style="font-size:10px;color:${accent};font-weight:400">[${escapeHtml(proj.link)}]</span>` : ""}</div>
          ${
            proj.tech
              ? `<div style="margin:3px 0">${proj.tech
                  .split(",")
                  .map((t) => badge(t.trim()))
                  .join("")}</div>`
              : ""
          }
          ${proj.description ? `<div style="font-size:11px;color:#444;line-height:1.55">${escapeHtml(proj.description)}</div>` : ""}`,
              )
              .join("")}`
          : ""
      }
    </div>

    <!-- Sidebar -->
    <div style="padding-left:24px">
      ${
        vis.skills && (data.skills || []).length
          ? `
        ${SST("// Tech Stack")}
        <div>${(data.skills || []).map((s) => badge(s)).join("")}</div>`
          : ""
      }

      ${
        vis.education &&
        (data.education || []).filter((e) => e.degree || e.school).length
          ? `
        ${SST("// Education")}
        ${educationEntries(data, vis)}`
          : ""
      }

      ${
        vis.certifications &&
        (data.certifications || []).filter((c) => c).length
          ? `
        ${SST("// Certs")}
        ${(data.certifications || [])
          .filter((c) => c)
          .map(
            (c) =>
              `<div style="font-size:10.5px;color:#444;padding:3px 0;border-bottom:1px solid #f0f0f0">${escapeHtml(c)}</div>`,
          )
          .join("")}`
          : ""
      }

      ${
        vis.languages && (data.languages || []).filter((l) => l.name).length
          ? `
        ${SST("// Languages")}
        ${langEntries(data, vis, accent)}`
          : ""
      }
    </div>
  </div>
</div>`;
}
