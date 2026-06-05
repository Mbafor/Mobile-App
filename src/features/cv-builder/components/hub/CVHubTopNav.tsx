import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { usePathname, useRouter, type Href } from 'expo-router';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { webPressableStyle } from '@/utils/web/pressable';

type TabDef = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  getHref: (cvId: string) => Href;
};

const CV_TABS: TabDef[] = [
  {
    key: 'index',
    label: 'Dashboard',
    icon: 'grid-outline',
    iconActive: 'grid',
    getHref: (cvId) => `/(main)/(tabs)/cv-builder/${cvId}` as Href,
  },
  {
    key: 'tips',
    label: 'Tips',
    icon: 'bulb-outline',
    iconActive: 'bulb',
    getHref: (cvId) => `/(main)/(tabs)/cv-builder/${cvId}/tips` as Href,
  },
  {
    key: 'templates',
    label: 'Templates',
    icon: 'color-palette-outline',
    iconActive: 'color-palette',
    getHref: (cvId) => `/(main)/(tabs)/cv-builder/${cvId}/templates` as Href,
  },
  {
    key: 'settings',
    label: 'Sections',
    icon: 'list-outline',
    iconActive: 'list',
    getHref: (cvId) => `/(main)/(tabs)/cv-builder/${cvId}/settings` as Href,
  },
];

function getActiveKey(pathname: string, cvId: string): string {
  const after = pathname.split(cvId)[1] ?? '';
  if (after.endsWith('/tips')) return 'tips';
  if (after.endsWith('/templates')) return 'templates';
  if (after.endsWith('/settings')) return 'settings';
  return 'index';
}

type CVHubTopNavProps = { cvId: string };

export function CVHubTopNav({ cvId }: CVHubTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = getActiveKey(pathname, cvId);
  const isDesktop = useWebDesktop();

  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabs, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}
      >
        {CV_TABS.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <Pressable
              key={tab.key}
              style={webPressableStyle(
                [styles.tab, active && styles.tabActive],
                styles.tabHover,
              )}
              onPress={() => router.push(tab.getHref(cvId))}
              accessibilityRole="tab"
            >
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={16}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`,
  },
  tabHover: { backgroundColor: colors.surface },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
