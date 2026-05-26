import { StyleSheet, View } from 'react-native';

import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { ProfileHeaderMenu } from '@/features/menu/components/ProfileHeaderMenu';

/** Header right cluster: account avatar menu + notifications bell. */
export function AppHeaderActions() {
  return (
    <View style={styles.row}>
      <ProfileHeaderMenu />
      <NotificationHeaderButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
