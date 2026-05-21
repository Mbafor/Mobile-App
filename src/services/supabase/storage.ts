import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Supabase Auth storage adapter — persists session across app restarts.
 */
export const supabaseStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
