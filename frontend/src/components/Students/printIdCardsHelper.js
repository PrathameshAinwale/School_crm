/**
 * Utility to reliably print student ID cards with high visual fidelity,
 * photo on left side, details on right side, in a 2-column A4 grid.
 */

export function generateIdCardsHtml(students, options = {}) {
  const {
    schoolName = 'ARCH CAMPUS',
    schoolTagline = 'School of Excellence & Learning',
    academicYear = '2024 - 2025',
    title = 'Student Identity Cards',
  } = options;

  const cardsHtml = (students || []).map((student) => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Name';
    const rollNo = student.roll_number || 'N/A';
    const className = student.school_class?.name || (student.school_class_id ? (typeof student.school_class_id === 'string' ? student.school_class_id : `Class ${student.school_class_id}`) : 'Class 10');
    const sectionName = student.section?.name || student.section_id || 'A';
    const admissionNo = student.admission_number || `ADM-${student.id || '001'}`;
    const bloodGroup = student.blood_group || 'O+';
    const dob = student.date_of_birth
      ? new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';
    const parentName = student.father_name || student.guardian_name || student.mother_name || 'Parent / Guardian';
    const phone = student.guardian_phone || student.emergency_contact || 'N/A';
    const address = student.address || 'Campus Residential, Pune, MH';
    const initials = `${student.first_name?.[0] || 'S'}${student.last_name?.[0] || ''}`.toUpperCase();

    const photoContent = student.photo_url || student.avatar
      ? `<img src="${student.photo_url || student.avatar}" alt="${fullName}" />`
      : `<div class="avatar-circle">${initials}</div><span class="photo-txt">PHOTO</span>`;

    // Simulated barcode lines
    const barcodeWidths = [1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1];
    const barcodeHtml = barcodeWidths
      .map((w) => `<div class="bar-line" style="width:${w}px"></div>`)
      .join('');

    return `
      <div class="id-card">
        <!-- Header -->
        <div class="card-header">
          <div class="header-left">
            <div class="school-logo">🎓</div>
            <div class="school-text">
              <div class="school-name">${schoolName}</div>
              <div class="school-sub">${schoolTagline}</div>
            </div>
          </div>
          <div class="header-right">
            <div class="card-badge">STUDENT I-CARD</div>
            <div class="academic-year">${academicYear}</div>
          </div>
        </div>

        <!-- Body: Photo on Left, Details on Right -->
        <div class="card-body">
          <!-- Left Column: Photo & Badges -->
          <div class="left-col">
            <div class="photo-frame">
              ${photoContent}
              <div class="student-banner">STUDENT</div>
            </div>
            <div class="blood-group">
              <span class="blood-icon">🩸</span>
              <span>Blood: ${bloodGroup}</span>
            </div>
            <div class="barcode-box">
              <div class="barcode-lines">${barcodeHtml}</div>
              <div class="barcode-text">${admissionNo}</div>
            </div>
          </div>

          <!-- Right Column: Student Details -->
          <div class="right-col">
            <div class="student-title">${fullName}</div>
            <div class="pills-row">
              <span class="pill-class">${className} (${sectionName})</span>
              <span class="pill-roll">Roll: ${rollNo}</span>
            </div>

            <table class="details-table">
              <tr>
                <td class="dt-label">Adm No:</td>
                <td class="dt-value mono">${admissionNo}</td>
              </tr>
              <tr>
                <td class="dt-label">DOB:</td>
                <td class="dt-value">${dob}</td>
              </tr>
              <tr>
                <td class="dt-label">Parent:</td>
                <td class="dt-value">${parentName}</td>
              </tr>
              <tr>
                <td class="dt-label">Mobile:</td>
                <td class="dt-value mono contact">${phone}</td>
              </tr>
              <tr>
                <td class="dt-label">Address:</td>
                <td class="dt-value addr">${address}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <div class="footer-contact">
            <span class="fc-label">Helpline:</span>
            <span class="fc-val">${phone !== 'N/A' ? phone : '+91 98201 11223'}</span>
          </div>
          <div class="footer-sign">
            <div class="sign-line"></div>
            <div class="sign-text">Principal Signature</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title} - ${schoolName}</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #ffffff;
          color: #1e293b;
          padding: 8mm 6mm;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page {
          size: A4 portrait;
          margin: 8mm 6mm;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 7mm 5mm;
          width: 100%;
        }
        .id-card {
          width: 100%;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          page-break-inside: avoid;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          margin-bottom: 2mm;
        }
        .card-header {
          background: #065f46;
          background: linear-gradient(135deg, #047857 0%, #065f46 60%, #134e4a 100%);
          color: #ffffff;
          padding: 8px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .school-logo {
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.22);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
        .school-name {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .school-sub {
          font-size: 7.5px;
          color: #a7f3d0;
          font-weight: 500;
        }
        .header-right {
          text-align: right;
        }
        .card-badge {
          background: #ffffff;
          color: #064e3b;
          font-size: 8px;
          font-weight: 900;
          padding: 2px 7px;
          border-radius: 10px;
          text-transform: uppercase;
          display: inline-block;
          letter-spacing: 0.4px;
        }
        .academic-year {
          font-size: 7.5px;
          color: #a7f3d0;
          font-weight: 700;
          margin-top: 1px;
        }
        .card-body {
          display: flex;
          gap: 10px;
          padding: 10px;
          flex: 1;
          background: #ffffff;
        }
        .left-col {
          width: 88px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .photo-frame {
          width: 84px;
          height: 102px;
          border: 1.5px solid #059669;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-circle {
          width: 44px;
          height: 44px;
          background: #d1fae5;
          color: #047857;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
        }
        .photo-txt {
          font-size: 8px;
          color: #64748b;
          font-weight: 700;
          margin-top: 3px;
        }
        .student-banner {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #047857;
          color: #ffffff;
          font-size: 7.5px;
          font-weight: 800;
          text-align: center;
          padding: 2px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .blood-group {
          margin-top: 5px;
          width: 100%;
          text-align: center;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #e11d48;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 0;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }
        .blood-icon {
          font-size: 8px;
        }
        .barcode-box {
          margin-top: 4px;
          width: 100%;
          text-align: center;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px;
          background: #ffffff;
        }
        .barcode-lines {
          height: 13px;
          display: flex;
          justify-content: center;
          align-items: stretch;
          gap: 1.5px;
          overflow: hidden;
        }
        .bar-line {
          background: #1e293b;
        }
        .barcode-text {
          font-family: monospace;
          font-size: 7px;
          font-weight: 700;
          color: #475569;
          margin-top: 1px;
        }
        .right-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .student-title {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pills-row {
          display: flex;
          gap: 5px;
          margin-top: 3px;
          margin-bottom: 5px;
          flex-wrap: wrap;
        }
        .pill-class {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          padding: 1.5px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
        }
        .pill-roll {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 1.5px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          color: #334155;
        }
        .details-table tr {
          margin-bottom: 2px;
        }
        .dt-label {
          width: 52px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 8px;
          padding: 1.5px 0;
          vertical-align: top;
        }
        .dt-value {
          font-weight: 700;
          color: #0f172a;
          padding: 1.5px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
        .dt-value.mono {
          font-family: monospace;
        }
        .dt-value.contact {
          color: #065f46;
        }
        .dt-value.addr {
          font-size: 8px;
          font-weight: 500;
          color: #475569;
          white-space: normal;
          line-height: 1.25;
        }
        .card-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 5px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7.5px;
          color: #64748b;
        }
        .fc-label {
          font-weight: 600;
        }
        .fc-val {
          font-family: monospace;
          color: #334155;
        }
        .footer-sign {
          text-align: right;
        }
        .sign-line {
          width: 60px;
          border-bottom: 1px solid #94a3b8;
          margin-bottom: 2px;
          margin-left: auto;
        }
        .sign-text {
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
        }
      </style>
    </head>
    <body>
      <div class="cards-grid">
        ${cardsHtml}
      </div>
    </body>
    </html>
  `;
}

/**
 * Direct print function using an isolated hidden iframe.
 * Fallbacks to popup window if iframe printing is restricted.
 */
export function printIdCardsDirectly(students, options = {}) {
  if (!students || students.length === 0) return;

  const html = generateIdCardsHtml(students, options);

  // Remove existing print iframe if any
  const existingIframe = document.getElementById('id-cards-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'id-cards-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Trigger print after resources settle
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  } catch (err) {
    console.warn('Iframe print error, falling back to popup window:', err);
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 250);
    }
  }
}
