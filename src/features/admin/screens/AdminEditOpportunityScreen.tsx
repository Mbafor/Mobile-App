import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { colors } from '@/constants/theme';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useAdminOpportunity } from '@/features/admin/hooks/useAdminOpportunities';
import { useUpdateOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { opportunityToFormValues } from '@/features/admin/types/opportunity-form';

export function AdminEditOpportunityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const opportunityId = typeof id === 'string' ? id : id?.[0];
  const { isReady } = useRequireAdmin();
  const { data: opportunity, isLoading, error } = useAdminOpportunity(opportunityId);
  const updateMutation = useUpdateOpportunityMutation(opportunityId ?? '');

  if (!isReady) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <Screen>
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Opportunity not found'}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ flex: 1 }}>
      <OpportunityForm
        key={opportunity.id}
        initialValues={opportunityToFormValues(opportunity)}
        submitLabel="Save changes"
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
      </View>
    </Screen>
  );
}

