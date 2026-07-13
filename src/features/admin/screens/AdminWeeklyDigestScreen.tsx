import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { FilterDropdown, MultiFilterDropdown } from '@/features/admin/components/FilterDropdown';
import { usePublishDigestMutation, useWeeklyDigestCandidates } from '@/features/admin/hooks/useWeeklyDigest';
import {
  buildDigestPageLink,
  buildDigestSlug,
  buildWeeklyDigestMessage,
  type DigestOpportunity,
} from '@/features/admin/utils/build-weekly-digest-message';
import type { WeeklyDigestCandidate } from '@/services/api';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

const RECENTLY_SENT_DAYS = 7;
const RED_FLAG_DAYS = 2;
const DEFAULT_NUMBER_TO_INCLUDE = 12;

type SortMode = 'soonest' | 'neverSentFirst';
type DeadlineRange = 'any' | '7' | '14' | '30';

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function wasRecentlySent(lastSentAt: string | null): boolean {
  if (!lastSentAt) return false;
  const diffDays = (Date.now() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < RECENTLY_SENT_DAYS;
}

function selectDefaultIds(candidates: WeeklyDigestCandidate[]): string[] {
  const eligible = candidates.filter((c) => !wasRecentlySent(c.lastSentAt));
  const sorted = [...eligible].sort(
    (a, b) => (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity),
  );
  return sorted.slice(0, DEFAULT_NUMBER_TO_INCLUDE).map((c) => c.id);
}

async function shareText(text: string) {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }
  await Share.share({ message: text });
}

