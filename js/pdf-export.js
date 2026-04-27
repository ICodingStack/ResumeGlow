/**
 * ResumeGlow — js/pdf-export.js
 * High-quality PDF export using html2canvas + jsPDF.
 * Produces a pixel-perfect A4 PDF of the live preview.
 */

/**
 * Export the resume preview to a PDF file.
 * @param {string} fileName - desired filename (without .pdf)
 * @returns {Promise<void>}
 */
async function exportResumePDF(fileName = 'resume') {
  const previewEl = document.getElementById('resume-preview');
  if (!previewEl) {
    throw new Error('Resume preview element not found.');
  }

  // Temporarily expand for full render (no scroll clipping)
  const originalStyle = previewEl.style.cssText;
  previewEl.style.width = '794px';
  previewEl.style.minHeight = '1123px';
  previewEl.style.overflow = 'visible';

  try {
    // Render to canvas at 2× scale for retina quality
    const canvas = await html2canvas(previewEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: Math.max(1123, previewEl.scrollHeight),
      windowWidth: 794,
      onclone: (clonedDoc) => {
        // Ensure fonts are applied in clone
        const style = clonedDoc.createElement('style');
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    // A4 dimensions in mm
    const A4_W = 210;
    const A4_H = 297;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // Calculate px per mm
    const pxPerMm = canvasW / A4_W;
    const totalHeightMm = canvasH / pxPerMm;

    if (totalHeightMm <= A4_H) {
      // Single page
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, totalHeightMm, '', 'FAST');
    } else {
      // Multi-page: slice canvas into A4-height chunks
      let pagesMade = 0;
      let yOffset = 0; // in canvas pixels

      const pageHeightPx = A4_H * pxPerMm;

      while (yOffset < canvasH) {
        const sliceH = Math.min(pageHeightPx, canvasH - yOffset);

        // Create a slice canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasW;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, -yOffset);

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = (sliceH / pxPerMm);

        if (pagesMade > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', 0, 0, A4_W, sliceHeightMm, '', 'FAST');

        yOffset += pageHeightPx;
        pagesMade++;
      }
    }

    // Save the PDF
    const safeFileName = (fileName || 'resume').replace(/[^a-z0-9_\-\s]/gi, '_').trim() || 'resume';
    pdf.save(`${safeFileName}.pdf`);

  } finally {
    // Restore original styles
    previewEl.style.cssText = originalStyle;
  }
}

/**
 * Generate a suggested filename from resume data.
 * @param {Object} data - resume data
 * @returns {string}
 */
function suggestFileName(data) {
  const name = (data.name || 'Resume').replace(/\s+/g, '_');
  const title = (data.title || '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
  const year = new Date().getFullYear();
  if (title) {
    return `${name}_${title}_${year}`;
  }
  return `${name}_Resume_${year}`;
}
