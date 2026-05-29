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
import { Text, WebCard } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';
import { getWebFontStyle, webCardShadow } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { webPressableStyle } from '@/utils/web/pressable';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  LANDING_FEATURES,
  LANDING_MENTORSHIP_POINTS,
  LANDING_HOW_IT_WORKS,
  LANDING_TRUST_STATS,
  LANDING_PARTNERS,
  LANDING_TESTIMONIALS,
  LANDING_FAQS,
} from '@/features/landing/constants/content';

const FOREST = colors.forest;
const ACCENT = '#8BC99A';
const SURFACE_TINTED = '#F4F7F5';

// ─── Animated count-up for trust stats ───────────────────────────────────────

function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  return {
    numeric: match ? parseFloat(match[1]) : 0,
    suffix: match ? match[2] : '',
  };
}

function useCountUp(target: number, duration = 1200) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const precision = Number.isInteger(target) ? 1 : 10;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const eased = Math.min((timestamp - start) / duration, 1);
      const progress = eased < 0.5
        ? 2 * eased * eased
        : -1 + (4 - 2 * eased) * eased;
      const value = Math.round(target * progress * precision) / precision;
      setDisplayValue(value);
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    if (target <= 0) { setDisplayValue(0); return undefined; }
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
  const count = useCountUp(numeric, 1400);

  return (
    <View style={styles.trustStatCard}>
      <View style={styles.trustStatAccent} />
      <Text style={styles.trustStatValue}>{formatStatValue(count, suffix)}</Text>
      <Text style={styles.trustStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function postAuthRoute(onboardingComplete: boolean): Href {
  return (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav({
  onGetStarted,
  onOpenDashboard,
  isAuthenticated,
  scrolled,
}: {
  onGetStarted: () => void;
  onOpenDashboard: () => void;
  isAuthenticated: boolean;
  scrolled: boolean;
}) {
  const ctaStyle = webPressableStyle(styles.navCta, styles.navCtaHover);

  return (
    <View style={[
      styles.nav,
      scrolled && styles.navScrolled,
      Platform.OS === 'web' ? ({ position: 'sticky', top: 0 } as any) : {},
    ]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.navRow}>
          {/* Brand */}
          <View style={styles.navBrand}>
            <View style={styles.navLogo}>
              <Text style={styles.navLogoText}>O</Text>
            </View>
            <Text style={[styles.navBrandName, getWebFontStyle('bold')]}>Olives Forum</Text>
          </View>

          {/* Actions */}
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <Pressable onPress={onOpenDashboard} style={ctaStyle}>
                {({ hovered }: { hovered?: boolean }) => (
                  <View style={styles.navCtaInner}>
                    <Text style={hovered ? styles.navCtaTextHover : styles.navCtaText}>
                      Open dashboard
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={hovered ? '#fff' : colors.primary}
                    />
                  </View>
                )}
              </Pressable>
            ) : (
              <Pressable onPress={onGetStarted} style={ctaStyle}>
                {({ hovered }: { hovered?: boolean }) => (
                  <View style={styles.navCtaInner}>
                    <Text style={hovered ? styles.navCtaTextHover : styles.navCtaText}>
                      Get started free
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={hovered ? '#fff' : colors.primary}
                    />
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;
  const isDesktopWeb = useWebDesktop();

  const primaryBtnStyle = webPressableStyle(styles.heroPrimaryBtn, styles.heroPrimaryBtnHovered);
  const ghostBtnStyle = webPressableStyle(styles.heroGhostBtn, styles.heroGhostBtnHovered);

  return (
    <View style={[styles.hero, isNarrow && styles.heroNarrow]}>
      {/* Background glows */}
      <View style={styles.heroGlowA} />
      <View style={styles.heroGlowB} />
      <View style={styles.heroGlowC} />

      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.lg}>
        <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
          {/* Copy */}
          <View style={styles.heroCopy}>
            {/* Badge */}
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadgeDot} />
              <Text style={[styles.heroBadgeText, getWebFontStyle('semibold')]}>
                Built for ambitious students
              </Text>
            </View>

            {/* Headline */}
            <Text
              variant={isDesktopWeb ? 'display' : 'h1'}
              style={[styles.heroTitle, getWebFontStyle('bold')]}
            >
              Find opportunities.{'\n'}
              <Text style={styles.heroTitleAccent}>Build your future.</Text>
            </Text>

            {/* Subtitle */}
            <Text variant="bodyLg" style={styles.heroSubtitle}>
              Olives Forum matches scholarships, internships, and programs to your profile —
              with mentorship and CV tools in one place.
            </Text>

            {/* CTA buttons */}
            <View style={[styles.heroCtas, isWide && styles.heroCtasWide]}>
              <Pressable onPress={onGetStarted} style={primaryBtnStyle}>
                {({ hovered }: { hovered?: boolean }) => (
                  <View style={styles.heroBtnInner}>
                    <Text style={hovered ? styles.heroPrimaryBtnTextHovered : styles.heroPrimaryBtnText}>
                      Get started free
                    </Text>
                    <Ionicons
                      name="arrow-forward-circle"
                      size={18}
                      color={hovered ? '#fff' : colors.primary}
                    />
                  </View>
                )}
              </Pressable>
              <Pressable style={ghostBtnStyle}>
                {({ hovered }: { hovered?: boolean }) => (
                  <Text style={hovered ? styles.heroGhostBtnTextHovered : styles.heroGhostBtnText}>
                    See how it works
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Social proof */}
            <View style={styles.heroSocialProof}>
              <View style={styles.avatarStack}>
                {['A', 'C', 'N', 'K'].map((initial, i) => (
                  <View
                    key={initial}
                    style={[styles.avatarBubble, { marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i }]}
                  >
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.heroSocialProofText}>
                Joined by <Text style={styles.heroSocialProofBold}>24,000+</Text> students across Africa
              </Text>
            </View>

            {/* Stats strip */}
            <View style={styles.heroStats}>
              {[
                { value: 'Global', label: 'Feed' },
                { value: '1:1', label: 'Mentorship' },
                { value: 'Free', label: 'CV Builder' },
              ].map((stat, i) => (
                <View key={stat.label} style={styles.heroStatItem}>
                  {i > 0 && <View style={styles.statDivider} />}
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Product image */}
          {!isNarrow && (
            <View style={styles.heroImage}>
              <Image
                source={require('../Images/product.png')}
                style={styles.heroImageContent}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Trust ────────────────────────────────────────────────────────────────────

function TrustSection() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={styles.trustSection}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>By the numbers</Text>
        </View>
        <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
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
          <Text style={styles.partnerLabel}>Trusted by</Text>
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

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  return (
    <View style={[styles.sectionLight, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Features</Text>
        </View>
        <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
          Everything you need to compete globally
        </Text>
        <Text variant="bodyLg" style={styles.sectionSubtitle}>
          From discovery to application — stay organised and supported at every step.
        </Text>
        <View style={styles.featureGrid}>
          {LANDING_FEATURES.map((feature) => (
            <WebCard
              key={feature.title}
              hoverable
              style={styles.featureCard}
            >
              <View style={styles.featureIconWrap}>
                <Ionicons name={feature.icon} size={22} color={colors.primary} />
              </View>
              <Text variant="h3" style={[styles.featureTitle, getWebFontStyle('semibold')]}>
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

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <View style={styles.sectionMuted}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>How it works</Text>
        </View>
        <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
          Get matched in three simple steps.
        </Text>
        <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
          {LANDING_HOW_IT_WORKS.map((step, index) => (
            <View key={step.title} style={[styles.stepWrapper, isWide && styles.stepWrapperWide]}>
              <WebCard hoverable style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={[styles.stepNumber, getWebFontStyle('bold')]}>{step.step}</Text>
                </View>
                <Text variant="h3" style={[styles.stepTitle, getWebFontStyle('semibold')]}>{step.title}</Text>
                <Text variant="bodySm" muted style={styles.stepDescription}>{step.description}</Text>
              </WebCard>
              {isWide && index < LANDING_HOW_IT_WORKS.length - 1 && (
                <View style={styles.stepConnector}>
                  <Ionicons name="arrow-forward" size={20} color={ACCENT} />
                </View>
              )}
            </View>
          ))}
        </View>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Mentorship ───────────────────────────────────────────────────────────────

function MentorshipSection({ onCta }: { onCta: () => void }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isNarrow = width < 640;

  return (
    <View style={[styles.sectionLight, isNarrow && styles.sectionNarrow]}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={[styles.splitSection, isWide && styles.splitSectionWide]}>
          {/* Image side */}
          <View style={styles.mentorshipImageWrap}>
            <Image
              source={require('../Images/mentorship.jpg')}
              style={styles.mentorshipImage}
              resizeMode="cover"
            />
            <View style={styles.mentorshipImageOverlay} />
            <View style={styles.mentorshipBadge}>
              <Ionicons name="people" size={16} color="#fff" />
              <Text style={styles.mentorshipBadgeText}>1:1 Mentorship</Text>
            </View>
          </View>

          {/* Copy side */}
          <View style={styles.splitCopy}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Mentorship</Text>
            </View>
            <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
              Guidance from people who have been there
            </Text>
            <Text variant="bodyLg" style={styles.sectionSubtitle}>
              Connect with coaches, book sessions, and track your mentorship journey without
              leaving the platform.
            </Text>

            <View style={styles.pointList}>
              {LANDING_MENTORSHIP_POINTS.map((point) => (
                <View key={point.title} style={styles.pointRow}>
                  <View style={styles.pointIconWrap}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                  <View style={styles.pointText}>
                    <Text style={[styles.pointTitle, getWebFontStyle('semibold')]}>{point.title}</Text>
                    <Text style={styles.pointBody}>{point.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={onCta}
              style={webPressableStyle(styles.inlineCta, styles.inlineCtaHover)}
            >
              {({ hovered }: { hovered?: boolean }) => (
                <View style={styles.heroBtnInner}>
                  <Text style={hovered ? styles.inlineCtaTextHover : styles.inlineCtaText}>
                    Explore mentorship
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={hovered ? '#fff' : '#fff'}
                  />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const { width } = useWindowDimensions();
  const columns = width >= 1024 ? 3 : width >= 720 ? 2 : 1;

  return (
    <View style={styles.sectionMuted}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.md}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>Success stories</Text>
        </View>
        <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
          Students and mentors finding momentum together.
        </Text>
        <View style={[
          styles.testimonialGrid,
          { flexDirection: columns === 1 ? 'column' : 'row' },
        ]}>
          {LANDING_TESTIMONIALS.map((testimonial) => (
            <WebCard key={testimonial.name} hoverable style={styles.testimonialCard}>
              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={14} color="#F59E0B" />
                ))}
              </View>

              {/* Quote */}
              <Text style={[styles.testimonialQuote, getWebFontStyle('regular')]}>
                {testimonial.quote}
              </Text>

              {/* Author */}
              <View style={styles.testimonialAuthorRow}>
                <View style={[
                  styles.testimonialAvatar,
                  { backgroundColor: AVATAR_COLORS[testimonial.name.charCodeAt(0) % AVATAR_COLORS.length] },
                ]}>
                  <Text style={styles.testimonialAvatarText}>{testimonial.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.testimonialName, getWebFontStyle('semibold')]}>{testimonial.name}</Text>
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

const AVATAR_COLORS = ['#1A3D25', '#2D6040', '#3D7A50', '#8BC99A'];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hoverStyle = webPressableStyle(styles.faqHeader, styles.faqHeaderHover);

  return (
    <View style={styles.faqItem}>
      <Pressable style={hoverStyle} onPress={() => setIsOpen(!isOpen)}>
        <Text style={[styles.faqQuestion, getWebFontStyle('semibold')]}>{question}</Text>
        <View style={[styles.faqChevron, isOpen && styles.faqChevronOpen]}>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </View>
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
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={[styles.sectionEyebrow, getWebFontStyle('semibold')]}>FAQ</Text>
        </View>
        <Text variant="h2" style={[styles.sectionTitle, getWebFontStyle('bold')]}>
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

// ─── CTA band ─────────────────────────────────────────────────────────────────

function CtaSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ctaStyle = webPressableStyle(styles.ctaPrimary, styles.ctaPrimaryHover);

  return (
    <View style={styles.ctaBand}>
      <View style={styles.ctaGlowLeft} />
      <View style={styles.ctaGlowRight} />
      <ResponsiveContainer maxWidth={820} minHorizontalPadding={spacing.lg}>
        <Text variant="h2" style={[styles.ctaTitle, getWebFontStyle('bold')]}>
          Ready to find your next opportunity?
        </Text>
        <Text variant="bodyLg" style={styles.ctaSubtitle}>
          Join Olives Forum and start with a personalised feed in minutes.
        </Text>
        <View style={styles.ctaButtons}>
          <Pressable onPress={onGetStarted} style={ctaStyle}>
            {({ hovered }: { hovered?: boolean }) => (
              <View style={styles.heroBtnInner}>
                <Text style={hovered ? styles.ctaPrimaryTextHover : styles.ctaPrimaryText}>
                  Get started — it's free
                </Text>
                <Ionicons
                  name="arrow-forward-circle"
                  size={18}
                  color={hovered ? colors.primary : colors.primary}
                />
              </View>
            )}
          </Pressable>
        </View>
        <Text style={styles.ctaFootnote}>No credit card required · Free for students</Text>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  return (
    <View style={styles.footer}>
      <ResponsiveContainer maxWidth={1200} minHorizontalPadding={spacing.lg}>
        <View style={[styles.footerGrid, isNarrow && styles.footerGridNarrow]}>
          {/* Brand column */}
          <View style={styles.footerBrandCol}>
            <View style={styles.footerLogoRow}>
              <View style={styles.footerLogoMark}>
                <Text style={styles.footerLogoText}>O</Text>
              </View>
              <Text style={[styles.footerBrand, getWebFontStyle('bold')]}>Olives Forum</Text>
            </View>
            <Text style={styles.footerTagline}>
              Building career confidence for African students and young professionals.
            </Text>
            <View style={styles.socialRow}>
              {[
                { icon: 'logo-twitter' as const, label: 'Twitter' },
                { icon: 'logo-linkedin' as const, label: 'LinkedIn' },
                { icon: 'logo-instagram' as const, label: 'Instagram' },
              ].map(({ icon, label }) => (
                <Pressable
                  key={label}
                  style={webPressableStyle(styles.socialBtn, styles.socialBtnHover)}
                  accessibilityLabel={label}
                >
                  {({ hovered }: { hovered?: boolean }) => (
                    <Ionicons
                      name={icon}
                      size={18}
                      color={hovered ? colors.primary : colors.textMuted}
                    />
                  )}
                </Pressable>
              ))}
            </View>
            <View style={styles.appLinks}>
              <Pressable style={webPressableStyle(styles.appBtn, styles.appBtnHover)}>
                {({ hovered }: { hovered?: boolean }) => (
                  <>
                    <Ionicons name="logo-google-playstore" size={18} color={hovered ? colors.primary : colors.textMuted} />
                    <View>
                      <Text style={styles.appBtnSmall}>Get it on</Text>
                      <Text style={[styles.appBtnStore, getWebFontStyle('semibold')]}>Google Play</Text>
                    </View>
                  </>
                )}
              </Pressable>
              <Pressable style={webPressableStyle(styles.appBtn, styles.appBtnHover)}>
                {({ hovered }: { hovered?: boolean }) => (
                  <>
                    <Ionicons name="logo-apple" size={18} color={hovered ? colors.primary : colors.text} />
                    <View>
                      <Text style={styles.appBtnSmall}>Download on</Text>
                      <Text style={[styles.appBtnStore, getWebFontStyle('semibold')]}>App Store</Text>
                    </View>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* Product column */}
          <View style={styles.footerLinkCol}>
            <Text style={[styles.footerHeading, getWebFontStyle('semibold')]}>Product</Text>
            {['Opportunities', 'Mentorship', 'CV Builder', 'Tracker', 'Notifications'].map((link) => (
              <Text key={link} style={styles.footerLink}>{link}</Text>
            ))}
          </View>

          {/* Company column */}
          <View style={styles.footerLinkCol}>
            <Text style={[styles.footerHeading, getWebFontStyle('semibold')]}>Company</Text>
            {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
              <Text key={link} style={styles.footerLink}>{link}</Text>
            ))}
          </View>

          {/* Legal column */}
          <View style={styles.footerLinkCol}>
            <Text style={[styles.footerHeading, getWebFontStyle('semibold')]}>Legal</Text>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <Text key={link} style={styles.footerLink}>{link}</Text>
            ))}
          </View>
        </View>

        <View style={styles.footerBottom}>
          <View style={styles.footerDivider} />
          <View style={styles.footerBottomRow}>
            <Text style={styles.footerCopy}>
              © {new Date().getFullYear()} Olives Forum. All rights reserved.
            </Text>
            <Text style={styles.footerMade}>Made with care for African students 🌿</Text>
          </View>
        </View>
      </ResponsiveContainer>
    </View>
  );
}

// ─── Root screen ──────────────────────────────────────────────────────────────

export function WebLandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, onboardingComplete } = useAuth();
  const [scrolled, setScrolled] = useState(false);

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
        scrolled={scrolled}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 40)}
        scrollEventThrottle={16}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Page shell ──────────────────────────────────────────────────
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

  // ── Nav ─────────────────────────────────────────────────────────
  nav: {
    paddingVertical: spacing.sm + 2,
    zIndex: 100,
    backgroundColor: FOREST,
  },
  navScrolled: Platform.OS === 'web' ? {
    boxShadow: '0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.3)',
  } as any : {},
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
    backgroundColor: 'rgba(139,201,154,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139,201,154,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLogoText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '700',
  },
  navBrandName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navCta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  navCtaHover: Platform.OS === 'web' ? { backgroundColor: colors.primary } as any : {},
  navCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
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

  // ── Hero ────────────────────────────────────────────────────────
  hero: {
    backgroundColor: FOREST,
    paddingBottom: spacing.xl * 2.5,
    overflow: 'hidden',
  },
  heroNarrow: {
    paddingBottom: spacing.xl * 1.5,
  },
  heroGlowA: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#1A3D25',
    opacity: 0.6,
    top: -160,
    right: -120,
  },
  heroGlowB: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#2D6040',
    opacity: 0.3,
    bottom: -100,
    left: -60,
  },
  heroGlowC: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ACCENT,
    opacity: 0.06,
    top: '30%',
    left: '40%',
  },
  heroGrid: {
    gap: spacing.xl,
    paddingTop: spacing.xl * 2.5,
  },
  heroGridWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.md,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(139,201,154,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,201,154,0.25)',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  heroBadgeText: {
    color: ACCENT,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: '#fff',
  },
  heroTitleAccent: {
    color: ACCENT,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.62)',
    maxWidth: 520,
    lineHeight: 28,
  },
  heroCtas: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  heroCtasWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroPrimaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    ...webCardShadow,
  },
  heroPrimaryBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  heroPrimaryBtnHovered: Platform.OS === 'web' ? {
    backgroundColor: colors.primary,
    boxShadow: `0 0 0 3px ${ACCENT}55`,
  } as any : {},
  heroPrimaryBtnTextHovered: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  heroGhostBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGhostBtnHovered: Platform.OS === 'web' ? {
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  } as any : {},
  heroGhostBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    fontSize: typography.fontSize.md,
  },
  heroGhostBtnTextHovered: {
    color: '#fff',
    fontWeight: '500',
    fontSize: typography.fontSize.md,
  },
  heroSocialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2D6040',
    borderWidth: 2,
    borderColor: FOREST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSocialProofText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  heroSocialProofBold: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexWrap: 'wrap',
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    color: 'rgba(255,255,255,0.45)',
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: spacing.md,
  },
  heroImage: {
    flex: 1,
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImageContent: {
    width: '100%',
    height: 560,
  },

  // ── Shared section layout ────────────────────────────────────────
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.sm,
    maxWidth: 660,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    maxWidth: 600,
    lineHeight: 28,
  },
  sectionLight: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xl * 2.5,
  },
  sectionMuted: {
    backgroundColor: SURFACE_TINTED,
    paddingVertical: spacing.xl * 2.5,
  },
  sectionNarrow: {
    paddingVertical: spacing.xl * 1.5,
  },

  // ── Trust ───────────────────────────────────────────────────────
  trustSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.xl * 2.5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    minWidth: 200,
    padding: spacing.lg,
    backgroundColor: SURFACE_TINTED,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: spacing.xs,
    ...webCardShadow,
  },
  trustStatAccent: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginBottom: spacing.xs,
  },
  trustStatValue: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
  },
  trustStatLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  partnerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  partnerLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginRight: spacing.xs,
  },
  partnerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: SURFACE_TINTED,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },

  // ── Features ────────────────────────────────────────────────────
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  featureCard: {
    flexGrow: 1,
    flexBasis: 280,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  featureTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md + 1,
  },
  featureBody: {
    lineHeight: 22,
  },

  // ── Steps ───────────────────────────────────────────────────────
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stepsGridWide: {
    flexWrap: 'nowrap',
    alignItems: 'stretch',
  },
  stepWrapper: {
    flex: 1,
    minWidth: 240,
    position: 'relative',
  },
  stepWrapperWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepConnector: {
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCard: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  stepBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepNumber: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md + 1,
  },
  stepDescription: {
    color: colors.textMuted,
    lineHeight: 22,
  },

  // ── Mentorship ──────────────────────────────────────────────────
  splitSection: {
    gap: spacing.xl * 1.5,
  },
  splitSectionWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorshipImageWrap: {
    flex: 1,
    minHeight: 320,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  mentorshipImage: {
    width: '100%',
    height: 400,
  },
  mentorshipImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,32,24,0.3)',
  },
  mentorshipBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(26,61,37,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(139,201,154,0.3)',
  },
  mentorshipBadgeText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  splitCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  pointList: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  pointRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  pointIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
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
    marginTop: spacing.md,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inlineCtaHover: Platform.OS === 'web' ? {
    backgroundColor: '#0F2018',
    boxShadow: `0 0 0 3px ${ACCENT}44`,
  } as any : {},
  inlineCtaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.md,
  },
  inlineCtaTextHover: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.md,
  },

  // ── Testimonials ────────────────────────────────────────────────
  testimonialGrid: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  testimonialCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing.xl,
    gap: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.xs,
  },
  testimonialQuote: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    lineHeight: 26,
    fontStyle: 'italic',
    flex: 1,
  },
  testimonialAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  testimonialAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  testimonialName: {
    fontWeight: '700',
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  testimonialRole: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: 1,
  },

  // ── FAQ ─────────────────────────────────────────────────────────
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
    borderRadius: 4,
  },
  faqHeaderHover: Platform.OS === 'web' ? {
    backgroundColor: SURFACE_TINTED,
  } as any : {},
  faqQuestion: {
    color: colors.text,
    fontSize: typography.fontSize.md + 1,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.md,
    lineHeight: 26,
  },
  faqChevron: {
    ...(Platform.OS === 'web' ? {
      transitionProperty: 'transform',
      transitionDuration: '200ms',
    } as any : {}),
  },
  faqChevronOpen: Platform.OS === 'web' ? {
    transform: [{ rotate: '180deg' }],
  } : {},
  faqBody: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  faqAnswer: {
    color: colors.textMuted,
    lineHeight: 28,
  },

  // ── CTA band ────────────────────────────────────────────────────
  ctaBand: {
    backgroundColor: FOREST,
    paddingVertical: spacing.xl * 2.5,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ctaGlowLeft: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primary,
    opacity: 0.6,
    left: -150,
    top: -100,
  },
  ctaGlowRight: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: ACCENT,
    opacity: 0.08,
    right: -80,
    bottom: -60,
  },
  ctaTitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  ctaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ctaPrimary: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    ...webCardShadow,
  },
  ctaPrimaryHover: Platform.OS === 'web' ? {
    backgroundColor: ACCENT,
    boxShadow: `0 0 0 4px rgba(139,201,154,0.25)`,
  } as any : {},
  ctaPrimaryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  ctaPrimaryTextHover: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  ctaFootnote: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.2,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    backgroundColor: colors.background,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  footerGridNarrow: {
    flexDirection: 'column',
  },
  footerBrandCol: {
    flex: 2,
    minWidth: 240,
    gap: spacing.sm,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  footerLogoMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: FOREST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '700',
  },
  footerBrand: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  footerTagline: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
    maxWidth: 280,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnHover: Platform.OS === 'web' ? {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  } as any : {},
  appLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  appBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appBtnHover: Platform.OS === 'web' ? {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}06`,
  } as any : {},
  appBtnSmall: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
  appBtnStore: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  footerLinkCol: {
    flex: 1,
    minWidth: 130,
    gap: spacing.sm,
  },
  footerHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  footerBottom: {
    gap: spacing.md,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerCopy: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  footerMade: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});
