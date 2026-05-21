import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="title">{title}</Text>
      {description ? <Text muted>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
});
