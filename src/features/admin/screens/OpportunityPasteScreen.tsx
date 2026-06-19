import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

const FIELD_REFERENCE: { label: string; note?: string; values: string[] }[] = [
  {
    label: 'category',
    values: PREDEFINED_OPPORTUNITY_CATEGORIES,
  },
  {
    label: 'tags (array)',
    values: PREDEFINED_OPPORTUNITY_TAGS,
  },
  {
    label: 'fundingType',
    values: ['fully_funded', 'partially_funded', 'self_funded'],
    note: 'Aliases: "fully funded", "partial", "self funded"',
  },
  {
    label: 'degreeLevels (array)',
    values: ['high_school', 'bachelors', 'masters', 'phd', 'professional'],
    note: 'Aliases: "Undergraduate"→bachelors, "PhD"→phd, "Masters"→masters',
  },
  {
    label: 'locationType',
    values: ['remote', 'onsite', 'hybrid'],
    note: 'Aliases: "on-site"→onsite, "online"→remote, "in-person"→onsite',
  },
  {
    label: 'country',
    values: ['Ghana', 'South Africa', 'Nigeria', 'United States', 'United Kingdom', 'Global', '... any country name'],
    note: 'Case-insensitive. Use "Global" for worldwide opportunities.',
  },
];

type OpportunityPasteScreenProps = {
  onDone?: () => void;
};

function FieldReference() {
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.refContainer}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.refHeader}>
        <Text style={styles.refTitle}>Field reference {open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={styles.refBody}>
          {FIELD_REFERENCE.map((field) => (
            <View key={field.label} style={styles.refRow}>
              <Text style={styles.refLabel}>{field.label}</Text>
              <Text style={styles.refValues}>{field.values.join(' | ')}</Text>
              {field.note ? <Text style={styles.refNote}>{field.note}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function OpportunityPasteScreen({ onDone }: OpportunityPasteScreenProps) {
  const styles = useThemedStyles(createStyles);
  const [raw, setRaw] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async () => {
    const { items, errors } = parseOpportunityPaste(raw);
    if (errors.length > 0 && items.length === 0) {
      Alert.alert('Could not parse', errors.join('\n'));
      return;
    }
    if (items.length === 0) {
      Alert.alert('Nothing to import', 'Add at least one valid opportunity object.');
      return;
    }

    setImporting(true);
    let ok = 0;
    const fail: string[] = [...errors];

    for (let i = 0; i < items.length; i++) {
      const { data, error } = await adminApi.createOpportunity(items[i]);
      if (error || !data) {
        fail.push(`Row ${i + 1}: ${error?.message ?? 'Failed to create'}`);
      } else {
        ok += 1;
      }
    }

    setImporting(false);
    setResult(`Imported ${ok} of ${items.length} opportunities.`);
    if (fail.length > 0) {
      Alert.alert('Import finished with issues', fail.slice(0, 5).join('\n'));
    } else {
      Alert.alert('Success', `${ok} opportunities are now live.`);
      onDone?.();
    }
  };

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Paste opportunities (JSON)</Text>

        <Text muted style={styles.hint}>
          Paste a JSON object or array. Required: <Text style={styles.bold}>title</Text>,{' '}
          <Text style={styles.bold}>organization</Text>,{' '}
          <Text style={styles.bold}>deadline</Text> (YYYY-MM-DD).{'\n'}
          Optional: description, applyUrl, imageUrl, category, country, tags, fundingType,
          degreeLevels, locationType.{'\n'}
          Dropdown values are matched automatically — "South Africa", "Undergraduate", "on-site"
          all resolve to the correct option.
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
            Load example
          </Button>
          <Button onPress={() => void handleImport()} loading={importing} disabled={!raw.trim()}>
            Import opportunities
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
