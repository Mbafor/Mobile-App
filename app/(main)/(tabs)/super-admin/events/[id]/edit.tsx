import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';

import { EventForm } from '@/features/admin/components/EventForm';
import { useAdminEvent } from '@/features/admin/hooks/useAdminEvents';
import { useUpdateEventMutation } from '@/features/admin/hooks/useAdminEventMutations';
import { useCanManageEvents } from '@/features/admin/hooks/useCanManageEvents';
import { eventToFormValues } from '@/features/admin/types/event-form';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminEditEvent() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  useRequireSuperAdmin();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady } = useCanManageEvents();
  const { data: event, isLoading, error } = useAdminEvent(id);
  const updateMutation = useUpdateEventMutation(id ?? '');

  if (!isReady || !id) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <Screen>
        <ErrorMessage message={error instanceof Error ? error.message : t('events.admin.errors.eventNotFound')} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <EventForm
        initialValues={eventToFormValues(event)}
        submitLabel={t('events.admin.editScreen.submitLabel')}
        loading={updateMutation.isPending}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values);
        }}
      />
    </Screen>
  );
}
