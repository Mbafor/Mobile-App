/** Standalone HTML document shell for PDF export — no app UI, print-ready A4 layout. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BASE_PRINT_STYLES = `
  @page {
    size: A4;
    margin: 14mm 12mm;
  }
  html, body {
    width: 100%;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1f2937;
    font-size: 10.5pt;
    line-height: 1.35;
  }
  .page {
    width: 100%;
    max-width: 100%;
    background: #fff;
    padding: 0;
  }
  .section { margin-bottom: 10px; page-break-inside: avoid; }
  .section-title {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    border-bottom: 0.5px solid #1f2937;
    padding-bottom: 2px;
    page-break-after: avoid;
  }
  .row-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2px;
    page-break-inside: avoid;
  }
  .row-left { flex: 1; padding-right: 10px; }
  .row-title { font-weight: 700; font-size: 11pt; }
  .row-sub { font-style: italic; font-size: 11pt; }
  .row-date {
    font-weight: 700;
    font-size: 10pt;
    text-align: right;
    min-width: 72px;
    white-space: nowrap;
  }
  .item-block { margin-bottom: 6px; page-break-inside: avoid; }
  .bullets { margin: 2px 0 0 14px; padding: 0; }
  .bullets li { margin-bottom: 1px; font-size: 10.5pt; }
  .body { font-size: 10.5pt; line-height: 1.35; }
  .skill-row { display: flex; margin-bottom: 2px; }
  .skill-label { width: 72px; font-weight: 700; flex-shrink: 0; }
  .cert-line { margin-bottom: 3px; }
  .tech-line { font-style: italic; font-size: 9.5pt; margin-top: 2px; }
  .link { font-size: 9pt; margin-top: 2px; word-break: break-all; }
  .ref-name { font-weight: 700; }
  .ref-sub { font-style: italic; }
  .summary { text-align: justify; }
`;

export function wrapHtmlDocument(title: string, templateStyles: string, body: string): string {
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    ${BASE_PRINT_STYLES}
    ${templateStyles}
  </style>
</head>
<body>${body}</body>
</html>`;
}
