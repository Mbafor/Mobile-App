import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';

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
  LANDING_HOW_IT_WORKS,
  LANDING_TRUST_STATS,
  LANDING_PARTNERS,
  LANDING_TESTIMONIALS,
  LANDING_FAQS,
} from '@/features/landing/constants/content';

const FOREST = colors.forest;
const ACCENT = '#8BC99A';

function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  return {
    numeric: match ? parseFloat(match[1]) : 0,
    suffix: match ? match[2] : '',
  };
}

function useCountUp(target: number, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const precision = Number.isInteger(target) ? 1 : 10;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.round(target * progress * precision) / precision;
      setDisplayValue(value);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    }

    if (target <= 0) {
      setDisplayValue(0);
      return undefined;
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return displayValue;
}

function formatStatValue(value: number, suffix: string) {
  const display = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${display}${suffix}`;
}

function AnimatedTrustStat({ value, label }: { value: string; label: string }) {
  const { numeric, suffix } = useMemo(() => parseStatValue(value), [value]);
  const count = useCountUp(numeric, 1100);

  return (
    <WebCard hoverable style={styles.trustStatCard}>
      <Text style={styles.trustStatValue}>{formatStatValue(count, suffix)}</Text>
      <Text style={styles.trustStatLabel}>{label}</Text>
    </WebCard>
  );
}

function postAuthRoute(onboardingComplete: boolean): Href {
  return (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href;
}

function LandingNav({
  onGetStarted,
  onOpenDashboard,
  isAuthenticated,
}: {
  onGetStarted: () => void;
  onOpenDashboard: () => void;
  isAuthenticated: boolean;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  const btnStyle = webPressableStyle(styles.navCta, styles.navCtaHover);

  return (
    <View style={styles.nav}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.navRow}>
          <View style={styles.navBrand}>
            <View style={styles.navLogo}>
              <Text style={styles.navLogoText}>O</Text>
            </View>
            <Text style={styles.navBrandName} numberOfLines={1}>
              Olives Forum
            </Text>
          </View>
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <Pressable onPress={onOpenDashboard} style={btnStyle}>
                {({ hovered }) => (
                  <Text style={hovered ? styles.navCtaTextHover : styles.navCtaText}>
                    Open dashboard
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable onPress={onGetStarted} style={btnStyle}>
                {({ hovered }) => (
                  <Text style={hovered ? styles.navCtaTextHover : styles.navCtaText}>
                    Get started
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;
  const isDesktopWeb = useWebDesktop();

  const primaryBtnStyle = webPressableStyle(
    [styles.heroPrimaryBtn, !isWide && { alignSelf: 'stretch', width: '100%' }],
    styles.heroPrimaryBtnHovered
  );

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
              <Pressable onPress={onGetStarted} style={primaryBtnStyle}>
                {({ hovered }) => (
                  <Text style={hovered ? styles.heroPrimaryBtnTextHovered : styles.heroPrimaryBtnText}>
                    Get started free
                  </Text>
                )}
              </Pressable>
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
            <Text variant="bodySm" style={styles.heroTrustLine}>
              Trusted by ambitious students, university programs, and career partners across Africa.
            </Text>
          </View>

          {!isNarrow ? (
            <View style={styles.heroImage}>
              <Image
                source={require('../Images/product.png')}
                style={styles.heroImageContent}
                resizeMode="contain"
              />
            </View>
          ) : null}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function TrustSection() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={[styles.sectionMuted, styles.trustSection]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Trusted by learners</Text>
        <Text variant="h2" style={styles.sectionTitle}>
          Real impact for students and early-career professionals.
        </Text>
        <Text variant="bodyLg" style={styles.sectionSubtitle}>
          Olives connects talent to opportunities, mentorship, and the tools needed to build a stronger career.
        </Text>

        <View style={[styles.trustGrid, isWide && styles.trustGridWide]}>
          {LANDING_TRUST_STATS.map((stat) => (
            <AnimatedTrustStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </View>

        <View style={styles.partnerRow}>
          {LANDING_PARTNERS.map((partner) => (
            <View key={partner} style={styles.partnerChip}>
              <Text style={styles.partnerText}>{partner}</Text>
            </View>
          ))}
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

function HowItWorksSection() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={styles.sectionLight}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>How it works</Text>
        <Text variant="h2" style={styles.sectionTitle}>
          Get matched in three simple steps.
        </Text>
        <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
          {LANDING_HOW_IT_WORKS.map((step) => (
            <WebCard key={step.title} hoverable style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{step.step}</Text>
              </View>
              <Text variant="h3" style={styles.stepTitle}>{step.title}</Text>
              <Text variant="bodySm" muted style={styles.stepDescription}>{step.description}</Text>
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hoverStyle = webPressableStyle(styles.faqHeader, styles.faqHeaderHover);

  return (
    <View style={styles.faqItem}>
      <Pressable style={hoverStyle} onPress={() => setIsOpen(!isOpen)}>
        <Text variant="h3" style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>
      {isOpen && (
        <View style={styles.faqBody}>
          <Text variant="bodyLg" muted style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

function FaqSection() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  return (
    <View style={[styles.sectionLight, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>FAQ</Text>
        <Text variant="h2" style={styles.sectionTitle}>
          Got questions? We've got answers.
        </Text>
        <View style={styles.faqList}>
          {LANDING_FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function TestimonialsSection() {
  const { width } = useWindowDimensions();
  const columns = width >= 1024 ? 3 : width >= 720 ? 2 : 1;

  return (
    <View style={[styles.sectionMuted, styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Success Stories</Text>
        <Text variant="h2" style={styles.sectionTitle}>
          Students and mentors finding momentum together.
        </Text>
        <View style={[styles.testimonialGrid, { gap: spacing.xl, flexDirection: columns === 1 ? 'column' : 'row' }]}>
          {LANDING_TESTIMONIALS.map((testimonial) => (
            <WebCard key={testimonial.name} hoverable style={styles.testimonialCard}>
              <View style={styles.quoteIconWrap}>
                <Ionicons name="chatbubbles" size={24} color={colors.primary} />
              </View>
              <Text variant="bodyLg" style={styles.testimonialQuote}>
                {testimonial.quote}
              </Text>
              <View style={styles.testimonialAuthorRow}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>{testimonial.name.charAt(0)}</Text>
                </View>
                <View style={styles.testimonialMeta}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
              </View>
            </WebCard>
          ))}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function CtaSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ctaBtnStyle = webPressableStyle(styles.ctaPrimary);
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
          <Pressable onPress={onGetStarted} style={ctaBtnStyle}>
            <Text style={styles.ctaPrimaryText}>Get started</Text>
          </Pressable>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

function LandingFooter() {
  return (
    <View style={styles.footer}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.lg}>
        <View style={styles.footerGrid}>
          <View style={styles.footerColumn}>
            <Text style={styles.footerBrand}>Olives Forum</Text>
            <Text style={styles.footerText}>Building career confidence for African students and young professionals.</Text>
            <View style={styles.downloadLinks}>
              <Pressable style={styles.downloadButton}>
                <Ionicons name="logo-google-playstore" size={20} color={colors.primary} />
                <View>
                  <Text style={styles.downloadSmall}>Get it on</Text>
                  <Text style={styles.downloadStore}>Google Play</Text>
                </View>
              </Pressable>
              <Pressable style={styles.downloadButton}>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <View>
                  <Text style={styles.downloadSmall}>Download on</Text>
                  <Text style={styles.downloadStore}>App Store</Text>
                </View>
              </Pressable>
            </View>
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerHeading}>Product</Text>
            <Text style={styles.footerLink}>Opportunities</Text>
            <Text style={styles.footerLink}>Mentorship</Text>
            <Text style={styles.footerLink}>CV Builder</Text>
          </View>
          <View style={styles.footerColumn}>
            <Text style={styles.footerHeading}>Company</Text>
            <Text style={styles.footerLink}>About</Text>
            <Text style={styles.footerLink}>Contact</Text>
            <Text style={styles.footerLink}>Terms</Text>
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Olives Forum. All rights reserved.</Text>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

export function WebLandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();
  const isDesktopWeb = useWebDesktop();

  const goWelcome = () => router.push(ROUTES.AUTH.WELCOME as Href);
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
        onGetStarted={goWelcome}
        onOpenDashboard={goDashboard}
        isAuthenticated={isAuthenticated}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktopWeb && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection onGetStarted={goWelcome} />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <MentorshipSection onCta={goWelcome} />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection onGetStarted={goWelcome} />
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
    paddingVertical: spacing.sm,
    zIndex: 10,
    backgroundColor: FOREST,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: '#fff',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    paddingVertical: spacing.sm,
    minHeight: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  navCtaHover: Platform.OS === 'web' ? {
    backgroundColor: colors.primary,
  } : {},
  navCtaText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  navCtaTextHover: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  hero: {
    backgroundColor: FOREST,
    paddingBottom: spacing.xl * 2,
    overflow: 'hidden',
  },
  heroNarrow: {
    paddingBottom: spacing.xl,
  },
  sectionNarrow: {
    paddingVertical: spacing.xl,
  },
  trustSection: {
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl * 2,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  trustGridWide: {
    justifyContent: 'space-between',
  },
  trustStatCard: {
    flex: 1,
    minWidth: 220,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  trustStatValue: {
    fontSize: typography.fontSize.xl * 1.25,
    lineHeight: 38,
    fontWeight: '700',
    color: colors.text,
  },
  trustStatLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  partnerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  partnerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stepsGridWide: {
    justifyContent: 'space-between',
  },
  stepCard: {
    flex: 1,
    minWidth: 260,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  stepTitle: {
    marginTop: spacing.sm,
    color: colors.text,
  },
  stepDescription: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  testimonialGrid: {
    marginTop: spacing.xl,
  },
  testimonialCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  quoteIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  testimonialQuote: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  testimonialAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  testimonialMeta: {
    gap: 2,
  },
  testimonialName: {
    fontWeight: '700',
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  testimonialRole: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  faqList: {
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    maxWidth: 800,
    width: '100%',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  faqHeaderHover: Platform.OS === 'web' ? {
    backgroundColor: colors.surface,
  } : {},
  faqQuestion: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.md,
  },
  faqBody: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  faqAnswer: {
    color: colors.textMuted,
    lineHeight: 26,
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
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  heroGridNarrow: {
    paddingTop: spacing.xl,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPrimaryBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.fontSize.md,
  },
  heroPrimaryBtnHovered: {
    backgroundColor: colors.primary,
  },
  heroPrimaryBtnTextHovered: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.md,
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
  heroImage: {
    flex: 1,
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageContent: {
    width: '100%',
    height: 560,
    transform: [{ scale: 1.15 }],
  },
  heroTrustLine: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.sm,
    maxWidth: 500,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.fontSize.md,
  },
  ctaPrimaryHovered: {
    backgroundColor: colors.primary,
  },
  ctaPrimaryTextHovered: {
    color: '#fff',
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
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  footerColumn: {
    flex: 1,
    minWidth: 180,
    gap: spacing.xs,
  },
  footerBrand: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  footerHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  footerBottom: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  downloadLinks: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  downloadSmall: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  downloadStore: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});