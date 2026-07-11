import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { useCvUi } from '@/features/cv-builder/components/shared/cv-ui-styles';

type CVEntryCardProps = {
  index: number;
  title?: string;
  onRemove: () => void;
  children: ReactNode;
};

export function CVEntryCard({ index, title, onRemove, children }: CVEntryCardProps) {
  const cvUi = useCvUi();
  const { t } = useTranslation();
  return (
    <View style={cvUi.entryCard}>
      <View style={cvUi.entryHeader}>
        <Text style={cvUi.entryTitle}>{title ?? t('cvBuilder.editors.entryFallback', { index: index + 1 })}</Text>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button">
          <Text style={cvUi.removeText}>{t('cvBuilder.editors.remove')}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}
