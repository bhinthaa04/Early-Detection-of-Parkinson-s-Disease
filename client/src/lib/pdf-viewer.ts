function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function openPdfInEmbedWindow(pdfUrl: string, title = "Report"): void {
  if (typeof window === "undefined") return;

  const popup = window.open("", "_blank");
  if (!popup) {
    window.open(pdfUrl, "_blank");
    return;
  }

  const safeUrl = escapeHtmlAttribute(pdfUrl);
  const safeTitle = escapeHtmlAttribute(title);

  popup.document.open();
  popup.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
      }
      embed {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <embed name="report-viewer" src="${safeUrl}" type="application/pdf" />
  </body>
</html>`);
  popup.document.close();
}
