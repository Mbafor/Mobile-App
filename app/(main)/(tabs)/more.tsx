import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="title">More</Text>

      <View style={styles.list}>
        <Pressable style={styles.item} onPress={() => router.push(ROUTES.MAIN.TABS.BROWSE as any)}>
          <Text>Browse</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push('/(main)/(tabs)/saved')}>
          <Text>Saved</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push('/(main)/(tabs)/tracker')}>
          <Text>Tracker</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push(ROUTES.ADMIN.HOME as any)}>
          <Text>Administration</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  list: { marginTop: 18 },
  item: { paddingVertical: spacing.sm },
});
