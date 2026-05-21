import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Input, Text } from '@/components/ui';
import { CVAddButton } from '@/features/cv-builder/components/shared/CVAddButton';
import { CVSectionHeader } from '@/features/cv-builder/components/shared/CVSectionHeader';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';
import { colors, spacing } from '@/constants/theme';

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
  placeholder = 'Type and add an item',
  addLabel = 'Add item',
}: TagListEditorProps) {
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

      <View style={cvUi.surfaceCard}>
        {tags.length === 0 ? (
          <Text muted variant="caption" style={styles.empty}>
            No items yet. Add your first one below.
          </Text>
        ) : (
          <View style={styles.chips}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                style={styles.chip}
                onPress={() => removeTag(tag)}
                accessibilityLabel={`Remove ${tag}`}
              >
                <Text style={styles.chipText}>{tag}</Text>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Input
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        onSubmitEditing={addTag}
        returnKeyType="done"
      />

      <CVAddButton label={addLabel} onPress={addTag} disabled={!draft.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipRemove: { fontSize: 16, color: colors.textMuted, fontWeight: '700', lineHeight: 18 },
});
