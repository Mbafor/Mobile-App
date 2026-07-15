import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { EventForm } from '@/features/admin/components/EventForm';
import { ROUTES } from '@/constants/routes';
import { useCreateEventMutation } from '@/features/admin/hooks/useAdminEventMutations';
import { useCanManageEvents } from '@/features/admin/hooks/useCanManageEvents';
import { EMPTY_EVENT_FORM } from '@/features/admin/types/event-form';
import { useRequireSuperAdmin } from '@/features/super-admin/hooks/useRequireSuperAdmin';

export default function SuperAdminCreateEvent() {
  useRequireSuperAdmin();
  const { isReady } = useCanManageEvents();
  const { t } = useTranslation();
  const createMutation = useCreateEventMutation(
    ROUTES.SUPER_ADMIN.EVENTS as import('expo-router').Href,
  );

  if (!isReady) return null;

  return (
    <Screen padded={false}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text muted variant="caption">
            {t('events.admin.createScreen.hint')}
          </Text>
        </View>
        <EventForm
          initialValues={EMPTY_EVENT_FORM}
          submitLabel={t('events.admin.createScreen.submitLabel')}
          loading={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: spacing.sm },
});
