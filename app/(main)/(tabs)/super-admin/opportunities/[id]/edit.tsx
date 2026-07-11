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
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminEditOpportunity() {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
        <ErrorMessage message={error instanceof Error ? error.message : t('admin.errors.opportunityNotFound')} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <OpportunityForm
        initialValues={opportunityToFormValues(opportunity)}
        submitLabel={t('admin.editScreen.submitLabel')}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </Screen>
  );
}
