import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

type DrawerItem = {
  label: string;
  route: Href;
};

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { isAdmin, isSuperAdmin } = useAuth();

  const items: DrawerItem[] = [
    { label: 'Home', route: ROUTES.MAIN.DASHBOARD as Href },
    { label: 'Mentorship', route: ROUTES.MAIN.MENTORSHIP as Href },
    { label: 'Browse by Category', route: ROUTES.MAIN.DRAWER.BROWSE as Href },
    { label: 'Privacy Policy', route: ROUTES.MAIN.DRAWER.PRIVACY as Href },
    { label: 'Terms of Service', route: ROUTES.MAIN.DRAWER.TERMS as Href },
    { label: 'Refer a Friend', route: ROUTES.MAIN.DRAWER.REFER as Href },
  ];

  if (isSuperAdmin) {
    items.unshift({ label: 'Super Admin', route: ROUTES.SUPER_ADMIN.HOME as Href });
  }
  if (isAdmin) {
    items.unshift({ label: 'Admin Dashboard', route: ROUTES.ADMIN.HOME as Href });
  }

  const navigate = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Text variant="title">Olives Forum</Text>
      </View>

      {items.map((item) => (
        <Pressable key={item.label} style={styles.item} onPress={() => navigate(item.route)}>
          <Text style={[styles.itemText, item.label === 'Admin Dashboard' && styles.adminItem]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg },
  brand: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: { fontSize: 16, color: colors.text },
  adminItem: { color: colors.primary, fontWeight: '600' },
});
