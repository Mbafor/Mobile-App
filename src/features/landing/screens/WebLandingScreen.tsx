import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { ResponsiveContainer } from '@/components/layout';
import { Button, Text, WebCard } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { webPressableStyle } from '@/utils/web/pressable';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  LANDING_FEATURES,
  LANDING_MENTORSHIP_POINTS,
  LANDING_OPPORTUNITY_POINTS,
} from '@/features/landing/constants/content';

const FOREST = colors.forest;
const ACCENT = '#8BC99A';

function postAuthRoute(onboardingComplete: boolean): Href {
  return (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href;
}

function LandingNav({
  onSignIn,
  onGetStarted,
  onOpenDashboard,
  isAuthenticated,
}: {
  onSignIn: () => void;
  onGetStarted: () => void;
  onOpenDashboard: () => void;
  isAuthenticated: boolean;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  return (
    <View style={styles.nav}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={[styles.navRow, isNarrow && styles.navRowNarrow]}>
          <View style={styles.navBrand}>
            <View style={styles.navLogo}>
              <Text style={styles.navLogoText}>O</Text>
            </View>
            <Text style={styles.navBrandName} numberOfLines={1}>
              Olives Forum
            </Text>
          </View>
          <View style={[styles.navActions, isNarrow && styles.navActionsNarrow]}>
            {isAuthenticated ? (
              <Button onPress={onOpenDashboard} style={styles.navCta} fullWidth={isNarrow}>
                Open dashboard
              </Button>
            ) : (
              <>
                <Pressable
                  onPress={onSignIn}
                  style={webPressableStyle(styles.navLink, styles.navLinkHover)}
                >
                  <Text style={[styles.navLinkText, getWebFontStyle('medium')]}>Sign in</Text>
                </Pressable>
                <Button onPress={onGetStarted} style={styles.navCta} fullWidth={isNarrow}>
                  Get started
                </Button>
              </>
            )}
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function HeroSection({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;
  const isDesktopWeb = useWebDesktop();

  return (
    <View style={[styles.hero, isNarrow && styles.heroNarrow]}>
      <View style={styles.heroGlowA} />
      <View style={styles.heroGlowB} />
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.lg}>
        <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
          <View style={styles.heroCopy}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Built for ambitious students</Text>
            </View>
            <Text variant={isDesktopWeb ? 'display' : 'h1'} style={styles.heroTitle}>
              Find opportunities.{'\n'}Build your future.
            </Text>
            <Text variant="bodyLg" style={styles.heroSubtitle}>
              Olives Forum matches scholarships, internships, and programs to your profile —
              with mentorship and CV tools in one place.
            </Text>
            <View style={[styles.heroCtas, isWide && styles.heroCtasWide]}>
              <Button
                onPress={onGetStarted}
                style={styles.heroPrimaryBtn}
                textStyle={styles.heroPrimaryBtnText}
                fullWidth={!isWide}
              >
                Get started free
              </Button>
              <Button
                onPress={onSignIn}
                variant="secondary"
                style={styles.heroSecondaryBtn}
                textStyle={styles.heroSecondaryBtnText}
                fullWidth={!isWide}
              >
                Sign in
              </Button>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>Global</Text>
                <Text style={styles.statLabel}>Opportunity feed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>1:1</Text>
                <Text style={styles.statLabel}>Mentorship</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>CV</Text>
                <Text style={styles.statLabel}>Builder included</Text>
              </View>
            </View>
          </View>

          {!isNarrow ? (
          <WebCard style={styles.heroCard} hoverable>
            <View style={styles.heroCardHeader}>
              <Ionicons name="sparkles-outline" size={18} color={ACCENT} />
              <Text style={styles.heroCardTitle}>Your next match</Text>
            </View>
            <View style={styles.heroCardBody}>
              <Text style={styles.heroCardOpportunity}>Climate Innovation Fellowship</Text>
              <Text style={styles.heroCardMeta}>Deadline in 12 days · Remote</Text>
              <View style={styles.heroCardTags}>
                <Text style={styles.heroCardTag}>STEM</Text>
                <Text style={styles.heroCardTag}>Graduate</Text>
              </View>
            </View>
            <View style={styles.heroCardFooter}>
              <Text style={styles.heroCardFooterText}>Personalised to your interests</Text>
            </View>
          </WebCard>
          ) : null}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function FeaturesSection() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;
  const columns = width >= 1024 ? 3 : width >= 640 ? 2 : 1;

  return (
    <View style={[styles.sectionLight, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Features</Text>
        <Text variant="h2" style={styles.sectionTitle}>
          Everything you need to compete globally
        </Text>
        <Text variant="bodyLg" style={styles.sectionSubtitle}>
          From discovery to application — stay organised and supported at every step.
        </Text>
        <View style={[styles.featureGrid, { gap: spacing.md }]}>
          {LANDING_FEATURES.map((feature) => (
            <WebCard
              key={feature.title}
              hoverable
              style={[styles.featureCard, columns === 1 && styles.featureCardFull]}
            >
              <View style={styles.featureIconWrap}>
                <Ionicons name={feature.icon} size={22} color={colors.primary} />
              </View>
              <Text variant="h3" style={styles.featureTitle}>
                {feature.title}
              </Text>
              <Text variant="bodySm" muted style={styles.featureBody}>
                {feature.description}
              </Text>
            </WebCard>
          ))}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function MentorshipSection({ onCta }: { onCta: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;

  return (
    <View style={[styles.sectionMuted, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={[styles.splitSection, isWide && styles.splitSectionWide]}>
          <View style={styles.splitCopy}>
            <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Mentorship</Text>
            <Text variant="h2" style={styles.sectionTitle}>
              Guidance from people who have been there
            </Text>
            <Text variant="bodyLg" style={styles.sectionSubtitle}>
              Connect with coaches, book sessions, and track your mentorship journey without
              leaving the platform.
            </Text>
            <Button onPress={onCta} style={styles.inlineCta}>
              Explore mentorship
            </Button>
          </View>
          <View style={styles.pointList}>
            {LANDING_MENTORSHIP_POINTS.map((point) => (
              <View key={point.title} style={styles.pointRow}>
                <View style={styles.pointIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <View style={styles.pointText}>
                  <Text style={styles.pointTitle}>{point.title}</Text>
                  <Text style={styles.pointBody}>{point.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function OpportunitiesSection({ onCta }: { onCta: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;

  return (
    <View style={[styles.sectionLight, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={[styles.splitSection, isWide && styles.splitSectionWide]}>
          <View style={styles.oppPreview}>
            {LANDING_OPPORTUNITY_POINTS.map((item, index) => (
              <WebCard
                key={item.title}
                hoverable
                style={[styles.oppCard, index > 0 && !isNarrow && styles.oppCardOffset]}
              >
                <Text variant="h3" style={styles.oppCardTitle}>
                  {item.title}
                </Text>
                <Text variant="bodySm" muted style={styles.oppCardBody}>
                  {item.description}
                </Text>
              </WebCard>
            ))}
          </View>
          <View style={styles.splitCopy}>
            <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Opportunities</Text>
            <Text variant="h2" style={styles.sectionTitle}>
              Never miss a deadline that matters
            </Text>
            <Text variant="bodyLg" style={styles.sectionSubtitle}>
              Browse categories, save listings, and track applications in one tracker built for
              busy students.
            </Text>
            <Button onPress={onCta} style={styles.inlineCta}>
              Browse opportunities
            </Button>
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function CtaSection({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  return (
    <View style={styles.ctaBand}>
      <ResponsiveContainer maxWidth={900} minHorizontalPadding={spacing.lg}>
        <Text variant="h2" style={styles.ctaTitle}>
          Ready to find your next opportunity?
        </Text>
        <Text variant="bodyLg" style={styles.ctaSubtitle}>
          Join Olives Forum and start with a personalised feed in minutes.
        </Text>
        <View style={styles.ctaButtons}>
          <Button onPress={onGetStarted} style={styles.ctaPrimary} textStyle={styles.ctaPrimaryText}>
            Get started
          </Button>
          <Button
            onPress={onSignIn}
            variant="ghost"
            style={styles.ctaGhost}
            textStyle={styles.ctaGhostText}
          >
            Sign in
          </Button>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function LandingFooter() {
  return (
    <View style={styles.footer}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.lg}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Olives Forum. All rights reserved.</Text>
      </ResponsiveContainer>
    </View>
  );
}

export function WebLandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();
  const isDesktopWeb = useWebDesktop();

  const goWelcome = () => router.push(ROUTES.AUTH.WELCOME as Href);
  const goSignIn = () => router.push(ROUTES.AUTH.EMAIL as Href);
  const goDashboard = () => router.push(postAuthRoute(onboardingComplete));

  if (!isAuthReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <LandingNav
        onSignIn={goSignIn}
        onGetStarted={goWelcome}
        onOpenDashboard={goDashboard}
        isAuthenticated={isAuthenticated}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktopWeb && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection onGetStarted={goWelcome} onSignIn={goSignIn} />
        <FeaturesSection />
        <MentorshipSection onCta={goWelcome} />
        <OpportunitiesSection onCta={goWelcome} />
        <CtaSection onGetStarted={goWelcome} onSignIn={goSignIn} />
        <LandingFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  scrollDesktop: {
    paddingBottom: spacing.xl,
  },
  nav: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: FOREST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  navBrandName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navActionsNarrow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  navLink: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  navLinkHover: {
    backgroundColor: colors.surface,
  },
  navLinkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  navCta: {
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  hero: {
    backgroundColor: FOREST,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl * 2,
    overflow: 'hidden',
  },
  heroNarrow: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sectionNarrow: {
    paddingVertical: spacing.xl,
  },
  heroGlowA: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#1A3D25',
    opacity: 0.55,
    top: -120,
    right: -80,
  },
  heroGlowB: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2D6040',
    opacity: 0.25,
    bottom: -60,
    left: -40,
  },
  heroGrid: {
    gap: spacing.xl,
  },
  heroGridWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: '#fff',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    maxWidth: 520,
  },
  heroCtas: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroCtasWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPrimaryBtn: {
    backgroundColor: '#fff',
    minWidth: 180,
  },
  heroPrimaryBtnText: {
    color: colors.primary,
  },
  heroSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    minWidth: 140,
  },
  heroSecondaryBtnText: {
    color: '#fff',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  stat: {
    gap: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.fontSize.xs,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroCard: {
    flex: 1,
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroCardTitle: {
    color: ACCENT,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  heroCardBody: {
    gap: spacing.xs,
  },
  heroCardOpportunity: {
    color: '#fff',
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    lineHeight: 28,
  },
  heroCardMeta: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: typography.fontSize.sm,
  },
  heroCardTags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroCardTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.fontSize.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  heroCardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: spacing.sm,
  },
  heroCardFooterText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: typography.fontSize.xs,
  },
  sectionLight: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xl * 1.75,
  },
  sectionMuted: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl * 1.75,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.sm,
    maxWidth: 640,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    maxWidth: 600,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: 280,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  featureCardFull: {
    flexBasis: '100%',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: colors.text,
  },
  featureBody: {},
  splitSection: {
    gap: spacing.xl,
  },
  splitSectionWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  pointList: {
    flex: 1,
    gap: spacing.md,
  },
  pointRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  pointIcon: {
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    gap: 2,
  },
  pointTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  pointBody: {
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    color: colors.textMuted,
  },
  inlineCta: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  oppPreview: {
    flex: 1,
    gap: spacing.sm,
  },
  oppCard: {
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  oppCardOffset: {
    marginLeft: spacing.lg,
  },
  oppCardTitle: {
    color: colors.text,
  },
  oppCardBody: {},
  ctaBand: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaPrimary: {
    backgroundColor: '#fff',
    minWidth: 160,
  },
  ctaPrimaryText: {
    color: colors.primary,
  },
  ctaGhost: {
    minWidth: 120,
  },
  ctaGhostText: {
    color: '#fff',
  },
  footer: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});
