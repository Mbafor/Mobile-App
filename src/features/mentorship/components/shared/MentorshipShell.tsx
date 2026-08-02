import type { PropsWithChildren, ReactNode } from 'react';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ResponsiveContainer } from '@/components/layout';
import { Text } from '@/components/ui';
import { MentorshipTabNav } from '@/features/mentorship/components/shared/MentorshipTabNav';
import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';
import { spacing } from '@/constants/theme';
import { useIsWeb, useWebDesktop } from '@/hooks/useWebDesktop';

type MentorshipShellProps = PropsWithChildren<{
  navItems: MentorshipNavItem[];
  activeSection: string;
  sectionTitle: string;
  onSelectSection: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  headerExtra?: ReactNode;
  scrollable?: boolean;
  /** Skip the ResponsiveContainer so content fills the full available width, left-aligned. */
  fillWidth?: boolean;
}>;

export function MentorshipShell({
  navItems,
  activeSection,
  sectionTitle,
  onSelectSection,
  onRefresh,
  refreshing = false,
  headerExtra,
  scrollable = true,
  fillWidth = false,
  children,
}: MentorshipShellProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const isDesktop = useWebDesktop();
  const isWeb = useIsWeb();

  const tabNav = (
    <MentorshipTabNav
      items={navItems}
      activeId={activeSection}
      onSelect={onSelectSection}
      mode={isWeb ? 'horizontal' : 'bottom'}
    />
  );

  // Section title text is intentionally not rendered (saves vertical space --
  // the tab nav already communicates which section is active). The wrapper
  // still renders when a screen supplies headerExtra (e.g. the student
  // dashboard intro line), just without the title above it.
  const titleBlock = headerExtra ? (
    <View style={styles.titleSection}>
      <ResponsiveContainer minHorizontalPadding={spacing.md}>
        <View style={styles.titleBlock}>{headerExtra}</View>
      </ResponsiveContainer>
    </View>
  ) : null;

  // On web mobile (non-desktop), show tabs at the top of the page content.
  // On native mobile, keep tabs at the bottom. A single nav item (e.g. before
  // a student has chosen a mentor) means there's nothing to switch between.
  const hasMultipleSections = navItems.length > 1;
  const showTabsAtTop = !isDesktop && isWeb && hasMultipleSections;
  const showTabsAtBottom = !isDesktop && !isWeb && hasMultipleSections;

  return (
    <View style={styles.root}>
      {isDesktop && hasMultipleSections && tabNav}
      {showTabsAtTop && tabNav}

      {titleBlock}

      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={mentorshipColors.accent}
              />
            ) : undefined
          }
        >
          {fillWidth ? (
            <View style={styles.content}>{children}</View>
          ) : (
            <ResponsiveContainer minHorizontalPadding={spacing.md}>
              <View style={styles.content}>{children}</View>
            </ResponsiveContainer>
          )}
        </ScrollView>
      ) : (
        <View style={styles.flexContent}>
          <ResponsiveContainer minHorizontalPadding={0} style={styles.fillHeight}>
            <View style={styles.content}>{children}</View>
          </ResponsiveContainer>
        </View>
      )}

      {showTabsAtBottom && tabNav}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  titleSection: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  titleBlock: {
    gap: 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: mentorshipColors.text,
    letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  flexContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  fillHeight: {
    flex: 1,
    minHeight: 0,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
}
