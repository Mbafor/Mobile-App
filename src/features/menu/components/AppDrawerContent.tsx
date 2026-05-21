import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { performLogout } from '@/features/auth/utils/perform-logout';

type DrawerItem = {
  label: string;
  route: Href;
  destructive?: boolean;
};

const ITEMS: DrawerItem[] = [
  { label: 'My Profile', route: ROUTES.MAIN.DRAWER.PROFILE as Href },
  { label: 'Browse by Category', route: ROUTES.MAIN.DRAWER.BROWSE as Href },
  { label: 'Help & FAQ', route: ROUTES.MAIN.DRAWER.HELP as Href },
  { label: 'Privacy Policy', route: ROUTES.MAIN.DRAWER.PRIVACY as Href },
  { label: 'Terms of Service', route: ROUTES.MAIN.DRAWER.TERMS as Href },
  { label: 'Refer a Friend', route: ROUTES.MAIN.DRAWER.REFER as Href },
];

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const { signOut, isLoading } = useAuthActions();

  const navigate = (route: Href) => {
    props.navigation.closeDrawer();
    router.push(route);
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void performLogout(signOut);
        },
      },
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      <View style={styles.brand}>
        <Text variant="title">Olives Forum</Text>
        {profile?.displayName ? <Text muted>{profile.displayName}</Text> : null}
      </View>

      {ITEMS.map((item) => (
        <Pressable key={item.label} style={styles.item} onPress={() => navigate(item.route)}>
          <Text style={styles.itemText}>{item.label}</Text>
        </Pressable>
      ))}

      <Pressable
        style={[styles.item, styles.logout]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Text style={styles.logoutText}>{isLoading ? 'Logging out…' : 'Log Out'}</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg },
  brand: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.xs },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: { fontSize: 16, color: colors.text },
  logout: { marginTop: spacing.md, borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: colors.error, fontWeight: '600' },
});
