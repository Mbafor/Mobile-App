import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { OtpInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

const RESEND_COOLDOWN_SEC = 60;
const DARK_GREEN = '#0F2018'; //  Defined to fix the reference crash
const BTN_GREEN  = '#1A3D25';
const PANEL_RADIUS = 28;

// ─── Hero background — envelope / olive motif ─────────────────────────────────
function HeroIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect width="390" height="300" fill={DARK_GREEN} />

      {/* Ambient glow */}
      <Circle cx="195" cy="80"  r="160" fill="#1A3D25" opacity="0.45" />
      <Circle cx="195" cy="80"  r="100" fill="#1A3D25" opacity="0.35" />
      <Circle cx="60"  cy="260" r="70"  fill="#1A3D25" opacity="0.18" />
      <Circle cx="330" cy="240" r="55"  fill="#1A3D25" opacity="0.15" />

      {/* Envelope body */}
      <Rect
        x="130" y="60" width="130" height="95"
        rx="10"
        fill="#1E4A2C"
        stroke="#2D6040"
        strokeWidth="1"
        opacity="0.9"
      />

      {/* Envelope flap */}
      <Line x1="130" y1="60"  x2="195" y2="108" stroke="#2D6040" strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="260" y1="60"  x2="195" y2="108" stroke="#2D6040" strokeWidth="1.2" strokeLinecap="round" />

      {/* Envelope bottom fold lines */}
      <Line x1="130" y1="155" x2="175" y2="118" stroke="#2D6040" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <Line x1="260" y1="155" x2="215" y2="118" stroke="#2D6040" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

      {/* Olive branch coming out of envelope */}
      <Line x1="238" y1="70" x2="290" y2="20" stroke="#2D6040" strokeWidth="1.4" strokeLinecap="round" />

      <Ellipse cx="262" cy="48" rx="16" ry="7" fill="#3D7A50" opacity="0.7"
        rotation="-45" originX="262" originY="48" />
      <Ellipse cx="278" cy="33" rx="14" ry="6" fill="#3D7A50" opacity="0.6"
        rotation="-45" originX="278" originY="33" />
      <Ellipse cx="252" cy="38" rx="12" ry="5" fill="#3D7A50" opacity="0.5"
        rotation="10" originX="252" originY="38" />

      <Circle cx="263" cy="48" r="3"   fill="#8BC99A" opacity="0.6" />
      <Circle cx="278" cy="33" r="2.5" fill="#8BC99A" opacity="0.55" />
      <Circle cx="253" cy="38" r="2"   fill="#8BC99A" opacity="0.5" />

      {/* Sparkle dots */}
      <Circle cx="100" cy="100" r="1.5" fill="#8BC99A" opacity="0.3" />
      <Circle cx="310" cy="130" r="1.5" fill="#8BC99A" opacity="0.25" />
      <Circle cx="80"  cy="180" r="1"   fill="#8BC99A" opacity="0.2" />
      <Circle cx="340" cy="80"  r="1"   fill="#8BC99A" opacity="0.2" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function VerifyOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const email =
    typeof params.email === 'string'
      ? decodeURIComponent(params.email).trim().toLowerCase()
      : '';

  const { isAuthenticated, onboardingComplete, isAuthReady, isProfileLoading } = useAuth();
  const { verifyEmailOtp, sendEmailOtp, isLoading, error, clearError } = useAuthActions();
  const [code, setCode]         = useState('');
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SEC);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!email) router.replace(ROUTES.AUTH.EMAIL as Href);
  }, [email, router]);

  // Already signed in (e.g. back navigation) — skip verify screen unless mid-verification.
  useEffect(() => {
    if (!isAuthReady || verified || isLoading) return;
    if (isAuthenticated && !isProfileLoading) {
      router.replace(
        (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href,
      );
    }
  }, [
    isAuthReady,
    isAuthenticated,
    isLoading,
    isProfileLoading,
    onboardingComplete,
    router,
    verified,
  ]);

  useEffect(() => {
    if (!verified || !isAuthReady || !isAuthenticated || isProfileLoading) return;
    router.replace(
      (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href,
    );
  }, [verified, isAuthReady, isAuthenticated, isProfileLoading, onboardingComplete, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleVerify = async () => {
    clearError();
    if (code.length !== 6) {
      Alert.alert('Enter code', 'Please enter the 6-digit code from your email.');
      return;
    }
    const result = await verifyEmailOtp(email, code);
    if (result) setVerified(true);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    clearError();
    const ok = await sendEmailOtp(email);
    if (ok) {
      setResendIn(RESEND_COOLDOWN_SEC);
      Alert.alert('Code sent', 'A new code has been sent to your email.');
    }
  };

  if (!email) return null;

  const waiting = verified && (!isAuthReady || !isAuthenticated || isProfileLoading);

  return (
    <AuthScreenLayout
      title="Enter your 6-digit code"
      subtitle={`Sent to ${email}`}
      onBack={() => router.replace(ROUTES.AUTH.EMAIL as Href)}
      backgroundColor={colors.background}
      backTextColor={colors.text}
    >
      <Text style={styles.panelLabel}>Your code</Text>
      <Text style={styles.panelSub}>Expires in 10 minutes.</Text>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} autoFocus />
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <Button
        onPress={handleVerify}
        loading={isLoading || waiting}
        disabled={isLoading || waiting}
        style={styles.verifyBtn}
        textStyle={styles.verifyBtnText}
      >
        {waiting ? 'Signing you in…' : 'Verify & continue'}
      </Button>

      <Pressable onPress={handleResend} disabled={resendIn > 0 || isLoading} style={styles.resend}>
        {resendIn > 0 ? (
          <Text style={styles.resendMuted}>
            Resend code in <Text style={styles.resendTimer}>{resendIn}s</Text>
          </Text>
        ) : (
          <Text style={styles.resendActive}>Resend code</Text>
        )}
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_GREEN,
  },

  // ── Hero ──────────────────────────────────────────────────────────
  hero: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.md,
  },

  heroText: {
    gap: spacing.sm,
  },

  badge: {
    alignSelf: 'flex-start',
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
    lineHeight: 40,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  heroEmail: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // ── Panel ─────────────────────────────────────────────────────────
  panel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: PANEL_RADIUS,
    borderTopRightRadius: PANEL_RADIUS,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  panelBackRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    paddingVertical: spacing.xs,
  },
  panelBack: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },

  panelLabel: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
  },
  panelSub: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },

  otpWrap: {
    marginBottom: spacing.sm,
  },

  verifyBtn: {
    backgroundColor: BTN_GREEN,
    borderRadius: 14,
    height: 50,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: typography.fontSize.md,
  },

  resend: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resendMuted: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  resendTimer: {
    color: colors.text,
    fontWeight: '500',
  },
  resendActive: {
    color: BTN_GREEN,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
});