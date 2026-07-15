import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { AppDrawerContent } from '@/features/menu/components/AppDrawerContent';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { useTheme } from '@/hooks/useTheme';

const hiddenDrawerItem = { drawerItemStyle: { display: 'none' as const }, headerShown: true };

export default function MainLayout() {
  useAuthRedirect('authenticated');
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: t('common.appName'),
          headerShown: false,
          drawerLabel: t('navigation.tabs.home'),
        }}
      />
      <Drawer.Screen name="category/[category]" options={{ title: t('navigation.headerTitles.category'), headerShown: false }} />
      <Drawer.Screen
        name="search"
        options={{ ...hiddenDrawerItem, title: t('navigation.search'), headerShown: false }}
      />
      <Drawer.Screen name="refer" options={{ title: t('menu.items.referFriend'), headerShown: false }} />
      <Drawer.Screen
        name="opportunity/[id]"
        options={{ ...hiddenDrawerItem, title: t('navigation.headerTitles.opportunity'), headerShown: false }}
      />
      <Drawer.Screen
        name="events"
        options={{ ...hiddenDrawerItem, title: t('navigation.tabs.events'), headerShown: false }}
      />
      <Drawer.Screen
        name="events-search"
        options={{ ...hiddenDrawerItem, title: t('navigation.search'), headerShown: false }}
      />
      <Drawer.Screen
        name="event/[id]"
        options={{ ...hiddenDrawerItem, title: t('navigation.headerTitles.event'), headerShown: false }}
      />
      <Drawer.Screen
        name="tracker-search"
        options={{ ...hiddenDrawerItem, title: t('navigation.search'), headerShown: false }}
      />
      <Drawer.Screen
        name="settings"
        options={{ ...hiddenDrawerItem, title: t('menu.items.settings'), headerShown: false }}
      />
      <Drawer.Screen
        name="help"
        options={{ ...hiddenDrawerItem, title: t('menu.items.helpSupport'), headerShown: false }}
      />
      <Drawer.Screen name="profile" options={{ ...hiddenDrawerItem, title: t('menu.items.profile'), headerShown: false }} />
    </Drawer>
  );
}
