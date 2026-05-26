import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { OptionsSheet, SearchField, Text } from '@/components/ui';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { CVDocumentListItem } from '@/features/cv-builder/components/CVDocumentListItem';
import { CVRenameModal } from '@/features/cv-builder/components/CVRenameModal';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { useUserCVs } from '@/features/cv-builder/hooks/useUserCVs';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';
import type { CV } from '@/types/domain/cv';

export function CVDashboardScreen() {
  const router = useRouter();
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
      Alert.alert('Sign in required', 'Please sign in to create a CV.');
      return;
    }
    try {
      const cv = await createCV(`Untitled CV ${cvs.length + 1}`);
      router.push(ROUTES.MAIN.CV_BUILDER.hub(cv.id) as Href);
    } catch (e) {
      Alert.alert(
        'Could not create CV',
        e instanceof Error ? e.message : 'Something went wrong',
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
      Alert.alert('Title required', 'Enter a name for your CV.');
      return;
    }
    try {
      await renameCV({ cvId: renamingCv.id, title });
      closeRename();
    } catch (e) {
      Alert.alert(
        'Could not rename',
        e instanceof Error ? e.message : 'Something went wrong',
      );
    }
  };

  const handleDelete = async (cv: CV) => {
    const confirmed = await confirmAction(
      'Delete CV',
      `Delete "${cv.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(cv.id);
    try {
      await deleteCV(cv.id);
    } catch (e) {
      Alert.alert(
        'Could not delete',
        e instanceof Error ? e.message : 'Something went wrong',
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
            ? 'No results'
            : `${filteredCvs.length} ${filteredCvs.length === 1 ? 'document' : 'documents'}`}
        </Text>
      </View>
    ),
    [filteredCvs.length, searchQuery],
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your CVs…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <DrawerToggleButton tintColor={colors.text} />
          <View style={styles.appLogo}>
            <Ionicons name="document-text" size={22} color={colors.background} />
          </View>
          <Text style={styles.appTitle}>CV Builder</Text>
        </View>
        <View style={styles.appBarActions}>
          <AppHeaderActions />
          <Pressable
          onPress={() => void handleCreateNew()}
          disabled={isCreating}
          style={styles.newBtn}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="add" size={22} color={colors.primary} />
              <Text style={styles.newBtnText}>New</Text>
            </>
          )}
        </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <SearchField
          variant="docs"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search CVs"
        />
      </View>

      {error ? (
        <View style={styles.banner}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load your CVs'}
          />
        </View>
      ) : null}

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
                title="No matches"
                description={`Nothing matches "${searchQuery.trim()}". Try another search.`}
              />
            ) : (
              <View style={styles.emptyWrap}>
                <EmptyState
                  title="No CVs yet"
                  description='Tap "New" to create a blank CV — like starting a new document.'
                />
              </View>
            )
          ) : null
        }
      />

      <OptionsSheet
        visible={menuCv !== null}
        title={menuCv?.title}
        onClose={() => setMenuCv(null)}
        options={
          menuCv
            ? [
                {
                  key: 'rename',
                  label: 'Rename',
                  onPress: () => openRename(menuCv),
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  onPress: () => handleEdit(menuCv),
                },
                {
                  key: 'delete',
                  label: 'Delete',
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: cvDocsTheme.pageBg,
  },
  loadingText: { color: cvDocsTheme.textOnPage, fontSize: 14 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
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
    backgroundColor: cvDocsTheme.primaryTint,
  },
  newBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: 1,
    borderBottomColor: cvDocsTheme.divider,
    zIndex: 10,
  },
  banner: { padding: spacing.md, backgroundColor: cvDocsTheme.barBg },
  list: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  listHeader: {
    paddingHorizontal: spacing.md,
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
