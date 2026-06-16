import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { buildOpportunityWebLink } from '@/features/opportunities/utils/opportunity-share-link';
import { shareOpportunity } from '@/features/opportunities/utils/share-opportunity';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

interface Props {
  opportunity: Opportunity;
  visible: boolean;
  onClose: () => void;
}

export function SharePreviewSheet({ opportunity, visible, onClose }: Props) {
  const { colors } = useTheme();
  const [sharing, setSharing] = useState(false);

  const daysLeft = daysUntilDeadline(opportunity.deadline);
  const link = buildOpportunityWebLink(opportunity.id);
  const snippet = opportunity.description?.trim()
    ? opportunity.description.trim().split(/\s+/).slice(0, 45).join(' ')
    : '';

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareOpportunity(opportunity);
      onClose();
    } catch {
      Alert.alert('Share failed', 'Could not open the share sheet.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Share opportunity
          </Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Preview card — this is exactly what recipients will see */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {opportunity.imageUrl ? (
              <Image
                source={{ uri: opportunity.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.cardImage,
                  styles.imagePlaceholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.placeholderLetter}>
                  {opportunity.organization.charAt(0)}
                </Text>
              </View>
            )}

            <View style={styles.cardBody}>
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {opportunity.title}
              </Text>
              <Text
                style={[styles.cardOrg, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {opportunity.organization}
              </Text>
              <Text style={[styles.cardDeadline, { color: colors.primary }]}>
                Deadline: {formatDeadline(opportunity.deadline)}
                {daysLeft <= 14 ? `  ·  ${daysLeft}d left` : ''}
              </Text>

              {snippet ? (
                <Text
                  style={[styles.cardDesc, { color: colors.textMuted }]}
                  numberOfLines={4}
                >
                  {snippet}
                  {opportunity.description!.trim().split(/\s+/).length > 45
                    ? '…'
                    : ''}
                </Text>
              ) : null}

              {/* Link pill */}
              <View
                style={[
                  styles.linkRow,
                  {
                    backgroundColor: `${colors.primary}0E`,
                    borderColor: `${colors.primary}28`,
                  },
                ]}
              >
                <Ionicons
                  name="link-outline"
                  size={11}
                  color={colors.primary}
                />
                <Text
                  style={[styles.linkText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {link}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            The opportunity image and description will be included when you
            share.
          </Text>
        </ScrollView>

        {/* Footer action */}
        <View
          style={[styles.footer, { borderTopColor: colors.border }]}
        >
          <Pressable
            onPress={() => void handleShare()}
            disabled={sharing}
            style={({ pressed }) => [
              styles.shareBtn,
              { backgroundColor: colors.primary },
              sharing && styles.shareBtnBusy,
              pressed && !sharing && styles.shareBtnPressed,
            ]}
            accessibilityRole="button"
          >
            <Ionicons
              name={sharing ? 'hourglass-outline' : 'share-social-outline'}
              size={18}
              color="#fff"
            />
            <Text style={styles.shareBtnText}>
              {sharing ? 'Opening share…' : 'Share'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  // ── Preview card ──────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardOrg: {
    fontSize: 13,
  },
  cardDeadline: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 11,
    flex: 1,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.md,
  },
  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  shareBtnBusy: {
    opacity: 0.6,
  },
  shareBtnPressed: {
    opacity: 0.85,
  },
});
