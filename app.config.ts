import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Voila',
  slug: 'Voila',
  version: '1.0.0',
  scheme: 'Voila',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  web: {
    favicon: './assets/favicon.png',
  },
  // Disabled for Expo Go — turn on for EAS dev/production builds.
  newArchEnabled: false,
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-router',
    'expo-web-browser',
    'expo-font',
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
          'Allow Voila to access your photos so you can set a profile picture and share images in mentorship chat.',
        cameraPermission:
          'Allow Voila to use your camera to take photos for mentorship chat.',
      },
    ],
    'expo-document-picker',
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
  ios: {
    bundleIdentifier: 'com.Voila.app',
    usesAppleSignIn: true,
  },
  android: {
    package: 'com.Voila.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
  },
};

export default config;
