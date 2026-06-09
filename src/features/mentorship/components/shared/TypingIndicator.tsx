import { useEffect, useRef } from 'react';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Animated, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type TypingIndicatorProps = {
  visible: boolean;
  peerName: string;
};

function BouncingDot({ delay }: { delay: number }) {
  const styles = useAppThemedStyles(createStyles);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(200),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY }] }]}
    />
  );
}

export function TypingIndicator({ visible, peerName }: TypingIndicatorProps) {
  const styles = useAppThemedStyles(createStyles);
  if (!visible) return null;

  const label = peerName.trim() || 'Someone';

  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        <BouncingDot delay={0} />
        <BouncingDot delay={120} />
        <BouncingDot delay={240} />
      </View>
      <Text style={styles.text}>{label} is typing…</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dots: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 14 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: mentorshipColors.textMuted,
  },
  text: { fontSize: 12, color: mentorshipColors.textMuted, fontStyle: 'italic' },
});
}
