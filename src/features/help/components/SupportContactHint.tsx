import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

export function SupportContactHint() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Text muted variant="caption" style={styles.hint}>
      {t('help.contactHint.prefix')}
      <Text
        variant="caption"
        style={styles.link}
        onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as Href)}
      >
        {t('help.title')}
      </Text>
      {t('help.contactHint.suffix')}
    </Text>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  hint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
}
