import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import type { PaymentProduct } from '@/features/cv-builder/constants/payments';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { colors, spacing } from '@/constants/theme';

type CVPaymentSheetProps = {
  visible: boolean;
  product: PaymentProduct | null;
  loading?: boolean;
  onClose: () => void;
  onPay: () => void;
};

export function CVPaymentSheet({
  visible,
  product,
  loading = false,
  onClose,
  onPay,
}: CVPaymentSheetProps) {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Ionicons name="card-outline" size={32} color={colors.primary} />
          </View>

          <Text variant="title" style={styles.title}>
            {product.title}
          </Text>

          <Text muted style={styles.description}>
            {product.description}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>GHS {product.amountGhs}</Text>
          </View>

          <View style={styles.trustRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={cvDocsTheme.textSecondary} />
            <Text style={styles.trustText}>Secured by Paystack</Text>
          </View>

          <View style={styles.actions}>
            <Button onPress={onPay} loading={loading}>
              Pay GHS {product.amountGhs}
            </Button>
            <Button variant="ghost" onPress={onClose} disabled={loading}>
              Cancel
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: cvDocsTheme.divider,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: cvDocsTheme.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { marginBottom: spacing.xs },
  description: { lineHeight: 22, marginBottom: spacing.md },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: cvDocsTheme.pageBg,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: cvDocsTheme.divider,
  },
  priceLabel: { fontSize: 14, color: cvDocsTheme.textSecondary, fontWeight: '500' },
  priceValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  trustText: { fontSize: 12, color: cvDocsTheme.textSecondary },
  actions: { gap: spacing.sm },
});
