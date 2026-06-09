import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/theme';

type CVRenameModalProps = {
  visible: boolean;
  currentTitle: string;
  value: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
};

export function CVRenameModal({
  visible,
  currentTitle,
  value,
  onChangeValue,
  onClose,
  onSave,
  saving,
}: CVRenameModalProps) {
  const styles = useAppThemedStyles(createStyles);
  const trimmed = value.trim();
  const canSave = trimmed.length > 0 && trimmed !== currentTitle.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.heading}>Rename CV</Text>
          <Input
            value={value}
            onChangeText={onChangeValue}
            placeholder="CV title"
            autoFocus
            maxLength={120}
          />
          <View style={styles.actions}>
            <Button variant="secondary" onPress={onClose} disabled={saving} style={styles.btn}>
              Cancel
            </Button>
            <Button onPress={onSave} loading={saving} disabled={!canSave || saving} style={styles.btn}>
              Save
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: cvDocsTheme.barBg,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1 },
});
}
