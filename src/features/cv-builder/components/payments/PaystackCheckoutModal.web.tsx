import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { extractReferenceFromUrl } from '@/services/paystack/paystack';
import { colors, spacing } from '@/constants/theme';

type PaystackCheckoutModalProps = {
  visible: boolean;
  authorizationUrl: string;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onFailure: (message: string, cancelled?: boolean) => void;
};

/** Web: open Paystack in a popup and listen for redirect to olivesforum:// or success URL. */
export function PaystackCheckoutModal({
  visible,
  authorizationUrl,
  onClose,
  onSuccess,
  onFailure,
}: PaystackCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const popupRef = useRef<Window | null>(null);
  const handledRef = useRef(false);

  const handleClose = useCallback(() => {
    popupRef.current?.close();
    popupRef.current = null;
    if (!handledRef.current) {
      onFailure('Payment was cancelled', true);
    }
    onClose();
  }, [onClose, onFailure]);

  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;

    handledRef.current = false;
    const popup = window.open(
      authorizationUrl,
      'paystack_checkout',
      'width=480,height=720,scrollbars=yes',
    );
    popupRef.current = popup;

    if (!popup) {
      onFailure('Allow pop-ups for this site to complete payment.', false);
      onClose();
      return;
    }

    const interval = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(interval);
        if (!handledRef.current) {
          handledRef.current = true;
          onFailure('Payment was cancelled', true);
          onClose();
        }
        return;
      }

      try {
        const href = popup.location.href;
        if (!href || href === 'about:blank') return;

        const reference = extractReferenceFromUrl(href);
        if (reference) {
          handledRef.current = true;
          popup.close();
          window.clearInterval(interval);
          onSuccess(reference);
        }
      } catch {
        // Cross-origin until Paystack redirects — expected
      }
    }, 500);

    const onMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      const reference = extractReferenceFromUrl(event.data);
      if (reference) {
        handledRef.current = true;
        popup.close();
        window.clearInterval(interval);
        onSuccess(reference);
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('message', onMessage);
      popup.close();
      popupRef.current = null;
    };
  }, [visible, authorizationUrl, onClose, onFailure, onSuccess]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Complete payment in the popup window</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.body}>
          <Ionicons name="open-outline" size={40} color={colors.primary} />
          <Text style={styles.bodyText}>
            If the Paystack window did not open, allow pop-ups and try again.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  toolbarTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  closeBtn: { padding: spacing.xs },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  bodyText: { textAlign: 'center', color: colors.textMuted, lineHeight: 22 },
});
