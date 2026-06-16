import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function SupportContactHint() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as import('expo-router').Href)}
      style={({ pressed }) => [styles.container, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}12` }]}>
        <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
      </View>
      <Text style={[styles.text, { color: colors.textMuted }]}>
        Need help?{' '}
        <Text style={[styles.link, { color: colors.primary }]}>
          Visit Help & Support
        </Text>
      </Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
