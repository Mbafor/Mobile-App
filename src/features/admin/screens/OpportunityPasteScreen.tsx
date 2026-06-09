import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { TextArea } from '@/components/ui/TextArea';
import { spacing } from '@/constants/theme';
import { adminApi } from '@/services/api';
import { parseOpportunityPaste } from '@/features/admin/utils/parse-opportunity-paste';

const EXAMPLE = `[
  {
    "title": "Summer Research Internship",
    "organization": "TechBridge Labs",
    "deadline": "2026-12-31",
    "category": "Internship",
    "country": "United States",
    "tags": ["Technology & Innovation"],
    "fundingType": "fully_funded",
    "degreeLevels": ["Undergraduate"],
    "locationType": "hybrid"
  }
]`;

type OpportunityPasteScreenProps = {
  onDone?: () => void;
};

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
        <Text style={styles.title}>Paste opportunities</Text>
        <Text muted style={styles.hint}>
          Paste JSON for one opportunity or an array. Required fields per item: title, organization,
          deadline (YYYY-MM-DD). Optional: description, tags, country, category, fundingType,
          degreeLevels, locationType, applyUrl, imageUrl.
        </Text>
        <TextArea
          value={raw}
          onChangeText={setRaw}
          placeholder={EXAMPLE}
          minHeight={220}
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
  textarea: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  result: { color: colors.primary, fontWeight: '600' },
});
}
