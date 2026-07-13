import * as ImagePicker from 'expo-image-picker';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { avatarApi } from '@/services/api/avatar.api';

const AVATAR_SIZE = 112;

type ProfileAvatarProps = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  onAvatarUpdated: (url: string) => void;
};

function avatarInitial(displayName: string | null): string {
  const trimmed = displayName?.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function ProfileAvatar({
  userId,
  displayName,
  avatarUrl,
  onAvatarUpdated,
}: ProfileAvatarProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handlePress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profile.avatar.permissionTitle'), t('profile.avatar.permissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setUploading(true);
    try {
      const { publicUrl, error } = await avatarApi.uploadFromUri(userId, result.assets[0].uri);
      if (error || !publicUrl) {
        Alert.alert(t('profile.avatar.uploadFailed'), error?.message ?? t('profile.avatar.uploadError'));
        return;
      }
      onAvatarUpdated(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => void handlePress()}
        disabled={uploading}
        style={styles.pressable}
        accessibilityLabel={t('profile.avatar.changePhoto')}
        accessibilityRole="button"
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.initial}>{avatarInitial(displayName)}</Text>
          </View>
        )}
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.textOnPrimary} />
          </View>
        ) : null}
      </Pressable>
      <Text muted variant="caption" style={styles.hint}>
        {t('profile.avatar.tapToChange')}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: spacing.md },
  pressable: { position: 'relative' },
  image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.textOnPrimary,
    fontSize: 44,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { marginTop: spacing.xs },
});
}
