import { Image, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui/Text';


const DEFAULT_BG = colors.primary;

type UserAvatarDisplayProps = {
  displayName: string | null;
  avatarUrl: string | null;
  size?: number;
};

function avatarInitial(displayName: string | null): string {
  const trimmed = displayName?.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function UserAvatarDisplay({
  displayName,
  avatarUrl,
  size = 72,
}: UserAvatarDisplayProps) {
  const styles = useThemedStyles(createStyles);
  const radius = size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: DEFAULT_BG,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: DEFAULT_BG,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{avatarInitial(displayName)}</Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
}
