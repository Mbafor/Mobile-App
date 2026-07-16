import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { OptionsSheet, SearchField, Text } from '@/components/ui';
import { CVDocumentListItem } from '@/features/cv-builder/components/CVDocumentListItem';
import { CVRenameModal } from '@/features/cv-builder/components/CVRenameModal';
import { useUserCVs } from '@/features/cv-builder/hooks/useUserCVs';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';
import type { CV } from '@/types/domain/cv';

export function CVDashboardScreen() {
  const styles = useAppThemedStyles(createStyles);
  const { colors } = useTheme();
  const isDesktopWeb = useWebDesktop();
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    cvs,
    isLoading,
    isRefetching,
    error,
    refetch,
    createCV,
    isCreating,
    deleteCV,
    renameCV,
    isRenaming,
    isDeleting,
    userId,
  } = useUserCVs();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuCv, setMenuCv] = useState<CV | null>(null);
  const [renamingCv, setRenamingCv] = useState<CV | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredCvs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cvs;
    return cvs.filter((cv) => cv.title.toLowerCase().includes(q));
  }, [cvs, searchQuery]);

  const handleCreateNew = async () => {
    if (!userId) {
      Alert.alert(t('cvBuilder.dashboard.signInRequiredTitle'), t('cvBuilder.dashboard.signInRequiredMessage'));
      return;
    }
    try {
      const cv = await createCV(t('cvBuilder.dashboard.untitledCv', { count: cvs.length + 1 }));
      router.push(ROUTES.MAIN.CV_BUILDER.hub(cv.id) as Href);
    } catch (e) {
      Alert.alert(
        t('cvBuilder.dashboard.couldNotCreateTitle'),
        e instanceof Error ? e.message : t('cvBuilder.dashboard.genericError'),
      );
    }
  };

  const handleEdit = useCallback(
    (cv: CV) => {
      router.push(ROUTES.MAIN.CV_BUILDER.hub(cv.id) as Href);
    },
    [router],
  );

  const openRename = useCallback((cv: CV) => {
    setRenamingCv(cv);
    setRenameValue(cv.title);
  }, []);

  const closeRename = useCallback(() => {
    setRenamingCv(null);
    setRenameValue('');
  }, []);

  const handleRenameSave = async () => {
    if (!renamingCv) return;
    const title = renameValue.trim();
    if (!title) {
      Alert.alert(t('cvBuilder.dashboard.titleRequiredTitle'), t('cvBuilder.dashboard.titleRequiredMessage'));
      return;
    }
    try {
      await renameCV({ cvId: renamingCv.id, title });
      closeRename();
    } catch (e) {
      Alert.alert(
        t('cvBuilder.dashboard.couldNotRenameTitle'),
        e instanceof Error ? e.message : t('cvBuilder.dashboard.genericError'),
      );
    }
  };

  const handleDelete = async (cv: CV) => {
    const confirmed = await confirmAction(
      t('cvBuilder.dashboard.deleteConfirmTitle'),
      t('cvBuilder.dashboard.deleteConfirmMessage', { title: cv.title }),
    );
    if (!confirmed) return;

    setDeletingId(cv.id);
    try {
      await deleteCV(cv.id);
    } catch (e) {
      Alert.alert(
        t('cvBuilder.dashboard.couldNotDeleteTitle'),
        e instanceof Error ? e.message : t('cvBuilder.dashboard.genericError'),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: CV }) => (
      <CVDocumentListItem
        cv={item}
        onPress={() => handleEdit(item)}
        onMenuPress={() => setMenuCv(item)}
        isRenaming={isRenaming && renamingCv?.id === item.id}
        isDeleting={isDeleting && deletingId === item.id}
      />
    ),
    [deletingId, handleEdit, isDeleting, isRenaming, renamingCv?.id],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.sectionLabel}>
          {filteredCvs.length === 0 && searchQuery.trim()
            ? t('cvBuilder.dashboard.noResults')
            : t('cvBuilder.dashboard.documentsCount', { count: filteredCvs.length })}
        </Text>
      </View>
    ),
    [filteredCvs.length, searchQuery, styles, t],
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('cvBuilder.dashboard.loadingCvs')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* App bar — full-bleed background, content centered */}
      <View style={styles.appBarOuter}>
        <View style={styles.barContent}>
          <View style={styles.appBar}>
            <View style={styles.appBarBrand}>
              {Platform.OS !== 'web' ? <DrawerToggleButton tintColor={colors.text} /> : null}
              <View style={styles.appLogo}>
                <Ionicons name="document-text" size={22} color={colors.background} />
              </View>
              <Text style={styles.appTitle}>{t('cvBuilder.dashboard.appTitle')}</Text>
            </View>
            <View style={styles.appBarActions}>
              <Pressable
                onPress={() => void handleCreateNew()}
                disabled={isCreating}
                style={styles.newBtn}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <>
                    <Ionicons name="add" size={22} color={colors.textOnPrimary} />
                    <Text style={styles.newBtnText}>{t('cvBuilder.dashboard.newButton')}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Search bar — full-bleed background, content centered */}
      <View style={styles.searchBarOuter}>
        <View style={styles.barContent}>
          <SearchField
            variant="docs"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('cvBuilder.dashboard.searchPlaceholder')}
            style={isDesktopWeb ? styles.searchDesktop : undefined}
          />
        </View>
      </View>

      {error ? (
        <View style={styles.bannerOuter}>
          <View style={styles.barContent}>
            <ErrorMessage
              message={error instanceof Error ? error.message : t('cvBuilder.dashboard.failedToLoad')}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.listContainer}>
      <FlatList
        data={filteredCvs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={cvs.length > 0 ? listHeader : null}
        style={styles.list}
        contentContainerStyle={filteredCvs.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !error ? (
            searchQuery.trim() ? (
              <EmptyState
                title={t('cvBuilder.dashboard.noMatchesTitle')}
                description={t('cvBuilder.dashboard.noMatchesDescription', { query: searchQuery.trim() })}
              />
            ) : (
              <View style={styles.emptyWrap}>
                <EmptyState
                  title={t('cvBuilder.dashboard.emptyTitle')}
                  description={t('cvBuilder.dashboard.emptyDescription')}
                />
              </View>
            )
          ) : null
        }
      />
      </View>

      <OptionsSheet
        visible={menuCv !== null}
        title={menuCv?.title}
        onClose={() => setMenuCv(null)}
        options={
          menuCv
            ? [
                {
                  key: 'rename',
                  label: t('cvBuilder.dashboard.menu.rename'),
                  onPress: () => openRename(menuCv),
                },
                {
                  key: 'edit',
                  label: t('cvBuilder.dashboard.menu.edit'),
                  onPress: () => handleEdit(menuCv),
                },
                {
                  key: 'delete',
                  label: t('cvBuilder.dashboard.menu.delete'),
                  destructive: true,
                  onPress: () => void handleDelete(menuCv),
                },
              ]
            : []
        }
      />

      <CVRenameModal
        visible={renamingCv !== null}
        currentTitle={renamingCv?.title ?? ''}
        value={renameValue}
        onChangeValue={setRenameValue}
        onClose={closeRename}
        onSave={() => void handleRenameSave()}
        saving={isRenaming}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: cvDocsTheme.pageBg,
  },
  loadingText: { color: cvDocsTheme.textOnPage, fontSize: 14 },
  barContent: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  appBarOuter: {
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  appBarBrand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appBarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  appLogo: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: { fontSize: 20, fontWeight: '500', color: colors.text },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  newBtnText: { fontSize: 14, fontWeight: '600', color: colors.textOnPrimary },
  searchBarOuter: {
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  searchDesktop: { maxWidth: 380 },
  bannerOuter: { backgroundColor: cvDocsTheme.barBg },
  listContainer: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  list: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  listHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: cvDocsTheme.pageBg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: cvDocsTheme.textOnPage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyList: { flexGrow: 1 },
  emptyWrap: { padding: spacing.lg, backgroundColor: cvDocsTheme.pageBg },
});
}
