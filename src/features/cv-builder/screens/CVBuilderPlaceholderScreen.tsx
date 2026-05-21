import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export function CVBuilderPlaceholderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const cvId = typeof params.id === 'string' ? params.id : params.id?.[0];

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">CV Builder</Text>
        <Text muted>
          The full CV editor will be added in the next step. You can return to your CV list from
          here.
        </Text>
        {cvId ? (
          <Text muted variant="caption">
            CV id: {cvId}
          </Text>
        ) : null}
        <Button variant="secondary" onPress={() => router.back()}>
          Back to CV list
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingTop: spacing.md },
});
