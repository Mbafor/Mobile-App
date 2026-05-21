import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { CVContent } from '@/types/domain/cv';

export function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function PreviewSection({
  title,
  children,
  titleStyle,
  containerStyle,
}: {
  title: string;
  children: ReactNode;
  titleStyle?: object;
  containerStyle?: object;
}) {
  if (!children) return null;
  return (
    <View style={[styles.section, containerStyle]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      {children}
    </View>
  );
}

export function PreviewEntry({
  heading,
  subheading,
  meta,
  body,
  headingStyle,
  bodyStyle,
}: {
  heading: string;
  subheading?: string;
  meta?: string;
  body?: string;
  headingStyle?: object;
  bodyStyle?: object;
}) {
  if (!hasText(heading) && !hasText(body)) return null;
  return (
    <View style={styles.entry}>
      {hasText(heading) ? <Text style={[styles.entryHeading, headingStyle]}>{heading}</Text> : null}
      {hasText(subheading) ? (
        <Text style={styles.entrySub}>{subheading}</Text>
      ) : null}
      {hasText(meta) ? <Text style={styles.entryMeta}>{meta}</Text> : null}
      {hasText(body) ? <Text style={[styles.entryBody, bodyStyle]}>{body}</Text> : null}
    </View>
  );
}

export function buildContactLine(content: CVContent): string {
  const { personalInfo: p } = content;
  return [p.email, p.phone, p.location, p.linkedIn, p.website]
    .filter(hasText)
    .join(' · ');
}

export function formatExperienceDates(
  start: string,
  end: string,
  currentlyWorking: boolean,
): string {
  const parts = [start, currentlyWorking ? 'Present' : end].filter(hasText);
  return parts.join(' – ');
}

const styles = StyleSheet.create({
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entry: { marginBottom: 8 },
  entryHeading: { fontSize: 13, fontWeight: '600' },
  entrySub: { fontSize: 12, marginTop: 1 },
  entryMeta: { fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  entryBody: { fontSize: 11, marginTop: 3, lineHeight: 16 },
});
