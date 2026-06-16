import type { PropsWithChildren } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { getWebFontStyle, webCardShadow } from '@/constants/theme/webTheme';

const CARD_MAX_WIDTH = 560;
const PAGE_PADDING_H = 24;

/**
 * Responsive shell for all three onboarding steps.
 *
 * Mobile  → SafeAreaView, white background, standard horizontal padding.
 * Web     → ScrollView page (so tall forms are never cropped), centred white
 *           card with an explicit pixel width (so it never stretches full-screen).
 */
export function OnboardingShell({ children }: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.nativeInner}>{children}</View>
      </SafeAreaView>
    );
  }

  // Explicit pixel width avoids the RN-Web quirk where `width:'100%'` with
  // `alignItems:'center'` on the parent ignores `maxWidth`.
  const cardWidth = Math.min(windowWidth - PAGE_PADDING_H * 2, CARD_MAX_WIDTH);

  return (
    <ScrollView
      style={styles.webScroll}
      contentContainerStyle={styles.webContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.webCard, { width: cardWidth }]}>
        {/* Brand mark */}
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>O</Text>
          </View>
          <Text style={[styles.brandName, getWebFontStyle('bold')]}>Voila</Text>
        </View>

        {children}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  /* ── Native ─────────────────────────────── */
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nativeInner: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  /* ── Web scroll container ───────────────── */
  webScroll: {
    flex: 1,
    backgroundColor: '#F4F7F5',
  },
  webContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: PAGE_PADDING_H,
  },

  /* ── Web card ───────────────────────────── */
  webCard: {
    // width is set inline via cardWidth — avoids RN-Web maxWidth quirk
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 36,
    paddingVertical: 40,
    ...webCardShadow,
  },

  /* ── Brand inside card ──────────────────── */
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg + spacing.sm,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#0F2018',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#8BC99A',
    fontSize: 16,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
});
}
