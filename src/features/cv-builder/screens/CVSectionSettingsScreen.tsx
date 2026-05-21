import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { CVReorderSectionsModal } from '@/features/cv-builder/components/hub/CVReorderSectionsModal';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import {
  CV_SECTION_ICON_BG,
  CV_SECTION_ICON_COLOR,
  CV_SECTION_ICONS,
} from '@/features/cv-builder/constants/section-icons';
import { ALL_SECTION_IDS, type CVSectionId } from '@/features/cv-builder/constants/sections';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { colors, spacing } from '@/constants/theme';
import { isSectionEnabled } from '@/features/cv-builder/utils/section-config';

export function CVSectionSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { layout, setSectionEnabled, setSectionOrder, saveLayout, saveState } =
    useCVBuilderContext();
  const [reorderOpen, setReorderOpen] = useState(false);
  const isSaving = saveState === 'saving';

  const toggle = async (sectionId: CVSectionId, enabled: boolean) => {
    setSectionEnabled(sectionId, enabled);
    await saveLayout();
  };

  const handleReorderSave = async (order: CVSectionId[]) => {
    const personalFirst = ['personal', ...order.filter((id) => id !== 'personal')] as CVSectionId[];
    setSectionOrder(personalFirst);
    await saveLayout();
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Sections</Text>
        <Text style={styles.subtitle}>
          Turn sections on or off and change their order. Personal information is always included.
        </Text>

        <Button variant="secondary" onPress={() => setReorderOpen(true)} style={styles.reorderBtn}>
          Reorder sections
        </Button>

        <View style={styles.list}>
          {ALL_SECTION_IDS.map((sectionId, index) => {
            const enabled = isSectionEnabled(layout, sectionId);
            const isPersonal = sectionId === 'personal';
            const meta = getSectionMeta(sectionId);
            const iconName = CV_SECTION_ICONS[sectionId];

            return (
              <View
                key={sectionId}
                style={[styles.row, index < ALL_SECTION_IDS.length - 1 && styles.rowDivider]}
              >
                <View
                  style={[styles.iconWrap, { backgroundColor: CV_SECTION_ICON_BG[sectionId] }]}
                >
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={CV_SECTION_ICON_COLOR[sectionId]}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{meta.title}</Text>
                  <Text style={styles.rowCaption}>
                    {isPersonal ? 'Required' : enabled ? 'Shown on CV' : 'Hidden'}
                  </Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(v) => void toggle(sectionId, v)}
                  disabled={isPersonal || isSaving}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <CVReorderSectionsModal
        visible={reorderOpen}
        order={layout.sectionOrder as CVSectionId[]}
        disabledSections={layout.disabledSections as CVSectionId[]}
        onClose={() => setReorderOpen(false)}
        onSave={(order) => void handleReorderSave(order)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  pageTitle: { fontSize: 20, fontWeight: '500', color: colors.text, marginBottom: spacing.xs },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 20,
    fontSize: 13,
    color: cvDocsTheme.textSecondary,
  },
  reorderBtn: { marginBottom: spacing.md },
  list: {
    borderRadius: 8,
    backgroundColor: cvDocsTheme.canvasBg,
    borderWidth: 1,
    borderColor: cvDocsTheme.divider,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cvDocsTheme.divider,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontSize: 14, fontWeight: '500', color: colors.text },
  rowCaption: { fontSize: 12, color: cvDocsTheme.textSecondary },
});
