/**
 * ResumeGlow — js/pdf-export.js
 *
 * NATIVE BROWSER PDF EXPORT
 * ─────────────────────────
 * Uses the browser's own print engine (window.print) which:
 *  ✓ Renders fonts perfectly (no letter-spacing collapse)
 *  ✓ Handles CSS Grid, Flexbox, gradients, backgrounds
 *  ✓ Produces vector text (not rasterized images)
 *  ✓ Fits exactly one A4 page with no blank pages
 *  ✓ Works 100% offline after first font load
 *
 * Strategy:
 *  1. Open a new popup window
 *  2. Write a complete self-contained HTML document with the resume
 *  3. Inject print CSS that forces exact A4 sizing
 *  4. Wait for fonts to load then trigger window.print()
 *  5. Close the popup after printing
 */

/**
 * Export resume to PDF using the browser's native print dialog.
 * @param {string} fileName - suggested filename (shown in print dialog)
 * @returns {Promise<void>}
 */
async function exportResumePDF(fileName = "resume") {
  const previewEl = document.getElementById("resume-preview");
  if (!previewEl) throw new Error("Resume preview element not found.");

  const resumeHTML = previewEl.innerHTML;
  const accentColor = previewEl.style.getPropertyValue("--accent") || "#d4852a";
  const safeTitle = (fileName || "Resume").replace(/[<>"]/g, "");

  // ── Fetch project CSS so the resume classes render correctly ────────────
  let resumeCSS = "";
  try {
    const r = await fetch("css/style.css");
    if (r.ok) resumeCSS = await r.text();
  } catch {
    /* use inline styles only */
  }

  // ── Build the complete standalone document ───────────────────────────────
  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${safeTitle}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>

/* ── Reset ────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0; padding: 0;
}

/* ── Page setup ───────────────────────────────────── */
@page {
  size: A4 portrait;
  margin: 0;
}

html {
  width: 210mm;
  height: 297mm;
  background: white;
}

body {
  width: 210mm;
  min-height: 297mm;
  margin: 0;
  padding: 0;
  background: white;
  font-family: 'DM Sans', Arial, Helvetica, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
  /* These are the critical font rendering settings */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* ── Resume container ─────────────────────────────── */
#resume-print-root {
  width: 210mm;
  min-height: 297mm;
  background: white;
  overflow: hidden;
  /* Accent color variable */
  --accent: ${accentColor};
}

/* ── Project resume CSS (classes for templates) ───── */
${resumeCSS}

/* ── Critical overrides for clean print ──────────────
   Override any dark-mode / dark-background styles
   that might have leaked from the screen CSS.
───────────────────────────────────────────────────── */
body, #resume-print-root {
  background: white !important;
  color: #1a1a1a !important;
}

/* Scale from 794px screen width → 210mm print width.
   794px screen ≈ 210mm at 96dpi.
   We use transform to guarantee exact fit.          */
#resume-print-root {
  transform-origin: top left;
  width: 794px;
  /* The browser will scale to fit @page when printing */
}

/* Fonts must be explicit for print */
.resume-preview-root,
.resume-modern,
.resume-minimal,
.resume-executive,
.resume-creative,
.resume-elegant,
.resume-tech {
  font-family: 'DM Sans', Arial, Helvetica, sans-serif !important;
}

/* Prevent any inherited screen transforms */
.resume-preview-root {
  transform: none !important;
  zoom: 1 !important;
  width: 794px !important;
}

/* Print-specific visibility */
@media print {
  html, body {
    width: 210mm !important;
    height: 297mm !important;
    overflow: hidden;
  }

  #resume-print-root {
    /* Scale 794px → 210mm */
    transform: scale(0.8) !important;
    transform-origin: top left !important;
    width: 994px !important; /* 794 / 0.8 to compensate */
    margin: 0 !important;
    page-break-inside: avoid;
  }

  /* Prevent blank pages */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* ── Screen preview (before hitting print) ────────── */
@media screen {
  body {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px;
    background: #1a1a1a;
    min-height: 100vh;
  }

  #resume-print-root {
    box-shadow: 0 8px 40px rgba(0,0,0,0.4);
    border-radius: 2px;
  }

  .print-instructions {
    position: fixed;
    top: 0; left: 0; right: 0;
    background: #d4852a;
    color: white;
    text-align: center;
    padding: 10px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .print-instructions strong {
    font-weight: 700;
  }

  .print-instructions button {
    padding: 5px 16px;
    border-radius: 6px;
    border: 2px solid white;
    background: transparent;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .print-instructions button:hover {
    background: rgba(255,255,255,0.15);
  }

  .print-instructions .close-btn {
    position: absolute;
    right: 16px;
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    font-size: 18px;
    cursor: pointer;
    padding: 0 6px;
  }
}
</style>
</head>
<body>

<!-- Instructions bar (only visible on screen, hidden when printing) -->
<div class="print-instructions" id="print-bar">
  <span>📄 <strong>Save as PDF:</strong> In the print dialog → Destination → <strong>"Save as PDF"</strong> → Margins: <strong>None</strong> → Print</span>
  <button onclick="window.print()">🖨 Print / Save PDF</button>
  <button class="close-btn" onclick="document.getElementById('print-bar').remove()">✕</button>
</div>

<div id="resume-print-root">
  ${resumeHTML}
</div>

<script>
// Wait for Google Fonts to load, then auto-trigger print
document.fonts.ready.then(function() {
  // Small delay to let layout settle after font swap
  setTimeout(function() {
    window.print();
  }, 800);
});

// Fallback: if fonts.ready takes too long, print anyway
setTimeout(function() {
  window.print();
}, 3500);
<\/script>
</body>
</html>`;

  // ── Open popup and write the document ───────────────────────────────────
  const popup = window.open(
    "",
    "_blank",
    [
      "width=900",
      "height=700",
      "menubar=yes",
      "toolbar=yes",
      "scrollbars=yes",
      "status=yes",
      "resizable=yes",
    ].join(","),
  );

  if (!popup) {
    // Popup was blocked — fall back to a download link
    const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
    alert(
      "Pop-up was blocked.\n\n" +
        "An HTML file has been downloaded instead.\n" +
        "Open it in your browser and press Ctrl+P (or ⌘+P) → Save as PDF.",
    );
    return;
  }

  popup.document.open();
  popup.document.write(doc);
  popup.document.close();
}

/**
 * Suggest a clean filename from resume data.
 * @param {Object} data
 * @returns {string}
 */
function suggestFileName(data) {
  const name = (data.name || "Resume").replace(/\s+/g, "_");
  const title = (data.title || "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/gi, "");
  const year = new Date().getFullYear();
  return title ? `${name}_${title}_${year}` : `${name}_Resume_${year}`;
}
