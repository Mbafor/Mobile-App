import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  getOAuthAvatarUrl,
  getOAuthDisplayName,
} from '@/features/auth/utils/oauth-profile-metadata';
import { performLogout } from '@/features/auth/utils/perform-logout';
import { confirmAction } from '@/utils/confirm-action';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type ProfileMenuBarProps = {
  /** Icon-only, no name/chevron — used when the desktop sidebar is collapsed. */
  collapsed?: boolean;
  /** Called before navigating away, e.g. to close the drawer. */
  onBeforeNavigate?: () => void;
};

/** Profile trigger anchored at the bottom of the sidebar/drawer; opens the account menu. */
export function ProfileMenuBar({ collapsed = false, onBeforeNavigate }: ProfileMenuBarProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const oauthMeta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const avatarUrl = profile?.avatarUrl ?? getOAuthAvatarUrl(oauthMeta);
  const displayName = profile?.displayName ?? getOAuthDisplayName(oauthMeta);

  const close = () => setOpen(false);

  const navigate = (route: Href) => {
    close();
    onBeforeNavigate?.();
    router.push(route);
  };

  const handleLogout = async () => {
    close();
    const confirmed = await confirmAction(
      t('menu.logoutConfirm.title'),
      t('menu.logoutConfirm.message'),
    );
    if (!confirmed) return;

    setIsLoggingOut(true);
    const result = await performLogout();
    setIsLoggingOut(false);

    if (!result.ok) {
      Alert.alert(t('menu.logoutFailed'), result.error);
    }
  };

  const items: MenuItem[] = [
    {
      label: t('menu.items.profile'),
      icon: 'person-outline',
      onPress: () => navigate(ROUTES.MAIN.DRAWER.PROFILE as Href),
    },
    {
      label: t('menu.items.settings'),
      icon: 'settings-outline',
      onPress: () => navigate(ROUTES.MAIN.SETTINGS as Href),
    },
    {
      label: t('menu.items.referFriend'),
      icon: 'gift-outline',
      onPress: () => navigate(ROUTES.MAIN.DRAWER.REFER as Href),
    },
    {
      label: t('menu.items.helpSupport'),
      icon: 'help-circle-outline',
      onPress: () => navigate(ROUTES.MAIN.HELP.INDEX as Href),
    },
    {
      label: isLoggingOut ? t('menu.items.loggingOut') : t('menu.items.logout'),
      icon: 'log-out-outline',
      onPress: () => void handleLogout(),
      destructive: true,
    },
  ];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, collapsed && styles.triggerCollapsed]}
        accessibilityRole="button"
        accessibilityLabel={t('menu.accountMenu')}
      >
        <UserAvatarDisplay displayName={displayName} avatarUrl={avatarUrl} size={32} />
        {!collapsed ? (
          <>
            <Text style={styles.name} numberOfLines={1}>
              {displayName ?? t('common.user')}
            </Text>
            <Ionicons name="chevron-expand-outline" size={16} color={colors.textMuted} />
          </>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <UserAvatarDisplay displayName={displayName} avatarUrl={avatarUrl} size={44} />
              {displayName ? (
                <Text style={styles.menuName} numberOfLines={1}>
                  {displayName}
                </Text>
              ) : null}
            </View>

            {items.map((item) => (
              <Pressable
                key={item.label}
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={isLoggingOut && item.destructive}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.destructive ? colors.error : colors.text}
                />
                <Text
                  style={[styles.menuItemText, item.destructive && styles.menuItemDestructive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  triggerCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  name: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 72,
    paddingLeft: spacing.sm,
  },
  menuCard: {
    minWidth: 220,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  menuName: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuItemDestructive: {
    color: colors.error,
    fontWeight: '600',
  },
});
}
