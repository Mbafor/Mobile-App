import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useMainTabNavItems } from '@/features/navigation/hooks/useMainTabNavItems';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const tabNavItems = useMainTabNavItems();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Text variant="title">Olives Forum</Text>
      </View>

      <Text style={styles.sectionLabel}>App</Text>
      {tabNavItems.map((item) => (
        <Pressable
          key={item.key}
          style={[styles.item, item.active && styles.itemActive]}
          onPress={() => {
            props.navigation.closeDrawer();
            item.onPress();
          }}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.active ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.itemText, item.active && styles.itemTextActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  brand: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  brandHint: { fontSize: 13, lineHeight: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: `${colors.primary}10`,
  },
  itemText: { fontSize: 16, color: colors.text, flex: 1 },
  itemTextActive: { color: colors.primary, fontWeight: '600' },
});
