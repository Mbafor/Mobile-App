import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Olives Forum',
  slug: 'olives-forum',
  version: '1.0.0',
  scheme: 'olivesforum',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  // Disabled for Expo Go — turn on for EAS dev/production builds.
  newArchEnabled: false,
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-asset',
    'expo-secure-store',
    'expo-apple-authentication',
    [
      'expo-notifications',
      {
        color: '#2D5A3D',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Olives Forum to access your photos so you can set a profile picture.',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
  ios: {
    bundleIdentifier: 'com.olivesforum.app',
    usesAppleSignIn: true,
  },
  android: {
    package: 'com.olivesforum.app',
  },
};

export default config;
