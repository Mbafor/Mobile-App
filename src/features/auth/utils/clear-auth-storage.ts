import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function isAuthStorageKey(key: string): boolean {
  return key.includes('auth-token') || key.startsWith('sb-') || key.includes('supabase.auth');
}

/** Removes persisted Supabase session keys so logout cannot re-hydrate. */
export async function clearSupabaseAuthStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(isAuthStorageKey);
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }

    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const webKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && isAuthStorageKey(key)) {
          webKeys.push(key);
        }
      }
      webKeys.forEach((key) => localStorage.removeItem(key));
    }
  } catch (e) {
    console.warn('[clearSupabaseAuthStorage]', e);
  }
}
