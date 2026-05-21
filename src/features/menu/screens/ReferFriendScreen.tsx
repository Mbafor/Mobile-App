import { Alert, Share, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { REFERRAL_MESSAGE } from '@/constants/app';
import { spacing } from '@/constants/theme';

export function ReferFriendScreen() {
  const handleShare = async () => {
    try {
      await Share.share({ message: REFERRAL_MESSAGE });
    } catch {
      Alert.alert('Share failed', 'Could not open the share sheet.');
    }
  };

  return (
    <Screen>
      <Text variant="title">Refer a friend</Text>
      <Text muted style={styles.subtitle}>
        Share Olives Forum with classmates and friends looking for global opportunities.
      </Text>

      <View style={styles.messageBox}>
        <Text style={styles.message}>{REFERRAL_MESSAGE}</Text>
      </View>

      <Button onPress={() => void handleShare()}>Share invite</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginBottom: spacing.lg },
  messageBox: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: spacing.lg,
  },
  message: { lineHeight: 22, fontSize: 15 },
});
