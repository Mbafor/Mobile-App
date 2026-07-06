import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PageHeader } from '@/components/layout/PageHeader';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export function PrivacyScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.root}>
      <PageHeader title="Privacy" onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PrivacySection />
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      padding: spacing.lg,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
  });
}
