import type { PropsWithChildren } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/theme';

type AccordionProps = PropsWithChildren<{
  title: string;
  /** When set, shows a numbered badge and accent underline (settings / legal style). */
  index?: number;
  defaultOpen?: boolean;
}>;

export function Accordion({ title, index, children, defaultOpen = false }: AccordionProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const numbered = index !== undefined;

  return (
    <View style={[styles.card, numbered && styles.cardNumbered]}>
      <Pressable onPress={() => setOpen((current) => !current)} style={styles.summary}>
        {numbered ? (
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index}</Text>
          </View>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, numbered && styles.titleNumbered]}>{title}</Text>
          {numbered ? <View style={styles.underline} /> : null}
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>
      {open ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardNumbered: {
    backgroundColor: colors.background,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
  },
  indexBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  indexText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  titleNumbered: {
    fontSize: 16,
  },
  underline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
}
