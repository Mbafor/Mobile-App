import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export function PrivacySection() {
  return (
    <View style={styles.wrap}>
      <Text muted style={styles.intro}>
        Control how your data is used and kept safe.
      </Text>
      <Text style={styles.body}>
        We protect your profile, preferences, and activity. Review the guidance below or contact
        support for data requests.
      </Text>
      <Text muted style={styles.note}>
        To delete your account or request a data export, contact support from Help & FAQ.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  intro: { lineHeight: 22 },
  body: { lineHeight: 22, color: colors.text },
  note: { marginTop: spacing.xs, lineHeight: 20 },
});
