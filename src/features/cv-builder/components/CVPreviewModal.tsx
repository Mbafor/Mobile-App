import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { CVPreviewView } from '@/features/cv-builder/components/preview/CVPreviewView';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';
import type { CVContent } from '@/types/domain/cv';

type CVPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  templateId: string;
  content: CVContent;
};

export function CVPreviewModal({
  visible,
  onClose,
  templateId,
  content,
}: CVPreviewModalProps) {
  const insets = useSafeAreaInsets();
  const templateLabel = getTemplateDefinition(templateId)?.label ?? templateId;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <View>
            <Text variant="title">Preview</Text>
            <Text muted variant="caption">
              {templateLabel} template · live from your form
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <View style={styles.paper}>
            <CVPreviewView templateId={templateId} content={content} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: { fontWeight: '600', color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    alignItems: 'center',
  },
  paper: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
