import { readLocalAttachment } from '@/features/mentorship/utils/read-local-attachment';
import { supabase } from '@/services/supabase/client';
import type { MentorshipMessageAttachmentType } from '@/types/domain/mentorship';

const BUCKET = 'mentorship-attachments';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
}

function extensionFromMime(mimeType: string, fileName?: string): string {
  if (fileName?.includes('.')) {
    return fileName.split('.').pop()!.toLowerCase();
  }
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'text/plain': 'txt',
  };
  return map[mimeType] ?? 'bin';
}

export type UploadMentorshipAttachmentInput = {
  userId: string;
  mentorshipId: string;
  localUri: string;
  attachmentType: MentorshipMessageAttachmentType;
  mimeType?: string;
  fileName?: string;
  maxBytes: number;
};

export const mentorshipAttachmentApi = {
  uploadFromUri: async (
    input: UploadMentorshipAttachmentInput,
  ): Promise<{ publicUrl: string | null; fileName: string; error: Error | null }> => {
    const { userId, mentorshipId, localUri, attachmentType, mimeType, fileName, maxBytes } =
      input;

    try {
      if (!mentorshipId?.trim()) {
        return { publicUrl: null, fileName: fileName ?? 'file', error: new Error('No active mentorship') };
      }

      const { data } = await readLocalAttachment(localUri, maxBytes);
      const safeName = sanitizeFileName(fileName ?? (attachmentType === 'image' ? 'photo.jpg' : 'document'));
      const ext = extensionFromMime(mimeType ?? 'application/octet-stream', safeName);
      const path = `${userId}/${mentorshipId}/${Date.now()}_${safeName.replace(/\.[^.]+$/, '')}.${ext}`;
      const contentType = mimeType ?? (attachmentType === 'image' ? 'image/jpeg' : 'application/octet-stream');

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, data, {
        upsert: false,
        contentType,
      });

      if (uploadError) {
        const message =
          uploadError.message?.includes('Bucket not found')
            ? 'File storage is not configured. Apply database migration 017 on Supabase.'
            : uploadError.message;
        return { publicUrl: null, fileName: safeName, error: new Error(message) };
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return {
        publicUrl: urlData.publicUrl,
        fileName: safeName,
        error: null,
      };
    } catch (e) {
      return {
        publicUrl: null,
        fileName: fileName ?? 'file',
        error: e instanceof Error ? e : new Error('Failed to upload attachment'),
      };
    }
  },
};
