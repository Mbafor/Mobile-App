import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { CV_TEMPLATES } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';

type TemplateSelectorProps = {
  selectedId: string;
  onSelect: (templateId: string) => void;
  disabled?: boolean;
};

export function TemplateSelector({ selectedId, onSelect, disabled }: TemplateSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>CV template</Text>
      <Text muted variant="caption" style={styles.hint}>
        Tap Preview to see your CV. Unlock templates in a future update.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CV_TEMPLATES.map((template) => {
          const isSelected = template.id === selectedId;

          return (
            <Pressable
              key={template.id}
              onPress={() => onSelect(template.id)}
              disabled={disabled}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                disabled && styles.cardDisabled,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                  {template.label}
                </Text>
                <Text style={styles.lock}>🔒</Text>
              </View>
              <Text
                style={[styles.cardDesc, isSelected && styles.cardDescSelected]}
                numberOfLines={2}
              >
                {template.description}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hint: {
    paddingHorizontal: spacing.md,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  card: {
    width: 120,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F0EB',
  },
  cardDisabled: { opacity: 0.55 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
  cardTitleSelected: { color: colors.primary },
  cardDesc: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  cardDescSelected: { color: colors.text },
  lock: { fontSize: 11, marginLeft: spacing.xs },
});
