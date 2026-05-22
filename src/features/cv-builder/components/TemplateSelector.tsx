import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import {
  CV_TEMPLATES,
  getTemplateDefinition,
  resolveTemplateId,
  type CVTemplateId,
} from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';

type TemplateSelectorProps = {
  selectedId: string;
  onSelect: (templateId: CVTemplateId) => void;
  onPreview?: (templateId: CVTemplateId) => void;
  disabled?: boolean;
  /** `gallery` — full cards (Templates tab). `compact` — horizontal strip (editor). */
  variant?: 'gallery' | 'compact';
};

const TEMPLATE_ACCENT: Record<CVTemplateId, string> = {
  ats: '#1F2937',
  modern: '#3b82f6',
  tech: '#1e2a3a',
  executive: '#2563eb',
  minimal: '#111827',
};

function TemplateLayoutMock({ id }: { id: CVTemplateId }) {
  const accent = TEMPLATE_ACCENT[id];

  if (id === 'tech') {
    return (
      <View style={mock.row}>
        <View style={[mock.sidebar, { backgroundColor: accent }]} />
        <View style={mock.main}>
          <View style={mock.lineWide} />
          <View style={mock.line} />
          <View style={mock.lineShort} />
        </View>
      </View>
    );
  }

  if (id === 'minimal') {
    return (
      <View style={mock.row}>
        <View style={mock.colNarrow}>
          <View style={[mock.block, { backgroundColor: accent, opacity: 0.35 }]} />
          <View style={mock.lineShort} />
        </View>
        <View style={mock.colWide}>
          <View style={mock.lineWide} />
          <View style={mock.line} />
        </View>
      </View>
    );
  }

  if (id === 'executive') {
    return (
      <View style={mock.stack}>
        <View style={[mock.banner, { backgroundColor: accent, opacity: 0.25 }]} />
        <View style={mock.row}>
          <View style={mock.colNarrow}>
            <View style={[mock.block, { backgroundColor: accent, opacity: 0.2 }]} />
          </View>
          <View style={mock.colWide}>
            <View style={mock.lineWide} />
            <View style={mock.line} />
          </View>
        </View>
      </View>
    );
  }

  if (id === 'modern') {
    return (
      <View style={mock.stack}>
        <View style={[mock.nameBar, { backgroundColor: accent, opacity: 0.5 }]} />
        <View style={[mock.sectionBar, { backgroundColor: '#E5E7EB' }]} />
        <View style={mock.line} />
        <View style={mock.lineShort} />
      </View>
    );
  }

  return (
    <View style={mock.stack}>
      <View style={[mock.lineWide, { alignSelf: 'center', width: '70%' }]} />
      <View style={[mock.line, { alignSelf: 'center', width: '55%' }]} />
      <View style={[mock.sectionBar, { backgroundColor: '#E5E7EB' }]} />
      <View style={mock.line} />
      <View style={mock.lineShort} />
    </View>
  );
}

