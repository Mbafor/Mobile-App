import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

const DEFAULT_BG = '#2D6A4F';

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
  const radius = size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
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

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
