import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useAdminOpportunity } from '@/features/admin/hooks/useAdminOpportunities';
import {
  useRejectOpportunityMutation,
  useUpdateAndApproveMutation,
} from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { opportunityToFormValues } from '@/features/admin/types/opportunity-form';
import { useTheme } from '@/hooks/useTheme';

export function AdminPendingReviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
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
          message={error instanceof Error ? error.message : t('admin.errors.opportunityNotFound')}
        />
      </Screen>
    );
  }

  const handleReject = () => {
    Alert.alert(
      t('admin.pendingReview.rejectConfirmTitle'),
      t('admin.pendingReview.rejectConfirmMessage', { title: opportunity.title }),
      [
        { text: t('admin.pendingQueue.cancel'), style: 'cancel' },
        {
          text: t('admin.pendingReview.reject'),
          style: 'destructive',
          onPress: () => {
            rejectMutation.mutate(
              { id: opportunityId! },
              { onSuccess: () => router.back() },
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
        submitLabel={t('admin.pendingReview.saveAndApprove')}
        loading={isBusy}
        onSubmit={async (values) => {
          await approveMutation.mutateAsync(values);
        }}
        secondaryAction={{
          label: t('admin.pendingReview.reject'),
          onPress: handleReject,
          destructive: true,
        }}
      />
    </Screen>
  );
}
