import type { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ResponsiveContainer } from '@/components/layout';
import { Text } from '@/components/ui';
import { MentorshipDrawerNav, type MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { colors, spacing } from '@/constants/theme';

type MentorshipShellProps = PropsWithChildren<{
  navItems: MentorshipNavItem[];
  activeSection: string;
  sectionTitle: string;
  onSelectSection: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  headerExtra?: ReactNode;
  scrollable?: boolean;
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
  children,
}: MentorshipShellProps) {
  const content = (
    <ResponsiveContainer minHorizontalPadding={spacing.md}>
      <View style={styles.content}>{children}</View>
    </ResponsiveContainer>
  );

  return (
    <View style={styles.root}>
      <ResponsiveContainer minHorizontalPadding={spacing.md}>
        <View style={styles.toolbar}>
          <MentorshipDrawerNav
            items={navItems}
            activeId={activeSection}
            onSelect={onSelectSection}
          />
          <View style={styles.titleBlock}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            {headerExtra}
          </View>
        </View>
      </ResponsiveContainer>

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
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flexContent}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  toolbar: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surfaceElevated,
    gap: spacing.sm,
  },
  titleBlock: { gap: 2 },
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
    paddingTop: spacing.sm,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