export function TemplateSelector({
  selectedId,
  onSelect,
  onPreview,
  disabled,
  variant = 'gallery',
}: TemplateSelectorProps) {
  const activeId = resolveTemplateId(selectedId);
  const activeTemplate = getTemplateDefinition(activeId);

  if (variant === 'compact') {
    return (
      <View style={styles.compactWrap}>
        <Text style={styles.compactLabel}>Template</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactScroll}
        >
          {CV_TEMPLATES.map((template) => {
            const isSelected = template.id === activeId;
            return (
              <Pressable
                key={template.id}
                onPress={() => onSelect(template.id)}
                disabled={disabled}
                style={[
                  styles.compactCard,
                  isSelected && styles.compactCardSelected,
                  disabled && styles.cardDisabled,
                ]}
              >
                <View
                  style={[
                    styles.compactThumb,
                    { backgroundColor: TEMPLATE_ACCENT[template.id] },
                  ]}
                />
                <Text
                  style={[styles.compactTitle, isSelected && styles.cardTitleSelected]}
                  numberOfLines={1}
                >
                  {template.label}
                </Text>
                {onPreview ? (
                  <Pressable
                    onPress={() => onPreview(template.id)}
                    hitSlop={8}
                    style={styles.compactEye}
                  >
                    <Ionicons name="eye-outline" size={16} color={colors.primary} />
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {activeTemplate ? (
        <View style={styles.activePill}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.activePillText}>
            Active: <Text style={styles.activePillName}>{activeTemplate.label}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {CV_TEMPLATES.map((template) => {
          const isSelected = template.id === activeId;

          return (
            <Pressable
              key={template.id}
              onPress={() => onSelect(template.id)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                disabled && styles.cardDisabled,
                pressed && !disabled && styles.cardPressed,
              ]}
            >
              <View style={styles.mockWrap}>
                <TemplateLayoutMock id={template.id} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View style={[styles.dot, { backgroundColor: TEMPLATE_ACCENT[template.id] }]} />
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {template.label}
                  </Text>
                  {isSelected ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>In use</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {template.description}
                </Text>

                <View style={styles.actions}>
                  {onPreview ? (
                    <Pressable
                      onPress={() => onPreview(template.id)}
                      style={styles.previewBtn}
                      hitSlop={6}
                    >
                      <Ionicons name="eye-outline" size={16} color={colors.primary} />
                      <Text style={styles.previewBtnText}>Preview</Text>
                    </Pressable>
                  ) : null}
                  {!isSelected ? (
                    <Pressable
                      onPress={() => onSelect(template.id)}
                      disabled={disabled}
                      style={[styles.applyBtn, disabled && styles.applyBtnDisabled]}
                    >
                      <Text style={styles.applyBtnText}>Use template</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const mock = StyleSheet.create({
  stack: { flex: 1, gap: 4, justifyContent: 'center' },
  row: { flex: 1, flexDirection: 'row', gap: 4 },
  sidebar: { width: '32%', borderRadius: 2 },
  main: { flex: 1, gap: 4, justifyContent: 'center' },
  colNarrow: { width: '30%', gap: 4, justifyContent: 'center' },
  colWide: { flex: 1, gap: 4, justifyContent: 'center' },
  banner: { height: 10, borderRadius: 2 },
  nameBar: { height: 8, borderRadius: 2, width: '55%' },
  sectionBar: { height: 5, borderRadius: 2, width: '45%' },
  block: { height: 14, borderRadius: 2 },
  lineWide: { height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', width: '90%' },
  line: { height: 3, borderRadius: 2, backgroundColor: '#E5E7EB', width: '80%' },
  lineShort: { height: 3, borderRadius: 2, backgroundColor: '#F3F4F6', width: '60%' },
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: cvDocsTheme.primaryTint,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  activePillText: { fontSize: 14, color: colors.text },
  activePillName: { fontWeight: '700', color: colors.primary },
  list: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
    minHeight: 112,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: cvDocsTheme.primaryTint,
  },
  cardPressed: { opacity: 0.92 },
  cardDisabled: { opacity: 0.55 },
  mockWrap: {
    width: 96,
    padding: spacing.sm,
    backgroundColor: '#F9FAFB',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  cardBody: {
    flex: 1,
    padding: spacing.sm,
    paddingRight: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  cardTitleSelected: { color: colors.primary },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
    textTransform: 'uppercase',
  },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
  },
  previewBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  applyBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnText: { fontSize: 12, fontWeight: '700', color: colors.background },
  compactWrap: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  compactCard: {
    width: 108,
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 4,
  },
  compactCardSelected: {
    borderColor: colors.primary,
    backgroundColor: cvDocsTheme.primaryTint,
  },
  compactThumb: { width: '100%', height: 28, borderRadius: 4, opacity: 0.85 },
  compactTitle: { fontSize: 12, fontWeight: '700', color: colors.text, alignSelf: 'stretch' },
  compactEye: { position: 'absolute', top: 6, right: 6 },
});
