import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performLogout } from '@/features/auth/utils/perform-logout';
import { confirmAction } from '@/utils/confirm-action';

type DrawerItem = {
  label: string;
  route: Href;
};

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { profile, userEmail, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const items: DrawerItem[] = [
    { label: 'My Profile', route: ROUTES.MAIN.DRAWER.PROFILE as Href },
    { label: 'Browse by Category', route: ROUTES.MAIN.DRAWER.BROWSE as Href },
    { label: 'Help & FAQ', route: ROUTES.MAIN.DRAWER.HELP as Href },
    { label: 'Privacy Policy', route: ROUTES.MAIN.DRAWER.PRIVACY as Href },
    { label: 'Terms of Service', route: ROUTES.MAIN.DRAWER.TERMS as Href },
    { label: 'Refer a Friend', route: ROUTES.MAIN.DRAWER.REFER as Href },
  ];

  if (isAdmin) {
    items.unshift({ label: 'Admin Dashboard', route: ROUTES.ADMIN.HOME as Href });
  }

  const navigate = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  const handleLogout = async () => {
    const confirmed = await confirmAction('Log out', 'Are you sure you want to log out?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    props.navigation.closeDrawer();

    const result = await performLogout();
    setIsLoggingOut(false);

    if (!result.ok) {
      Alert.alert('Log out failed', result.error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Text variant="title">Olives Forum</Text>
      </View>

      <View style={styles.userSection}>
        <UserAvatarDisplay
          displayName={profile?.displayName ?? null}
          avatarUrl={profile?.avatarUrl ?? null}
          size={80}
        />
        {userEmail ? (
          <Text muted variant="caption" style={styles.email}>
            {userEmail}
          </Text>
        ) : null}
      </View>

      {items.map((item) => (
        <Pressable key={item.label} style={styles.item} onPress={() => navigate(item.route)}>
          <Text style={[styles.itemText, item.label === 'Admin Dashboard' && styles.adminItem]}>
            {item.label}
          </Text>
        </Pressable>
      ))}

      {!isAdmin ? (
        <Text muted variant="caption" style={styles.adminHint}>
          Admin tab: enable is_admin on your profile in Supabase, then refresh the app.
        </Text>
      ) : null}

      <Pressable
        style={[styles.item, styles.logout]}
        onPress={() => void handleLogout()}
        disabled={isLoggingOut}
      >
        <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out…' : 'Log Out'}</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg },
  brand: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  userSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  email: { textAlign: 'center' },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: { fontSize: 16, color: colors.text },
  adminItem: { color: colors.primary, fontWeight: '600' },
  adminHint: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    lineHeight: 18,
  },
  logout: { marginTop: spacing.md, borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: colors.error, fontWeight: '600' },
});
