/** Recommended chat attachment limits (mobile-friendly, Supabase-compatible). */
export const MENTORSHIP_ATTACHMENT_LIMITS = {
  /** Photos from camera or library */
  imageMaxBytes: 10 * 1024 * 1024, // 10 MB
  /** PDF, Excel, Word, and other documents */
  fileMaxBytes: 25 * 1024 * 1024, // 25 MB
} as const;

export function formatMaxAttachmentSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export const MENTORSHIP_ATTACHMENT_SIZE_HINT = `Photos up to ${formatMaxAttachmentSize(MENTORSHIP_ATTACHMENT_LIMITS.imageMaxBytes)}, files up to ${formatMaxAttachmentSize(MENTORSHIP_ATTACHMENT_LIMITS.fileMaxBytes)}`;
