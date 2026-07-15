import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { EventForm } from '@/features/admin/components/EventForm';
import { useCreateEventMutation } from '@/features/admin/hooks/useAdminEventMutations';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { EMPTY_EVENT_FORM } from '@/features/admin/types/event-form';

export function AdminCreateEventScreen() {
  const { isReady } = useRequireAdmin();
  const createMutation = useCreateEventMutation();
  const { t } = useTranslation();

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
  header: { padding: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
});
