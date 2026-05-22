import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/constants/theme';

export type OptionsSheetItem = {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type OptionsSheetProps = {
  visible: boolean;
  title?: string;
  options: OptionsSheetItem[];
  onClose: () => void;
};

export function OptionsSheet({ visible, title, options, onClose }: OptionsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {options.map((option, index) => (
            <Pressable
              key={option.key}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              style={({ pressed }) => [
                styles.option,
                index < options.length - 1 && styles.optionBorder,
                pressed && styles.optionPressed,
              ]}
            >
              <Text
                style={[styles.optionLabel, option.destructive && styles.optionDestructive]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && styles.optionPressed]}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  option: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionPressed: { backgroundColor: colors.surface },
  optionLabel: { fontSize: 16, fontWeight: '500', color: colors.text },
  optionDestructive: { color: '#C5221F' },
  cancel: {
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  cancelLabel: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
});
