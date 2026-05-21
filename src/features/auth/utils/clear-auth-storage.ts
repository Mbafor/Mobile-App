import AsyncStorage from '@react-native-async-storage/async-storage';

/** Removes persisted Supabase session keys so logout cannot re-hydrate. */
export async function clearSupabaseAuthStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(
      (key) => key.includes('auth-token') || key.startsWith('sb-') || key.includes('supabase.auth'),
    );
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
    }
  } catch (e) {
    console.warn('[clearSupabaseAuthStorage]', e);
  }
}