export function AdminWeeklyDigestScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: candidates, isLoading } = useWeeklyDigestCandidates();
  const publishMutation = usePublishDigestMutation();

  const list = useMemo(() => candidates ?? [], [candidates]);

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [country, setCountry] = useState('all');
  const [deadlineRange, setDeadlineRange] = useState<DeadlineRange>('any');
  const [hideRecentlySent, setHideRecentlySent] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('soonest');
  const [numberToInclude, setNumberToInclude] = useState(String(DEFAULT_NUMBER_TO_INCLUDE));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectDefaultIds(list)));
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const c of list) if (c.category) set.add(c.category);
    return Array.from(set).sort();
  }, [list]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    for (const c of list) if (c.country) set.add(c.country);
    return Array.from(set).sort();
  }, [list]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const maxDays = deadlineRange === 'any' ? null : Number(deadlineRange);

    return list.filter((c) => {
      if (hideRecentlySent && wasRecentlySent(c.lastSentAt)) return false;
      if (categories.size > 0 && (!c.category || !categories.has(c.category))) return false;
      if (country !== 'all' && c.country !== country) return false;

      if (maxDays !== null) {
        const remaining = daysUntil(c.deadline);
        if (remaining === null || remaining > maxDays) return false;
      }

      if (query) {
        const haystack = `${c.title} ${c.organization}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [list, search, categories, country, deadlineRange, hideRecentlySent]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortMode === 'neverSentFirst') {
      arr.sort((a, b) => {
        if (a.timesSent === 0 && b.timesSent !== 0) return -1;
        if (a.timesSent !== 0 && b.timesSent === 0) return 1;
        return (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity);
      });
    } else {
      arr.sort((a, b) => (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity));
    }
    return arr;
  }, [filtered, sortMode]);

  function regenerateSelection() {
    const n = Math.min(20, Math.max(5, Number(numberToInclude) || DEFAULT_NUMBER_TO_INCLUDE));
    setSelected(new Set(sorted.slice(0, n).map((c) => c.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(cat: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const selectedCandidates = useMemo(() => sorted.filter((c) => selected.has(c.id)), [sorted, selected]);

  const previewOpportunities: DigestOpportunity[] = selectedCandidates.map((c) => ({
    id: c.id,
    title: c.title,
    organization: c.organization,
    description: c.description,
    category: c.category,
    deadline: c.deadline,
  }));

  const previewText = useMemo(() => buildWeeklyDigestMessage(previewOpportunities), [previewOpportunities]);
  const slug = useMemo(() => buildDigestSlug(), []);
  const digestUrl = buildDigestPageLink(slug);

  async function handleShare(channel: 'whatsapp' | 'facebook' | 'linkedin' | 'copy') {
    if (selectedCandidates.length === 0) return;

    await publishMutation.mutateAsync({
      opportunityIds: selectedCandidates.map((c) => c.id),
      channel,
      slug,
    });
    setPublishedSlug(slug);

    if (channel === 'whatsapp') {
      await openExternalUrl(`https://wa.me/?text=${encodeURIComponent(previewText)}`);
    } else if (channel === 'facebook') {
      await openExternalUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(digestUrl)}`);
    } else if (channel === 'linkedin') {
      await openExternalUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(digestUrl)}`);
    } else {
      await shareText(previewText);
    }
  }

  const deadlineOptions: { value: DeadlineRange; label: string }[] = [
    { value: 'any', label: t('admin.weeklyDigest.deadlineAny') },
    { value: '7', label: t('admin.weeklyDigest.deadline7') },
    { value: '14', label: t('admin.weeklyDigest.deadline14') },
    { value: '30', label: t('admin.weeklyDigest.deadline30') },
  ];

  const sortOptions: { value: SortMode; label: string }[] = [
    { value: 'soonest', label: t('admin.weeklyDigest.sortSoonest') },
    { value: 'neverSentFirst', label: t('admin.weeklyDigest.sortNeverSentFirst') },
  ];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heroTitle}>{t('admin.weeklyDigest.heroTitle')}</Text>
            <Text muted style={styles.heroSub}>
              {t('admin.weeklyDigest.heroSubtitle')}
            </Text>

            <Input
              value={search}
              onChangeText={setSearch}
              placeholder={t('admin.weeklyDigest.searchPlaceholder')}
              autoCapitalize="none"
              style={styles.searchInput}
            />

            <View style={styles.filterRow}>
              <FilterDropdown
                label={t('admin.weeklyDigest.filterCountry')}
                value={country}
                options={[
                  { value: 'all', label: t('admin.weeklyDigest.countryAll') },
                  ...allCountries.map((c) => ({ value: c, label: c })),
                ]}
                onChange={setCountry}
              />
              <FilterDropdown
                label={t('admin.weeklyDigest.filterDeadline')}
                value={deadlineRange}
                options={deadlineOptions}
                onChange={setDeadlineRange}
              />
              <FilterDropdown
                label={t('admin.weeklyDigest.filterSort')}
                value={sortMode}
                options={sortOptions}
                onChange={setSortMode}
              />
            </View>

            {allCategories.length > 0 && (
              <View style={styles.filterRow}>
                <MultiFilterDropdown
                  label={t('admin.weeklyDigest.filterCategories')}
                  values={categories}
                  options={allCategories}
                  onToggle={toggleCategory}
                />
              </View>
            )}

            <Pressable style={styles.toggleRow} onPress={() => setHideRecentlySent((v) => !v)}>
              <Text>{hideRecentlySent ? '☑' : '☐'}</Text>
              <Text style={styles.toggleLabel}>{t('admin.weeklyDigest.hideRecentlySent')}</Text>
            </Pressable>

            <View style={styles.numberRow}>
              <Text muted>{t('admin.weeklyDigest.numberToInclude')}</Text>
              <Input
                value={numberToInclude}
                onChangeText={setNumberToInclude}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
              <Pressable onPress={regenerateSelection}>
                <Text style={styles.link}>{t('admin.weeklyDigest.regenerateSelection')}</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text muted style={styles.padded}>
            {t('admin.weeklyDigest.emptyList')}
          </Text>
        }
        renderItem={({ item }) => {
          const remaining = daysUntil(item.deadline);
          const isRedFlag = remaining !== null && remaining < RED_FLAG_DAYS;
          const neverFeatured = item.timesSent === 0;
          const isSelected = selected.has(item.id);

          return (
            <Pressable style={styles.row} onPress={() => toggle(item.id)}>
              <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text muted>
                  {item.organization}
                  {item.category ? ` · ${item.category}` : ''}
                  {' · '}
                  {remaining !== null
                    ? t('admin.weeklyDigest.daysLeft', { days: remaining })
                    : t('admin.weeklyDigest.rolling')}
                </Text>
                {(isRedFlag || neverFeatured) && (
                  <View style={styles.badgeRow}>
                    {isRedFlag && <Text style={styles.redFlag}>{t('admin.weeklyDigest.closingSoon')}</Text>}
                    {neverFeatured && (
                      <Text style={styles.neverFeatured}>
                        {remaining !== null
                          ? t('admin.weeklyDigest.neverFeaturedWithDays', { days: remaining })
                          : t('admin.weeklyDigest.neverFeatured')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.previewTitle}>{t('admin.weeklyDigest.livePreview')}</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>
                {previewText || t('admin.weeklyDigest.previewPlaceholder')}
              </Text>
            </View>

            {publishedSlug && (
              <Text style={styles.published}>
                {t('admin.weeklyDigest.publishedTo', { url: digestUrl })}
              </Text>
            )}

            <View style={styles.shareRow}>
              <Button
                variant="secondary"
                disabled={selectedCandidates.length === 0 || publishMutation.isPending}
                onPress={() => void handleShare('whatsapp')}
              >
                {t('admin.weeklyDigest.shareWhatsapp')}
              </Button>
              <Button
                variant="secondary"
                disabled={selectedCandidates.length === 0 || publishMutation.isPending}
                onPress={() => void handleShare('facebook')}
              >
                {t('admin.weeklyDigest.shareFacebook')}
              </Button>
              <Button
                variant="secondary"
                disabled={selectedCandidates.length === 0 || publishMutation.isPending}
                onPress={() => void handleShare('linkedin')}
              >
                {t('admin.weeklyDigest.shareLinkedin')}
              </Button>
              <Button
                variant="ghost"
                disabled={selectedCandidates.length === 0 || publishMutation.isPending}
                onPress={() => void handleShare('copy')}
              >
                {t('admin.weeklyDigest.copy')}
              </Button>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    list: { paddingBottom: spacing.xl },
    padded: { padding: spacing.md },
    header: { padding: spacing.md, gap: spacing.sm },
    heroTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    heroSub: { marginBottom: spacing.xs },
    searchInput: { marginBottom: spacing.xs },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
    toggleLabel: { fontSize: 14 },
    numberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
    numberInput: { width: 64 },
    link: { color: colors.primary, fontWeight: '600' },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
    },
    checkbox: { fontSize: 18, marginTop: 2 },
    rowBody: { flex: 1, gap: 2 },
    rowTitle: { fontWeight: '600', fontSize: 15 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 },
    redFlag: { fontSize: 12, fontWeight: '600', color: colors.error },
    neverFeatured: { fontSize: 12, fontWeight: '600', color: '#B45309' },
    footer: { padding: spacing.md, gap: spacing.sm },
    previewTitle: { fontWeight: '600', fontSize: 15 },
    previewBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.md,
      backgroundColor: colors.surface,
    },
    previewText: { fontSize: 13, lineHeight: 20 },
    published: { color: colors.primary, fontSize: 13 },
    shareRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  });
}
