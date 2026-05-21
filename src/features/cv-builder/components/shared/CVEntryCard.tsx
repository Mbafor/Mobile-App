import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';

type CVEntryCardProps = {
  index: number;
  title?: string;
  onRemove: () => void;
  children: ReactNode;
};

export function CVEntryCard({ index, title, onRemove, children }: CVEntryCardProps) {
  return (
    <View style={cvUi.entryCard}>
      <View style={cvUi.entryHeader}>
        <Text style={cvUi.entryTitle}>{title ?? `Entry ${index + 1}`}</Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button">
          <Text style={cvUi.removeText}>Remove</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}
