import { useRouter, type Href } from 'expo-router';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, Text as RNText, useWindowDimensions, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Circle, Ellipse, Line, Rect, Svg } from 'react-native-svg';
import startImage from '@/assets/images/start.jpg';

import { ResponsiveContainer } from '@/components/layout';
import { Button, Text, Input } from '@/components/ui';
import { AuthDivider } from '@/features/auth/components';
import { FormField } from '@/components/forms';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { ErrorMessage } from '@/components/feedback';
import { ROUTES } from '@/constants/routes';
import { spacing, typography } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { isValidEmail } from '@/utils/validation';
import { isValidPassword } from '@/utils/validation/password';
import { useWebMobile, useWebDesktop } from '@/hooks/useWebDesktop';

type AuthMode = 'signin' | 'signup';

// ─── Olive branch illustration ───────────────────────────────────────────────
function OliveBranchIllustration() {
  const { colors } = useTheme();

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 340"
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect width="390" height="340" fill="#0F2018" />

      {/* Ambient glow circles */}
      <Circle cx="195" cy="90" r="160" fill={colors.primary} opacity="0.5" />
      <Circle cx="195" cy="90" r="110" fill={colors.primary} opacity="0.4" />
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
      <Ellipse cx="170" cy="75" rx="22" ry="10" fill="#3D7A50" opacity="0.7" rotation="-30" originX="170" originY="75" />
      <Ellipse cx="220" cy="100" rx="22" ry="10" fill="#3D7A50" opacity="0.7" rotation="30" originX="220" originY="100" />
      <Ellipse cx="162" cy="118" rx="18" ry="8" fill="#3D7A50" opacity="0.5" rotation="-45" originX="162" originY="118" />
      <Ellipse cx="228" cy="138" rx="18" ry="8" fill="#3D7A50" opacity="0.5" rotation="45" originX="228" originY="138" />

      {/* Voila */}
      <Circle cx="170" cy="75" r="4" fill="#8BC99A" opacity="0.5" />
      <Circle cx="221" cy="100" r="4" fill="#8BC99A" opacity="0.5" />
      <Circle cx="162" cy="120" r="3" fill="#8BC99A" opacity="0.4" />
      <Circle cx="228" cy="138" r="3" fill="#8BC99A" opacity="0.4" />
      <Circle cx="195" cy="165" r="3.5" fill="#8BC99A" opacity="0.6" />

      {/* Corner glow blobs */}
      <Circle cx="280" cy="260" r="60" fill={colors.primary} opacity="0.2" />
      <Circle cx="80" cy="290" r="50" fill={colors.primary} opacity="0.15" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function WelcomeScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const isWebMobile = useWebMobile();

  const isSplitLayout = isWeb && !isWebMobile;

  // Shared form state
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [googleButtonHover, setGoogleButtonHover] = useState(false);

  const {
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPasswordAndName,
    isLoading,
    error,
    clearError,
  } = useAuthActions();

  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useAuthRedirect('guest');

  // While restoring the persisted session, show a spinner instead of flashing
  // the login form at a user who is already signed in.
  if (isHydrating || isAuthenticated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B6623' }}>
        <ActivityIndicator color="rgba(255,255,255,0.5)" size="large" />
      </View>
    );
  }

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setFormError('');
    setConfirmPassword('');
    clearError();
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEmailSignIn = async () => {
    setFormError('');
    clearError();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    const result = await signInWithEmailPassword(normalized, password);
    if (!result) return;
    if (result.needsOtp) {
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(normalized)}&otpType=${result.otpType}&source=welcome` as Href);
      return;
    }
    const onboardingComplete = useAuthStore.getState().profile?.onboardingComplete ?? false;
    router.replace((onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href);
  };

  const handleSignUp = async () => {
    setFormError('');
    clearError();
    if (name.trim().length < 2) {
      setFormError('Enter your full name.');
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    const result = await signUpWithEmailPasswordAndName(name.trim(), normalized, password);
    if (!result) return;
    if ('accountExists' in result) {
      setMode('signin');
      setFormError('This email already has an account. Please sign in.');
      return;
    }
    if (result.needsOtp) {
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(normalized)}&otpType=${result.otpType}&source=welcome` as Href);
      return;
    }
    router.replace(ROUTES.ONBOARDING.BASIC_INFO as Href);
  };

  // ── Tab Switcher ───────────────────────────────────────────────────────────

  const tabSwitcher = (
    <View style={styles.tabContainer}>
      <Pressable
        style={[styles.tab, mode === 'signin' && styles.tabActive]}
        onPress={() => switchMode('signin')}
      >
        <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign in</Text>
      </Pressable>
      <Pressable
        style={[styles.tab, mode === 'signup' && styles.tabActive]}
        onPress={() => switchMode('signup')}
      >
        <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Create account</Text>
      </Pressable>
    </View>
  );

  // ── Form bodies ────────────────────────────────────────────────────────────

  // Sign-in form (web / web-mobile)
  const webSignInFormBody = (
    <>
      {(error || formError) ? <ErrorMessage message={error || formError} /> : null}

      <Pressable
        onPress={() => { clearError(); void signInWithGoogle(); }}
        disabled={isLoading}
        style={[styles.googleBtn, googleButtonHover && styles.googleBtnHover]}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setGoogleButtonHover(true),
          onMouseLeave: () => setGoogleButtonHover(false),
        } as any)}
      >
        <View style={styles.googleBtnContent}>
          <Ionicons name="logo-google" size={18} color={googleButtonHover ? '#fff' : '#000'} style={{ marginRight: spacing.xs }} />
          <Text style={[styles.googleBtnText, googleButtonHover && styles.googleBtnTextHover]}>Continue with Google</Text>
        </View>
      </Pressable>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <FormField label="Email address">
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@university.edu"
          editable={!isLoading}
        />
      </FormField>

      <FormField label="Password">
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          editable={!isLoading}
        />
      </FormField>

      <Button
        onPress={handleEmailSignIn}
        loading={isLoading}
        disabled={isLoading}
        style={styles.emailBtn}
        textStyle={styles.emailBtnText}
      >
        Continue
      </Button>

      <Text style={styles.hint}>
        Sign in with your email, password, and a one-time code to confirm your account.
      </Text>
    </>
  );

  // Create account form (all platforms)
  const signUpFormBody = (
    <>
      {(error || formError) ? <ErrorMessage message={error || formError} /> : null}

      <Pressable
        onPress={() => { clearError(); void signInWithGoogle(); }}
        disabled={isLoading}
        style={[styles.googleBtn, googleButtonHover && styles.googleBtnHover]}
        {...(Platform.OS === 'web' && {
          onMouseEnter: () => setGoogleButtonHover(true),
          onMouseLeave: () => setGoogleButtonHover(false),
        } as any)}
      >
        <View style={styles.googleBtnContent}>
          <Ionicons name="logo-google" size={18} color={googleButtonHover ? '#fff' : '#000'} style={{ marginRight: spacing.xs }} />
          <Text style={[styles.googleBtnText, googleButtonHover && styles.googleBtnTextHover]}>Continue with Google</Text>
        </View>
      </Pressable>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <FormField label="Full name">
        <Input
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          placeholder="Your full name"
          editable={!isLoading}
        />
      </FormField>

      <FormField label="Email address">
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@university.edu"
          editable={!isLoading}
        />
      </FormField>

      <FormField label="Password">
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          editable={!isLoading}
        />
      </FormField>

      <FormField label="Confirm password">
        <Input
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          editable={!isLoading}
        />
      </FormField>

      <Button
        onPress={handleSignUp}
        loading={isLoading}
        disabled={isLoading}
        style={styles.emailBtn}
        textStyle={styles.emailBtnText}
      >
        Create account
      </Button>

      <Text style={styles.hint}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </Text>
    </>
  );

  // ── Panel title / subtitle helper ──────────────────────────────────────────

  const panelTitle = mode === 'signin' ? 'Sign in to explore' : 'Create your account';
  const panelSubtitle =
    mode === 'signin'
      ? 'Save listings, get personalised recommendations, and never miss a deadline.'
      : 'Join thousands of African students finding scholarships and opportunities.';

  // ── Hero section (shared across all layouts) ───────────────────────────────

  const heroContent = (
    <View style={styles.heroContent}>
      <View style={styles.logoMark}>
        <RNText style={styles.logoText}>O</RNText>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Voila</Text>
      </View>
      <Text style={styles.heroTitle}>Find your next{'\n'}opportunity</Text>
      <Text style={styles.heroTagline}>Matched to your interests and ambitions, globally.</Text>
    </View>
  );

  // ── Mobile native layout ───────────────────────────────────────────────────

  if (!isWeb) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.mobileContainer}>
          <ImageBackground
            source={startImage}
            resizeMode="cover"
            style={styles.mobileHero}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay} />
            <ResponsiveContainer maxWidth={980} minHorizontalPadding={spacing.lg}>
              {heroContent}
            </ResponsiveContainer>
          </ImageBackground>

          <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.xl }]}>
            <ResponsiveContainer maxWidth={980} minHorizontalPadding={spacing.lg}>
              <View style={styles.panelContent}>
                {tabSwitcher}

                <Text style={styles.panelTitle}>{panelTitle}</Text>
                <Text style={styles.panelSubtitle}>{panelSubtitle}</Text>

                {mode === 'signin' ? (
                  <>
                    {error ? <ErrorMessage message={error} /> : null}
                    <Pressable
                      onPress={() => { clearError(); void signInWithGoogle(); }}
                      disabled={isLoading}
                      style={styles.googleBtn}
                    >
                      <View style={styles.googleBtnContent}>
                        <Ionicons name="logo-google" size={18} color="#000" style={{ marginRight: spacing.xs }} />
                        <Text style={styles.googleBtnText}>Continue with Google</Text>
                      </View>
                    </Pressable>
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
                  </>
                ) : (
                  signUpFormBody
                )}
              </View>
            </ResponsiveContainer>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Web mobile layout ──────────────────────────────────────────────────────

  if (isWebMobile) {
    return (
      <ScrollView style={[styles.root, { paddingTop: insets.top }]} contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          source={startImage}
          resizeMode="cover"
          style={styles.webMobileHero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <ResponsiveContainer maxWidth={980} minHorizontalPadding={spacing.lg}>
            {heroContent}
          </ResponsiveContainer>
        </ImageBackground>

        <View style={[styles.panel, { paddingBottom: spacing.xl }]}>
          <ResponsiveContainer maxWidth={980} minHorizontalPadding={spacing.lg}>
            <View style={styles.panelContent}>
              {tabSwitcher}

              <Text style={styles.panelTitle}>{panelTitle}</Text>
              <Text style={styles.panelSubtitle}>{panelSubtitle}</Text>

              {mode === 'signin' ? webSignInFormBody : signUpFormBody}
            </View>
          </ResponsiveContainer>
        </View>
      </ScrollView>
    );
  }

  // ── Web desktop split layout ───────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <View style={styles.splitContainer}>
        {/* Left column — image hero (stays identical in both modes) */}
        <ImageBackground
          source={startImage}
          resizeMode="cover"
          style={styles.leftColumn}
          imageStyle={styles.leftImage}
        >
          <View style={styles.leftOverlay} />
          <View style={[styles.heroContent, {
            alignItems: 'center',
            paddingTop: insets.top + spacing.lg,
            paddingHorizontal: spacing.lg,
          }]}>
            <View style={styles.logoMark}>
              <RNText style={styles.logoText}>O</RNText>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Voila</Text>
            </View>
            <Text style={[styles.heroTitle, styles.heroTitleDesktop]}>Find your next{'\n'}opportunity</Text>
            <Text style={[styles.heroTagline, styles.heroTaglineDesktop]}>Matched to your interests and ambitions, globally.</Text>
          </View>
        </ImageBackground>

        {/* Right column — auth form (switches based on mode) */}
        <ScrollView style={styles.rightColumn} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.authFormContainer, {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          }]}>
            <View style={styles.authFormContent}>
              {tabSwitcher}

              <Text style={styles.authTitle}>{panelTitle}</Text>
              <Text style={styles.authSubtitle}>{panelSubtitle}</Text>

              {mode === 'signin' ? webSignInFormBody : signUpFormBody}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PANEL_RADIUS = 28;

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.forest,
  },

  // ── Mobile App Layout ──────────────────────────────────────────
  mobileContainer: {
    flexGrow: 1,
  },
  mobileHero: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl + spacing.md,
    backgroundColor: colors.forest,
  },

  // ── Web Mobile Layout ──────────────────────────────────────────
  webMobileHero: {
    minHeight: 360,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl + spacing.md,
    backgroundColor: colors.forest,
  },

  // ── Split Layout (Web Desktop/Tablet) ──────────────────────────
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 0.5,
    flexBasis: '50%',
    width: '50%',
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rightColumn: {
    flex: 0.5,
    flexBasis: '50%',
    width: '50%',
    backgroundColor: colors.background,
  },

  authFormContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  authFormContent: {
    width: '100%',
    maxWidth: 440,
  },

  authTitle: {
    color: colors.text,
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  // ── Tab Switcher ───────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // ── Shared Elements ────────────────────────────────────────────
  heroContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
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
    color: 'rgba(255,255,255,0.95)',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },

  heroTitleDesktop: {
    fontWeight: '800',
    fontSize: 40,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },

  heroTaglineDesktop: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    maxWidth: 360,
  },

  heroImage: {
    opacity: 0.95,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 32, 24, 0.45)',
  },

  leftImage: {
    opacity: 0.98,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
  },

  leftOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },

  // ── Auth Panel (Mobile/Web Mobile) ─────────────────────────────
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

  // ── Buttons ────────────────────────────────────────────────────
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleBtnText: {
    color: colors.primary,
    fontWeight: '500',
  },

  googleBtnHover: {
    backgroundColor: colors.primary,
  },

  googleBtnTextHover: {
    color: '#fff',
  },

  emailBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
  },

  emailBtnText: {
    color: '#fff',
    fontWeight: '500',
  },

  // ── Divider ────────────────────────────────────────────────────
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },

  // ── Hints ──────────────────────────────────────────────────────
  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  });
}
