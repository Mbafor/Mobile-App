import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingHelpButton } from '@/features/help/components/FloatingHelpButton';
import { FeatureSurveyModal, useSurveyStore } from '@/features/survey';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRefreshProfile } from '@/features/auth/hooks/useRefreshProfile';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { DesktopWebNavigation, DesktopShell } from '@/features/navigation/components';
import { useIsWeb, useWebDesktop } from '@/hooks/useWebDesktop';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

const WHATSAPP_URL =
  process.env.EXPO_PUBLIC_WHATSAPP_CHANNEL_URL ??
  'https://whatsapp.com/channel/0029VbBtgba6xCSPUQdGPO2C';

type TabIconName = keyof typeof Ionicons.glyphMap;

type TabBarIconProps = { color: string; focused: boolean; size: number };

function tabBarIcon(outline: TabIconName, filled: TabIconName) {
  return ({ color, focused, size }: TabBarIconProps) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function MainTabsLayout() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const refreshProfile = useRefreshProfile();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isWeb = useIsWeb();
  const isWebDesktop = useWebDesktop();
  const openSurvey = useSurveyStore((s) => s.open);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

  const tabBarHeight = 65 + insets.bottom;
  const tabBarPaddingBottom = Math.max(insets.bottom, spacing.xs);

  const tabs = (
    <Tabs
      key={`tabs-${isSuperAdmin ? 'sa' : ''}${isAdmin ? 'admin' : ''}`}
      screenOptions={{
        headerShown: !isWeb,
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <AppHeaderActions />,
        headerTintColor: colors.text,
        headerRightContainerStyle: { paddingRight: spacing.xs },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: spacing.xs,
          ...(isWeb ? { display: 'none' as const } : {}),
        },
        tabBarItemStyle: { paddingTop: 4 },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('navigation.tabs.dashboard'),
          tabBarIcon: tabBarIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        name="mentorship"
        options={{
          title: t('navigation.tabs.mentorship'),
          headerTitle: t('navigation.tabs.mentorship'),
          tabBarIcon: tabBarIcon('people-outline', 'people'),
        }}
      />
      <Tabs.Screen
        name="cv-builder"
        options={{
          title: t('navigation.tabs.cvBuilder'),
          headerShown: false,
          tabBarIcon: tabBarIcon('document-text-outline', 'document-text'),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('navigation.tabs.more'),
          tabBarIcon: tabBarIcon('ellipsis-horizontal-outline', 'ellipsis-horizontal'),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: t('navigation.tabs.tracker'),
          headerTitle: t('navigation.headerTitles.tracker'),
          tabBarIcon: tabBarIcon('clipboard-outline', 'clipboard'),
        }}
      />
      <Tabs.Screen
        name="cv-builder"
        options={{
          title: t('navigation.tabs.cvBuilder'),
          headerShown: false,
          tabBarIcon: tabBarIcon('document-text-outline', 'document-text'),
        }}
      />
      <Tabs.Screen
        name="browse-categories"
        options={{
          title: t('navigation.tabs.browse'),
          headerTitle: t('navigation.headerTitles.browse'),
          tabBarIcon: tabBarIcon('grid-outline', 'grid'),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('navigation.tabs.notifications'),
          href: isWeb ? '/(main)/(tabs)/notifications' : null,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('navigation.tabs.events'),
          href: isWeb ? '/(main)/(tabs)/events' : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('menu.items.settings'),
          headerShown: false,
          href: isWeb ? '/(main)/(tabs)/settings' : null,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t('navigation.tabs.admin'),
          href: isAdmin ? undefined : null,
          headerShown: false,
          tabBarIcon: tabBarIcon('shield-outline', 'shield'),
        }}
      />
      <Tabs.Screen
        name="super-admin"
        options={{
          title: t('navigation.tabs.superAdmin'),
          href: isSuperAdmin ? undefined : null,
          headerShown: false,
          tabBarIcon: tabBarIcon('planet-outline', 'planet'),
        }}
      />
    </Tabs>
  );

  if (isWeb) {
    if (isWebDesktop) {
      return (
        <DesktopShell rightSlot={<AppHeaderActions />}>
          {tabs}
          <FloatingHelpButton />
          <FeatureSurveyModal />
        </DesktopShell>
      );
    }

    return (
      <View style={styles.webRoot}>
        <DesktopWebNavigation
          compact
          onMenuToggle={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          rightSlot={<AppHeaderActions />}
        />
        <View style={styles.webContent}>
          {tabs}
          <FloatingHelpButton />
          <FeatureSurveyModal />
        </View>
        <View style={styles.mobileWebFooter}>
          <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
          <Text
            style={styles.mobileWebFooterLink}
            numberOfLines={1}
            onPress={() => void openExternalUrl(WHATSAPP_URL)}
          >
            {t('navigation.whatsapp.community')}
          </Text>
          <Text style={styles.mobileWebFooterSep}>·</Text>
          <Pressable onPress={() => openSurvey(true)}>
            <Text style={styles.mobileWebFooterLink} numberOfLines={1}>
              {t('navigation.footer.giveFeedback')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      {tabs}
      <FloatingHelpButton />
      <FeatureSurveyModal />
      <View style={styles.mobileFooter}>
        <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
        <Text
          style={styles.mobileFooterLink}
          numberOfLines={1}
          onPress={() => void openExternalUrl(WHATSAPP_URL)}
        >
          {t('navigation.whatsapp.community')}
        </Text>
        <Text style={styles.mobileFooterSep}>·</Text>
        <Pressable onPress={() => openSurvey(true)}>
          <Text style={styles.mobileFooterLink} numberOfLines={1}>
            {t('navigation.footer.giveFeedback')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: import('@/constants/theme/types').ColorScheme) {
  return StyleSheet.create({
    mobileRoot: { flex: 1 },
    webRoot: { flex: 1, backgroundColor: colors.background },
    webContent: { flex: 1 },
    mobileWebFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    mobileWebFooterLink: {
      fontSize: 12,
      color: colors.textMuted,
    },
    mobileWebFooterSep: {
      fontSize: 12,
      color: colors.textMuted,
    },
    mobileFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    mobileFooterLink: {
      fontSize: 12,
      color: colors.textMuted,
    },
    mobileFooterSep: {
      fontSize: 12,
      color: colors.textMuted,
    },
  });
}
