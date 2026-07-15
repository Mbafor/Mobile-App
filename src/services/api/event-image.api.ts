import * as Crypto from 'expo-crypto';

import { supabase } from '@/services/supabase/client';

const BUCKET = 'event-images';

function fileNameFromUri(localUri: string): string {
  const withoutQuery = localUri.split('?')[0] ?? localUri;
  const segments = withoutQuery.split('/');
  const last = segments[segments.length - 1];
  return last && last.length > 0 ? last : 'image.jpg';
}

function eventImagePath(userId: string, localUri: string): string {
  return `${userId}/${Crypto.randomUUID()}-${fileNameFromUri(localUri)}`;
}

export const eventImageApi = {
  uploadFromUri: async (
    userId: string,
    localUri: string,
  ): Promise<{ publicUrl: string | null; error: Error | null }> => {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const path = eventImagePath(userId, localUri);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type || 'image/jpeg',
        });

      if (uploadError) {
        return { publicUrl: null, error: uploadError };
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { publicUrl: data.publicUrl, error: null };
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to upload event image');
      return { publicUrl: null, error };
    }
  },
};
