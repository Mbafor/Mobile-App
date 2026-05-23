import { View } from 'react-native';

import { LoadingSpinner } from '@/components/feedback';
import { Text } from '@/components/ui';

/**
 * Paystack redirect target — payment is completed in the WebBrowser session before landing here.
 */
export default function PaystackCallbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <LoadingSpinner />
      <Text muted>Completing payment…</Text>
    </View>
  );
}
