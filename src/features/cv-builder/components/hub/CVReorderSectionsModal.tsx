import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { spacing } from '@/constants/theme';

type CVReorderSectionsModalProps = {
  visible: boolean;
  order: CVSectionId[];
  disabledSections: CVSectionId[];
  onClose: () => void;
  onSave: (order: CVSectionId[]) => void | Promise<void>;
};

export function CVReorderSectionsModal({
  visible,
  order,
  disabledSections,
  onClose,
  onSave,
}: CVReorderSectionsModalProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draftOrder, setDraftOrder] = useState<CVSectionId[]>([]);

  useEffect(() => {
    if (visible) {
      const enabled = order.filter((id) => !disabledSections.includes(id));
      setDraftOrder(enabled);
    }
  }, [visible, order, disabledSections]);

  const move = (index: number, direction: -1 | 1) => {
    setDraftOrder((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      if (next[index] === 'personal' && direction === -1) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const handleDone = async () => {
    const disabled = order.filter((id) => disabledSections.includes(id));
    const merged = [
      ...draftOrder,
      ...disabled.filter((id) => !draftOrder.includes(id)),
    ] as CVSectionId[];
    await onSave(merged);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <Text variant="title">{t('cvBuilder.reorderModal.title')}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <Text muted style={styles.subtitle}>
          {t('cvBuilder.reorderModal.subtitle')}
        </Text>
        <ScrollView contentContainerStyle={styles.list}>
          {draftOrder.map((id, index) => (
            <View key={id} style={styles.row}>
              <Text style={styles.rowTitle}>{getSectionMeta(id).title}</Text>
              <View style={styles.arrows}>
                <Pressable
                  onPress={() => move(index, -1)}
                  disabled={index === 0 || id === 'personal'}
                  style={styles.arrowBtn}
                >
                  <Ionicons
                    name="chevron-up"
                    size={22}
                    color={index === 0 || id === 'personal' ? colors.border : colors.primary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => move(index, 1)}
                  disabled={index >= draftOrder.length - 1}
                  style={styles.arrowBtn}
                >
                  <Ionicons
                    name="chevron-down"
                    size={22}
                    color={index >= draftOrder.length - 1 ? colors.border : colors.primary}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button onPress={() => void handleDone()}>{t('cvBuilder.reorderModal.saveOrder')}</Button>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  subtitle: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  arrows: { flexDirection: 'row', gap: spacing.xs },
  arrowBtn: { padding: spacing.xs },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
});
}
