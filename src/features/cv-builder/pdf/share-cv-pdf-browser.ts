/** Browser download from a blob/object URL. */
export async function shareCvPdfInBrowser(
  uri: string,
  fileName: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    const link = document.createElement('a');
    link.href = uri;
    link.download = safeName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      if (uri.startsWith('blob:')) {
        URL.revokeObjectURL(uri);
      }
    }, 60_000);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to download PDF';
    return { ok: false, error: message };
  }
}

