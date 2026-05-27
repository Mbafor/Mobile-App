import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { CVPdfDownloadButton } from '@/features/cv-builder/components/preview/CVPdfDownloadButton';
import { CVPdfPreviewPanel } from '@/features/cv-builder/components/preview/CVPdfPreviewPanel';
import { CV_TEMPLATE_UNLOCK_FEE_GHS } from '@/features/cv-builder/constants/payments';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';
import type { CVContent } from '@/types/domain/cv';

type CVPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  templateId: string;
  content: CVContent;
  fileName: string;
  onDownload?: () => void;
  downloadLoading?: boolean;
  templatePurchased?: boolean;
};

export function CVPreviewModal({
  visible,
  onClose,
  templateId,
  content,
  fileName,
  onDownload,
  downloadLoading = false,
  templatePurchased = false,
}: CVPreviewModalProps) {
  const insets = useSafeAreaInsets();
  const templateLabel = getTemplateDefinition(templateId)?.label ?? templateId;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <View style={styles.toolbarCopy}>
            <Text variant="title">Preview</Text>
            <Text muted variant="caption">
              {templateLabel} · same PDF layout as download
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.previewWrap}>
          <CVPdfPreviewPanel data={content} templateId={templateId} />
        </View>

        {onDownload ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <CVPdfDownloadButton
              data={content}
              templateId={templateId}
              fileName={fileName}
              purchased={templatePurchased}
              onPress={onDownload}
              loading={downloadLoading}
              disabled={downloadLoading}
              label="Download PDF"
            />
            <Text muted variant="caption" style={styles.footerHint}>
              {templatePurchased
                ? 'This template is unlocked — download anytime.'
                : `GHS ${CV_TEMPLATE_UNLOCK_FEE_GHS} unlocks ${templateLabel} downloads permanently.`}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#525659',
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
    gap: spacing.sm,
  },
  toolbarCopy: { flex: 1, minWidth: 0 },
  closeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: { fontWeight: '600', color: colors.primary },
  previewWrap: {
    flex: 1,
    padding: spacing.md,
    minHeight: 480,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  footerHint: { textAlign: 'center', lineHeight: 18 },
});
