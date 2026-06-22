import { useRouter, useLocalSearchParams, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View, Text as RNText, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Circle, Ellipse, Line, Path, Rect, Svg } from 'react-native-svg';
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

// ─── Google official "G" logo ─────────────────────────────────────────────────
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function WelcomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const isWebMobile = useWebMobile();

  const isSplitLayout = isWeb && !isWebMobile;

  // Pre-fill from redirect params (e.g. from EmailOtpScreen when no account found)
  const params = useLocalSearchParams<{ email?: string; switchToSignup?: string }>();

  // Shared form state
  const [mode, setMode] = useState<AuthMode>(params.switchToSignup ? 'signup' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [googleButtonHover, setGoogleButtonHover] = useState(false);

  const {
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPasswordAndName,
    sendPasswordReset,
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
    setResetSent(false);
    setConfirmPassword('');
    clearError();
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleForgotPassword = async () => {
    setFormError('');
    setResetSent(false);
    clearError();
    const target = email.trim().toLowerCase();
    if (!target || !isValidEmail(target)) {
      setFormError('Enter your email address above, then tap "Forgot password?".');
      return;
    }
    const result = await sendPasswordReset(target);
    if (result) setResetSent(true);
  };

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
          <View style={{ marginRight: spacing.xs }}><GoogleLogo size={18} /></View>
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
        <View style={styles.pwdField}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textMuted}
            editable={!isLoading}
            style={styles.pwdInput}
          />
          <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeToggleBtn} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </FormField>

      <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordRow} hitSlop={12}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </Pressable>

      {resetSent ? (
        <View style={styles.resetSentBanner}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.resetSentText}>
            Reset link sent to {email.trim()}. Check your inbox.
          </Text>
        </View>
      ) : null}

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
          <View style={{ marginRight: spacing.xs }}><GoogleLogo size={18} /></View>
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
        <View style={styles.pwdField}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textMuted}
            editable={!isLoading}
            style={styles.pwdInput}
          />
          <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeToggleBtn} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </FormField>

      <FormField label="Confirm password">
        <View style={styles.pwdField}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            placeholderTextColor={colors.textMuted}
            editable={!isLoading}
            style={styles.pwdInput}
          />
          <Pressable onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeToggleBtn} hitSlop={8}>
            <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        </View>
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
                        <View style={{ marginRight: spacing.xs }}><GoogleLogo size={18} /></View>
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
    backgroundColor: '#f1f3f4',
    borderColor: '#c8cace',
  },

  googleBtnTextHover: {
    color: colors.primary,
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

  pwdField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pwdInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
    ...Platform.select({ web: { outlineWidth: 0 } as object }),
  },
  eyeToggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.background,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  resetSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '18',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  resetSentText: {
    flex: 1,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  });
}
