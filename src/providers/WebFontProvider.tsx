import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

/**
 * Loads Inter on web only. Native platforms skip font loading entirely.
 */
export function WebFontProvider({ children }: PropsWithChildren) {
  if (Platform.OS !== 'web') {
    return children;
  }

  return <WebFontLoader>{children}</WebFontLoader>;
}

function WebFontLoader({ children }: PropsWithChildren) {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loaded && !error) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
