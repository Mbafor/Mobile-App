import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useMainTabNavItems } from '@/features/navigation/hooks/useMainTabNavItems';

type DrawerLink = {
  label: string;
  route: Href;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const tabNavItems = useMainTabNavItems();

  const moreItems: DrawerLink[] = [
    { label: 'Browse by Category', route: ROUTES.MAIN.DRAWER.BROWSE as Href, icon: 'grid-outline' },
    { label: 'Help & FAQ', route: ROUTES.MAIN.DRAWER.HELP as Href, icon: 'help-circle-outline' },
    { label: 'Privacy Policy', route: ROUTES.MAIN.DRAWER.PRIVACY as Href, icon: 'lock-closed-outline' },
    { label: 'Terms of Service', route: ROUTES.MAIN.DRAWER.TERMS as Href, icon: 'document-text-outline' },
    { label: 'Refer a Friend', route: ROUTES.MAIN.DRAWER.REFER as Href, icon: 'gift-outline' },
  ];

  const webOnlyItems: DrawerLink[] =
    Platform.OS === 'web'
      ? [
          {
            label: 'Home page',
            route: ROUTES.LANDING as Href,
            icon: 'home-outline',
          },
          {
            label: 'Welcome / Sign in',
            route: ROUTES.AUTH.WELCOME as Href,
            icon: 'log-in-outline',
          },
        ]
      : [];

  const navigate = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Text variant="title">Olives Forum</Text>
        {Platform.OS === 'web' ? (
          <Text muted style={styles.brandHint}>
            Open menu for Dashboard, Tracker, Mentorship, and more
          </Text>
        ) : null}
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

      {webOnlyItems.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Website</Text>
          {webOnlyItems.map((item) => (
            <Pressable key={item.label} style={styles.item} onPress={() => navigate(item.route)}>
              {item.icon ? (
                <Ionicons name={item.icon} size={20} color={colors.textMuted} />
              ) : null}
              <Text style={styles.itemText}>{item.label}</Text>
            </Pressable>
          ))}
        </>
      ) : null}

      <Text style={styles.sectionLabel}>More</Text>
      {moreItems.map((item) => (
        <Pressable key={item.label} style={styles.item} onPress={() => navigate(item.route)}>
          {item.icon ? (
            <Ionicons name={item.icon} size={20} color={colors.textMuted} />
          ) : null}
          <Text style={styles.itemText}>{item.label}</Text>
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
