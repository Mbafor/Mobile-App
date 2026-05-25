import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type CVProTipCardProps = {
  tip: string;
  onViewTips: () => void;
};

export function CVProTipCard({ tip, onViewTips }: CVProTipCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="bulb-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Pro Tip</Text>
        <Text muted variant="caption" style={styles.tip}>
          {tip}
        </Text>
      </View>
      <Pressable onPress={onViewTips} style={styles.btn}>
        <Text style={styles.btnText}>View Tips</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tip: { lineHeight: 17 },
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  btnText: { color: colors.background, fontWeight: '700', fontSize: 12 },
});
