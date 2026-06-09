import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { Text } from '@/components/ui';
import { extractReferenceFromUrl } from '@/services/paystack/paystack';
import { spacing } from '@/constants/theme';

type PaystackCheckoutModalProps = {
  visible: boolean;
  authorizationUrl: string;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onFailure: (message: string, cancelled?: boolean) => void;
};

const SUCCESS_PATTERNS = ['reference=', 'trxref=', '/success', 'paystack.co/close'];

export function PaystackCheckoutModal({
  visible,
  authorizationUrl,
  onClose,
  onSuccess,
  onFailure,
}: PaystackCheckoutModalProps) {
  const styles = useAppThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    if (visible && authorizationUrl) {
      setLoading(true);
      handledRef.current = false;
    }
  }, [visible, authorizationUrl]);

  const handleNavigation = useCallback(
    (nav: WebViewNavigation) => {
      const url = nav.url;
      if (handledRef.current) return;

      const isCallback =
        url.startsWith('olivesforum://') ||
        SUCCESS_PATTERNS.some((p) => url.includes(p));

      if (!isCallback) return;

      const reference = extractReferenceFromUrl(url);
      if (reference) {
        handledRef.current = true;
        onSuccess(reference);
        return;
      }

      if (url.includes('close') || url.startsWith('olivesforum://')) {
        handledRef.current = true;
        onFailure('Payment was cancelled', true);
      }
    },
    [onSuccess, onFailure],
  );

  const handleClose = () => {
    if (!handledRef.current) {
      handledRef.current = true;
      onFailure('Payment was cancelled', true);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <Ionicons name="lock-closed" size={18} color={colors.primary} />
            <Text style={styles.toolbarTitle}>Secure checkout</Text>
          </View>
          <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.webviewWrap}>
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text muted style={styles.loadingText}>
                Loading Paystack…
              </Text>
            </View>
          ) : null}
          <WebView
            source={{ uri: authorizationUrl }}
            onLoadEnd={() => setLoading(false)}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress >= 0.9) setLoading(false);
            }}
            onError={() => {
              setLoading(false);
              if (!handledRef.current) {
                handledRef.current = true;
                onFailure('Could not load Paystack checkout. Check your connection and try again.');
              }
            }}
            onHttpError={() => setLoading(false)}
            onNavigationStateChange={handleNavigation}
            originWhitelist={['https://*', 'http://*']}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
    backgroundColor: cvDocsTheme.barBg,
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toolbarTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cvDocsTheme.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 1,
  },
  loadingText: { fontSize: 13 },
});
}
