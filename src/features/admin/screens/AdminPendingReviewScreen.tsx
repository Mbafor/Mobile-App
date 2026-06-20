import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { ROUTES } from '@/constants/routes';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useAdminOpportunity } from '@/features/admin/hooks/useAdminOpportunities';
import {
  useRejectOpportunityMutation,
  useUpdateAndApproveMutation,
} from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { opportunityToFormValues } from '@/features/admin/types/opportunity-form';
import { useTheme } from '@/hooks/useTheme';
import type { Href } from 'expo-router';

export function AdminPendingReviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const opportunityId = typeof id === 'string' ? id : id?.[0];

  const { isReady } = useCanManageOpportunities();
  const { data: opportunity, isLoading, error } = useAdminOpportunity(opportunityId);
  const approveMutation = useUpdateAndApproveMutation(opportunityId ?? '');
  const rejectMutation = useRejectOpportunityMutation();

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

  const handleReject = () => {
    Alert.alert(
      'Reject opportunity',
      `Remove "${opportunity.title}" from the queue? It will not be shown to students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectMutation.mutate(
              { id: opportunityId! },
              { onSuccess: () => router.replace(ROUTES.ADMIN.PENDING as Href) },
            );
          },
        },
      ],
    );
  };

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Screen padded={false}>
      <OpportunityForm
        key={opportunity.id}
        initialValues={opportunityToFormValues(opportunity)}
        submitLabel="Save & Approve"
        loading={isBusy}
        onSubmit={async (values) => {
          await approveMutation.mutateAsync(values);
        }}
        secondaryAction={{
          label: 'Reject',
          onPress: handleReject,
          destructive: true,
        }}
      />
    </Screen>
  );
}
