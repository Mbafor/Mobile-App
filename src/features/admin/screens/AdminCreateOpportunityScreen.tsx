import { Alert, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
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
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Text variant="title">Create opportunity</Text>
      </View>
      <OpportunityForm
        initialValues={EMPTY_OPPORTUNITY_FORM}
        submitLabel="Create opportunity"
        loading={createMutation.isPending}
        onSubmit={async (values) => {
          try {
            await createMutation.mutateAsync(values);
          } catch (e) {
            Alert.alert(
              'Could not create',
              e instanceof Error ? e.message : 'Something went wrong',
            );
          }
        }}
      />
    </Screen>
  );
}
