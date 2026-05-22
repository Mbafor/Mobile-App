import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
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
      <View style={styles.header}>
        <Text variant="title">Edit opportunity</Text>
      </View>
      <OpportunityForm
        key={opportunity.id}
        initialValues={opportunityToFormValues(opportunity)}
        submitLabel="Save changes"
        loading={updateMutation.isPending}
        onSubmit={(values) => updateMutation.mutateAsync(values)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, paddingBottom: spacing.sm },
});
