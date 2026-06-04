import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/features/menu/components/AppDrawerContent';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { colors } from '@/constants/theme';

const hiddenDrawerItem = { drawerItemStyle: { display: 'none' as const }, headerShown: true };

export default function MainLayout() {
  useAuthRedirect('authenticated');

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Olives Forum',
          headerShown: false,
          drawerLabel: 'Home',
        }}
      />
      <Drawer.Screen name="category/[category]" options={{ title: 'Category' }} />
      <Drawer.Screen name="refer" options={{ title: 'Refer a Friend', headerShown: false }} />
      <Drawer.Screen
        name="opportunity/[id]"
        options={{ ...hiddenDrawerItem, title: 'Opportunity' }}
      />
      <Drawer.Screen
        name="settings"
        options={{ ...hiddenDrawerItem, title: 'Settings', headerShown: false }}
      />
      <Drawer.Screen
        name="help"
        options={{ ...hiddenDrawerItem, title: 'Help & Support', headerShown: false }}
      />
      <Drawer.Screen name="profile" options={{ ...hiddenDrawerItem, title: 'Profile', headerShown: false }} />
    </Drawer>
  );
}
