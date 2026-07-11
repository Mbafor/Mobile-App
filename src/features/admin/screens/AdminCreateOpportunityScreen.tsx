import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useCreateOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { EMPTY_OPPORTUNITY_FORM } from '@/features/admin/types/opportunity-form';

export function AdminCreateOpportunityScreen() {
  const { isReady } = useRequireAdmin();
  const createMutation = useCreateOpportunityMutation();
  const { t } = useTranslation();

  if (!isReady) return null;

  return (
    <Screen padded={false}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text muted variant="caption">
            {t('admin.createScreen.hint')}
          </Text>
        </View>
        <OpportunityForm
          initialValues={EMPTY_OPPORTUNITY_FORM}
          submitLabel={t('admin.createScreen.submitLabel')}
          loading={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
});
