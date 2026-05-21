import { supabase } from '@/services/supabase/client';

const BUCKET = 'avatars';

function avatarPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export const avatarApi = {
  uploadFromUri: async (userId: string, localUri: string): Promise<{ publicUrl: string | null; error: Error | null }> => {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const path = avatarPath(userId);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        return { publicUrl: null, error: uploadError };
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (profileError) {
        return { publicUrl: null, error: profileError };
      }

      return { publicUrl, error: null };
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to upload avatar');
      return { publicUrl: null, error };
    }
  },
};
