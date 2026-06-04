import { StyleSheet, View } from 'react-native';

import { NotificationHeaderButton } from '@/features/notifications/components/NotificationHeaderButton';
import { ProfileHeaderMenu } from '@/features/menu/components/ProfileHeaderMenu';

/** Header right cluster — profile avatar then notification bell, flush right. */
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
    gap: 2,
  },
});
