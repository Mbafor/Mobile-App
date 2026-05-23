import { StyleSheet, View } from 'react-native';

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

  if (!isReady) return null;

  return (
    <Screen padded={false}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text muted variant="caption">
            Fill all required fields, then tap Create. Students only see listings with a future
            deadline (YYYY-MM-DD after today).
          </Text>
        </View>
        <OpportunityForm
          initialValues={EMPTY_OPPORTUNITY_FORM}
          submitLabel="Create opportunity"
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
