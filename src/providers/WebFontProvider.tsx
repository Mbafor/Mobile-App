import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';



/**
 * Loads Inter on web only. Native platforms skip font loading entirely.
 */
export function WebFontProvider({ children }: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
}
