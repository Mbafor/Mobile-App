import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { colors, spacing } from '@/constants/theme';

function SkeletonRow() {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.row, pulse]}>
      <View style={styles.avatar} />
      <View style={styles.content}>
        <View style={[styles.line, styles.lineShort]} />
        <View style={[styles.line, styles.lineTitle]} />
        <View style={styles.line} />
      </View>
    </Animated.View>
  );
}

export function NotificationSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  content: { flex: 1, gap: spacing.xs },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  lineShort: { width: '28%' },
  lineTitle: { width: '72%', height: 14 },
});
