import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';

import { OpportunityForm } from '@/features/admin/components/OpportunityForm';
import { useAdminOpportunity } from '@/features/admin/hooks/useAdminOpportunities';
import { useUpdateOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { opportunityToFormValues } from '@/features/admin/types/opportunity-form';

export function AdminEditOpportunityScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const opportunityId = typeof id === 'string' ? id : id?.[0];
  const { isReady } = useCanManageOpportunities();
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
          message={error instanceof Error ? error.message : t('admin.errors.opportunityNotFound')}
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
        submitLabel={t('admin.editScreen.submitLabel')}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
      </View>
    </Screen>
  );
}

