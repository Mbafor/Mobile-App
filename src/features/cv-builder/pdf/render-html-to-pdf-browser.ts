import html2pdfImport from 'html2pdf.js';

const IFRAME_WIDTH_PX = 794;
const LOAD_TIMEOUT_MS = 25_000;

type Html2PdfFactory = () => {
  set(options: Record<string, unknown>): ReturnType<Html2PdfFactory>;
  from(element: HTMLElement): ReturnType<Html2PdfFactory>;
  outputPdf(type: 'blob'): Promise<Blob>;
};

function getHtml2Pdf(): Html2PdfFactory {
  const mod = html2pdfImport as unknown as Html2PdfFactory | { default: Html2PdfFactory };
  if (typeof mod === 'function') {
    return mod;
  }
  if (mod && typeof mod.default === 'function') {
    return mod.default;
  }
  throw new Error('PDF library failed to load in the browser.');
}

function mountHiddenIframe(html: string): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'CV PDF export');
    iframe.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      `width:${IFRAME_WIDTH_PX}px`,
      'height:1123px',
      'border:none',
      'visibility:hidden',
      'pointer-events:none',
    ].join(';');

    const timeout = window.setTimeout(() => {
      iframe.remove();
      reject(new Error('PDF preparation timed out. Try again or use the mobile app.'));
    }, LOAD_TIMEOUT_MS);

    iframe.onload = () => {
      window.clearTimeout(timeout);
      resolve(iframe);
    };

    iframe.onerror = () => {
      window.clearTimeout(timeout);
      iframe.remove();
      reject(new Error('Failed to load CV document for PDF export.'));
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

async function waitForDocumentReady(doc: Document): Promise<void> {
  if (doc.fonts?.ready) {
    await doc.fonts.ready.catch(() => undefined);
  }

  const images = Array.from(doc.images);
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Browser-only PDF renderer. Uses html2pdf.js (canvas → PDF blob).
 * Never calls window.print() — that triggers Chrome print-preview Trusted Types errors.
 */
export async function renderHtmlToPdfInBrowser(html: string): Promise<string> {
  const iframe = await mountHiddenIframe(html);

  try {
    const doc = iframe.contentDocument;
    if (!doc?.body) {
      throw new Error('Could not access CV document for PDF export.');
    }

    await waitForDocumentReady(doc);

    const target = doc.querySelector('.page') ?? doc.body;
    const html2pdf = getHtml2Pdf();

    const pdfOptions = {
      margin: [14, 12, 14, 12] as [number, number, number, number],
      filename: 'cv.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        width: IFRAME_WIDTH_PX,
        windowWidth: IFRAME_WIDTH_PX,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    const blob = await html2pdf()
      .set(pdfOptions)
      .from(target as HTMLElement)
      .outputPdf('blob');

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error('PDF generation produced an empty file.');
    }

    return URL.createObjectURL(blob);
  } finally {
    iframe.remove();
  }
}
