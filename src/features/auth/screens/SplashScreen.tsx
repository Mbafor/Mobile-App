import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { colors, spacing, typography } from '@/constants/theme';

// ─── Olive branch illustration (same language as WelcomeScreen) ───────────────
function OliveBranchIllustration() {
  return (
    <Svg width="260" height="260" viewBox="0 0 260 260">
      {/* Ambient glow */}
      <Circle cx="130" cy="130" r="120" fill="#1A3D25" opacity="0.5" />
      <Circle cx="130" cy="130" r="80" fill="#1A3D25" opacity="0.4" />

      {/* Stem */}
      <Line
        x1="130" y1="60"
        x2="130" y2="190"
        stroke="#2D6040"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Leaves */}
      <Ellipse
        cx="108" cy="95" rx="22" ry="10"
        fill="#3D7A50" opacity="0.7"
        rotation="-30" originX="108" originY="95"
      />
      <Ellipse
        cx="152" cy="118" rx="22" ry="10"
        fill="#3D7A50" opacity="0.7"
        rotation="30" originX="152" originY="118"
      />
      <Ellipse
        cx="103" cy="138" rx="18" ry="8"
        fill="#3D7A50" opacity="0.5"
        rotation="-45" originX="103" originY="138"
      />
      <Ellipse
        cx="157" cy="155" rx="18" ry="8"
        fill="#3D7A50" opacity="0.5"
        rotation="45" originX="157" originY="155"
      />

      {/* Olives */}
      <Circle cx="108" cy="95"  r="4" fill="#8BC99A" opacity="0.6" />
      <Circle cx="152" cy="118" r="4" fill="#8BC99A" opacity="0.6" />
      <Circle cx="103" cy="140" r="3" fill="#8BC99A" opacity="0.5" />
      <Circle cx="157" cy="155" r="3" fill="#8BC99A" opacity="0.5" />
      <Circle cx="130" cy="180" r="3.5" fill="#8BC99A" opacity="0.7" />
    </Svg>
  );
}

// ─── Screen (mobile/native bootstrap via app/index.tsx; web uses app/index.web.tsx) ─
export function SplashScreen() {
  const { isAuthReady } = useAuth();
  useAuthRedirect('bootstrap');

  return (
    <View style={styles.container}>

      {/* Illustration */}
      <View style={styles.illustrationWrap}>
        <OliveBranchIllustration />

        {/* Logo mark centred over illustration */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>O</Text>
        </View>
      </View>

      {/* Brand name */}
      <Text style={styles.brand}>Olives Forum</Text>

      {/* Status */}
      <View style={styles.statusWrap}>
        {!isAuthReady ? (
          <>
            <ActivityIndicator
              color="rgba(255,255,255,0.5)"
              size="small"
              style={styles.spinner}
            />
            <Text style={styles.caption}>Loading your session…</Text>
          </>
        ) : (
          <Text style={styles.caption}>Redirecting…</Text>
        )}
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F2018',
    gap: spacing.md,
    padding: spacing.lg,
  },

  illustrationWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  logoMark: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '500',
  },

  brand: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  statusWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  spinner: {
    marginBottom: spacing.xs,
  },

  caption: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.2,
  },
});