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

export function AdminEditEventScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = typeof id === 'string' ? id : id?.[0];
  const { isReady } = useCanManageEvents();
  const { data: event, isLoading, error } = useAdminEvent(eventId);
  const updateMutation = useUpdateEventMutation(eventId ?? '');

  if (!isReady) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <Screen>
        <ErrorMessage
          message={error instanceof Error ? error.message : t('events.admin.errors.eventNotFound')}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={{ flex: 1 }}>
        <EventForm
          key={event.id}
          initialValues={eventToFormValues(event)}
          submitLabel={t('events.admin.editScreen.submitLabel')}
          loading={updateMutation.isPending}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync(values);
          }}
        />
      </View>
    </Screen>
  );
}
