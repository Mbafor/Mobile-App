import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { TextArea } from '@/components/ui/TextArea';
import { spacing } from '@/constants/theme';
import { adminApi } from '@/services/api';
import { parseOpportunityPaste } from '@/features/admin/utils/parse-opportunity-paste';
import {
  PREDEFINED_OPPORTUNITY_CATEGORIES,
  PREDEFINED_OPPORTUNITY_TAGS,
} from '@/constants/opportunity-fields';

const EXAMPLE = `[
  {
    "title": "Summer Research Internship",
    "organization": "TechBridge Labs",
    "description": "A 12-week program focused on AI research and product development for students passionate about technology and innovation.",
    "deadline": "2026-12-31",
    "applyUrl": "https://techbridgelabs.com/apply",
    "imageUrl": "https://example.com/banner.jpg",
    "category": "Internship",
    "country": "South Africa",
    "tags": ["Technology & Innovation", "Data & Analytics"],
    "fundingType": "fully_funded",
    "degreeLevels": ["bachelors", "masters"],
    "locationType": "hybrid"
  }
]`;

const FIELD_REFERENCE: { key: string; hasNote: boolean; values: string[] }[] = [
  {
    key: 'category',
    hasNote: false,
    values: PREDEFINED_OPPORTUNITY_CATEGORIES,
  },
  {
    key: 'tags',
    hasNote: false,
    values: PREDEFINED_OPPORTUNITY_TAGS,
  },
  {
    key: 'fundingType',
    hasNote: true,
    values: ['fully_funded', 'partially_funded', 'self_funded'],
  },
  {
    key: 'degreeLevels',
    hasNote: true,
    values: ['high_school', 'bachelors', 'masters', 'phd', 'professional'],
  },
  {
    key: 'locationType',
    hasNote: true,
    values: ['remote', 'onsite', 'hybrid'],
  },
  {
    key: 'country',
    hasNote: true,
    values: ['Ghana', 'South Africa', 'Nigeria', 'United States', 'United Kingdom', 'Global'],
  },
];

type OpportunityPasteScreenProps = {
  onDone?: () => void;
};

function FieldReference() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.refContainer}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.refHeader}>
        <Text style={styles.refTitle}>{t('admin.pasteScreen.fieldReference')} {open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={styles.refBody}>
          {FIELD_REFERENCE.map((field) => {
            const values =
              field.key === 'country'
                ? [...field.values, t('admin.pasteScreen.fieldValues.countryOther')]
                : field.values;
            return (
              <View key={field.key} style={styles.refRow}>
                <Text style={styles.refLabel}>{t(`admin.pasteScreen.fieldLabels.${field.key}`)}</Text>
                <Text style={styles.refValues}>{values.join(' | ')}</Text>
                {field.hasNote ? (
                  <Text style={styles.refNote}>{t(`admin.pasteScreen.fieldNotes.${field.key}`)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function OpportunityPasteScreen({ onDone }: OpportunityPasteScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [raw, setRaw] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    const { items, errors } = parseOpportunityPaste(raw);
    if (errors.length > 0 && items.length === 0) {
      Alert.alert(t('admin.pasteScreen.couldNotParseTitle'), errors.join('\n'));
      return;
    }
    if (items.length === 0) {
      Alert.alert(
        t('admin.pasteScreen.nothingToImportTitle'),
        t('admin.pasteScreen.nothingToImportMessage'),
      );
      return;
    }

    setImporting(true);
    let ok = 0;
    const fail: string[] = [...errors];

    for (let i = 0; i < items.length; i++) {
      const { data, error } = await adminApi.createOpportunity(items[i]);
      if (error || !data) {
        fail.push(
          t('admin.pasteScreen.rowCreateFailed', {
            row: i + 1,
            error: error?.message ?? t('admin.pasteScreen.rowCreateFailedFallback'),
          }),
        );
      } else {
        ok += 1;
      }
    }

    setImporting(false);
    setResult(t('admin.pasteScreen.importedSummary', { ok, total: items.length }));
    if (fail.length > 0) {
      Alert.alert(t('admin.pasteScreen.importFinishedIssuesTitle'), fail.slice(0, 5).join('\n'));
    } else {
      Alert.alert(t('admin.pasteScreen.successTitle'), t('admin.pasteScreen.successMessage', { count: ok }));
      onDone?.();
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('admin.pasteScreen.title')}</Text>

        <Text muted style={styles.hint}>
          {t('admin.pasteScreen.hint')
            .split(/<bold>(.*?)<\/bold>/g)
            .map((part, index) =>
              index % 2 === 1 ? (
                <Text key={index} style={styles.bold}>
                  {part}
                </Text>
              ) : (
                part
              ),
            )}
        </Text>

        <FieldReference />

        <TextArea
          value={raw}
          onChangeText={setRaw}
          placeholder={EXAMPLE}
          minHeight={260}
          style={styles.textarea}
        />

        <View style={styles.actions}>
          <Button variant="ghost" onPress={() => setRaw(EXAMPLE)}>
            {t('admin.pasteScreen.loadExample')}
          </Button>
          <Button onPress={() => void handleImport()} loading={importing} disabled={!raw.trim()}>
            {t('admin.pasteScreen.importButton')}
          </Button>
        </View>

        {result ? <Text style={styles.result}>{result}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    hint: { lineHeight: 22 },
    bold: { fontWeight: '600', color: colors.text },
    textarea: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
    result: { color: colors.primary, fontWeight: '600' },
    refContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    refHeader: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    refTitle: { fontWeight: '600', color: colors.text, fontSize: 13 },
    refBody: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    refRow: { gap: 2 },
    refLabel: { fontWeight: '700', fontSize: 12, color: colors.primary },
    refValues: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    refNote: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic' },
  });
}
