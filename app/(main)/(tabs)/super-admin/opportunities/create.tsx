import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { ROUTES } from '@/constants/routes';
import { useCreateOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { EMPTY_OPPORTUNITY_FORM } from '@/features/admin/types/opportunity-form';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminCreateOpportunity() {
  useRequireSuperAdmin();
  const { isReady } = useCanManageOpportunities();
  const createMutation = useCreateOpportunityMutation(
    ROUTES.SUPER_ADMIN.OPPORTUNITIES as import('expo-router').Href,
  );

  if (!isReady) return null;

  return (
    <Screen padded={false}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text muted variant="caption">
            Create a listing with the same form opportunity admins use.
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
  header: { padding: spacing.md, paddingBottom: spacing.sm },
});
