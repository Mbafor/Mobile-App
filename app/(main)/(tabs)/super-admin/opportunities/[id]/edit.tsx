import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { colors } from '@/constants/theme';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useAdminOpportunity } from '@/features/admin/hooks/useAdminOpportunities';
import { useUpdateOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { opportunityToFormValues } from '@/features/admin/types/opportunity-form';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminEditOpportunity() {
  useRequireSuperAdmin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady } = useCanManageOpportunities();
  const { data: opportunity, isLoading, error } = useAdminOpportunity(id);
  const updateMutation = useUpdateOpportunityMutation(id ?? '');

  if (!isReady || !id) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <Screen>
        <ErrorMessage message={error instanceof Error ? error.message : 'Opportunity not found'} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <OpportunityForm
        initialValues={opportunityToFormValues(opportunity)}
        submitLabel="Save changes"
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </Screen>
  );
}
