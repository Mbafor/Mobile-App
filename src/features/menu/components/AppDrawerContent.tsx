import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useMainTabNavItems } from '@/features/navigation/hooks/useMainTabNavItems';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useTheme();
  const tabNavItems = useMainTabNavItems();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Image
          source={
            isDark
              ? require('@/assets/images/white_logo.png')
              : require('@/assets/images/main_logo.png')
          }
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>

      {/* Grouped sections: Main, Career Tools, Account, Administration */}
      <Text style={styles.sectionLabel}>Main</Text>
      {tabNavItems
        .filter((i) => ['home', 'dashboard', 'saved', 'browse-categories'].includes(i.key))
        .map((item) => (
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

      <Text style={styles.sectionLabel}>Career Tools</Text>
      {tabNavItems
        .filter((i) => ['tracker', 'mentorship', 'cv-builder'].includes(i.key))
        .map((item) => (
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

      <Text style={styles.sectionLabel}>Account</Text>
      {tabNavItems
        .filter((i) => ['notifications', 'profile', 'settings'].includes(i.key))
        .map((item) => (
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

      {/** Administration group only shown when items exist */}
      {tabNavItems.some((i) => i.key === 'admin' || i.key === 'super-admin') && (
        <>
          <Text style={styles.sectionLabel}>Administration</Text>
          {tabNavItems
            .filter((i) => i.key === 'admin' || i.key === 'super-admin')
            .map((item) => (
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
        </>
      )}
    </DrawerContentScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  brand: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  logoImg: { width: 120, height: 36, transform: [{ scale: 3 }] },
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
}
