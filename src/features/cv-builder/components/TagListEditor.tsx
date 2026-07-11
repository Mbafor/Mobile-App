import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/forms';
import { Input, Text } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { spacing } from '@/constants/theme';

type TagListEditorProps = {
  title: string;
  description?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  addLabel?: string;
};

export function TagListEditor({
  title,
  description,
  tags,
  onChange,
  placeholder,
  addLabel,
}: TagListEditorProps) {
  const cvUi = useCvUi();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('cvBuilder.editors.typeAndAdd');
  const resolvedAddLabel = addLabel ?? t('cvBuilder.editors.addItemDefault');
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const value = draft.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View style={cvUi.sectionGap}>
      <CVSectionHeader title={title} description={description} />

      {tags.map((tag) => (
        <View key={tag} style={cvUi.surfaceCard}>
          <View style={styles.row}>
            <Text style={styles.tagText}>{tag}</Text>
            <Pressable
              onPress={() => removeTag(tag)}
              hitSlop={8}
              accessibilityLabel={t('cvBuilder.editors.removeItem', { item: tag })}
            >
              <Text style={styles.remove}>×</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={cvUi.surfaceCard}>
        <FormField label={tags.length === 0 ? resolvedAddLabel : t('cvBuilder.editors.addAnother')}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder={resolvedPlaceholder}
            onSubmitEditing={addTag}
            returnKeyType="done"
          />
        </FormField>
      </View>

      <CVAddButton label={resolvedAddLabel} onPress={addTag} disabled={!draft.trim()} />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tagText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  remove: { fontSize: 22, color: colors.textMuted, fontWeight: '600', lineHeight: 24 },
});
}
