import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View, Text as RNText } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Line, Rect } from 'react-native-svg';

import { ResponsiveContainer } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { AuthDivider } from '@/features/auth/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { ErrorMessage } from '@/components/feedback';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

// ─── Olive branch illustration ───────────────────────────────────────────────
function OliveBranchIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 340"
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect width="390" height="340" fill="#0F2018" />

      {/* Ambient glow circles */}
      <Circle cx="195" cy="90" r="160" fill="#1A3D25" opacity="0.5" />
      <Circle cx="195" cy="90" r="110" fill="#1A3D25" opacity="0.4" />
      <Ellipse cx="130" cy="200" rx="80" ry="30" fill="#2A5C35" opacity="0.15" />
      <Ellipse cx="260" cy="180" rx="60" ry="22" fill="#2A5C35" opacity="0.12" />

      {/* Stem */}
      <Line
        x1="195"
        y1="40"
        x2="195"
        y2="180"
        stroke="#2D6040"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Leaves */}
      <Ellipse
        cx="170"
        cy="75"
        rx="22"
        ry="10"
        fill="#3D7A50"
        opacity="0.7"
        rotation="-30"
        originX="170"
        originY="75"
      />
      <Ellipse
        cx="220"
        cy="100"
        rx="22"
        ry="10"
        fill="#3D7A50"
        opacity="0.7"
        rotation="30"
        originX="220"
        originY="100"
      />
      <Ellipse
        cx="162"
        cy="118"
        rx="18"
        ry="8"
        fill="#3D7A50"
        opacity="0.5"
        rotation="-45"
        originX="162"
        originY="118"
      />
      <Ellipse
        cx="228"
        cy="138"
        rx="18"
        ry="8"
        fill="#3D7A50"
        opacity="0.5"
        rotation="45"
        originX="228"
        originY="138"
      />

      {/* Olives */}
      <Circle cx="170" cy="75" r="4" fill="#8BC99A" opacity="0.5" />
      <Circle cx="221" cy="100" r="4" fill="#8BC99A" opacity="0.5" />
      <Circle cx="162" cy="120" r="3" fill="#8BC99A" opacity="0.4" />
      <Circle cx="228" cy="138" r="3" fill="#8BC99A" opacity="0.4" />
      <Circle cx="195" cy="165" r="3.5" fill="#8BC99A" opacity="0.6" />

      {/* Corner glow blobs */}
      <Circle cx="280" cy="260" r="60" fill="#1A3D25" opacity="0.2" />
      <Circle cx="80" cy="290" r="50" fill="#1A3D25" opacity="0.15" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Removed Apple auth completely
  const { signInWithGoogle, isLoading, error, clearError } = useAuthActions();

  useAuthRedirect('guest');

  return (
    <View style={styles.root}>
      {/* ── Hero ── */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        {/* Background illustration */}
        <View style={StyleSheet.absoluteFillObject}>
          <OliveBranchIllustration />
        </View>
        <ResponsiveContainer
          maxWidth={980}
          minHorizontalPadding={spacing.lg}
          style={styles.heroContent}
        >
          {/* Logo mark */}
          <View style={styles.logoMark}>
            <RNText style={styles.logoText}>O</RNText>
          </View>

          {/* App name badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Olives Forum</Text>
          </View>

          <Text style={styles.heroTitle}>
            Find your next{'\n'}opportunity
          </Text>

          <Text style={styles.heroTagline}>
            Matched to your interests and ambitions, globally.
          </Text>
        </ResponsiveContainer>
      </View>

      {/* ── Auth panel ── */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.xl }]}>
        <ResponsiveContainer maxWidth={980} minHorizontalPadding={spacing.lg}>
          <View style={styles.panelContent}>
            <Text style={styles.panelTitle}>Sign in to explore</Text>

            <Text style={styles.panelSubtitle}>
              Save listings, get personalised recommendations, and never miss a
              deadline.
            </Text>

            {error ? <ErrorMessage message={error} /> : null}

            <Button
              onPress={() => {
                clearError();
                void signInWithGoogle();
              }}
              loading={isLoading}
              disabled={isLoading}
              style={styles.googleBtn}
              textStyle={styles.googleBtnText}
            >
              Continue with Google
            </Button>

            <AuthDivider />

            <Button
              onPress={() => router.push(ROUTES.AUTH.EMAIL as Href)}
              disabled={isLoading}
              style={styles.emailBtn}
              textStyle={styles.emailBtnText}
            >
              Continue with email
            </Button>

            <Text style={styles.hint}>
              Sign in with your email, password, and a one-time code to confirm your account.
            </Text>
          </View>
        </ResponsiveContainer>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PANEL_RADIUS = 28;
const DARK_GREEN = '#0F2018';
const BTN_GREEN = '#1A3D25';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_GREEN,
  },

  // ── Hero ──────────────────────────────────────────────────────────
  hero: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl + spacing.md,
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '500',
  },

  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
    fontWeight: '500',
  },

  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 40,
  },

  heroTagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 22,
  },

  // ── Panel ─────────────────────────────────────────────────────────
  panel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    paddingTop: spacing.xl,
  },

  panelContent: {
    gap: spacing.sm,
  },

  panelTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
  },

  panelSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },

  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 48,
  },

  googleBtnText: {
    color: '#000',
    fontWeight: '500',
  },

  emailBtn: {
    backgroundColor: BTN_GREEN,
    borderRadius: 14,
    height: 48,
  },

  emailBtnText: {
    color: '#fff',
    fontWeight: '500',
  },

  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});