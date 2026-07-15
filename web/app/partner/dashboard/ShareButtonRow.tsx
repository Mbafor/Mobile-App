'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { shareToWhatsApp, shareToFacebook, shareToLinkedIn, copyToClipboard } from '@/lib/share-actions';

/** Shared WhatsApp/Facebook/LinkedIn/Copy button row -- text is the full message
 * (used for WhatsApp + copy), link is the URL shared to Facebook/LinkedIn. */
export function ShareButtonRow({ text, link }: { text: string; link: string }) {
  const t = useTranslations('Partner.share');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => shareToWhatsApp(text)}
        className="rounded-md bg-[#25D366] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        {t('whatsapp')}
      </button>
      <button
        type="button"
        onClick={() => shareToFacebook(link)}
        className="rounded-md bg-[#1877F2] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        {t('facebook')}
      </button>
      <button
        type="button"
        onClick={() => shareToLinkedIn(link)}
        className="rounded-md bg-[#0A66C2] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        {t('linkedin')}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)] transition"
      >
        {copied ? t('copied') : t('copy')}
      </button>
    </div>
  );
}
