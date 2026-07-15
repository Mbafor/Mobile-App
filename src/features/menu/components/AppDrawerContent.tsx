import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { LanguageQuickSwitch, Text, ThemeQuickSwitch } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useMainTabNavItems } from '@/features/navigation/hooks/useMainTabNavItems';
import { ProfileMenuBar } from '@/features/menu/components/ProfileMenuBar';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const styles = useThemedStyles(createStyles);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
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
      <Text style={styles.sectionLabel}>{t('navigation.sections.main')}</Text>
      {tabNavItems
        .filter((i) => ['home', 'dashboard', 'saved', 'browse-categories', 'events'].includes(i.key))
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

      <Text style={styles.sectionLabel}>{t('navigation.sections.careerTools')}</Text>
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

      <Text style={styles.sectionLabel}>{t('navigation.sections.account')}</Text>
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
          <Text style={styles.sectionLabel}>{t('navigation.sections.administration')}</Text>
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

      <View style={styles.quickSwitchRow}>
        <ThemeQuickSwitch />
        <LanguageQuickSwitch />
      </View>

      <View style={styles.profileRow}>
        <ProfileMenuBar onBeforeNavigate={() => props.navigation.closeDrawer()} />
      </View>
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
  quickSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  profileRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
}
