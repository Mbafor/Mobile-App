import * as FileSystem from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

import { buildOpportunityWebLink } from '@/features/opportunities/utils/opportunity-share-link';
import { formatDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

function guessImageExtension(imageUrl: string): string {
  const lower = imageUrl.toLowerCase();
  if (lower.includes('.png')) return 'png';
  if (lower.includes('.webp')) return 'webp';
  if (lower.includes('.gif')) return 'gif';
  return 'jpg';
}

/** Downloads listing art to cache so the OS share sheet attaches the file, not a URL string. */
async function cacheOpportunityImage(
  imageUrl: string,
  opportunityId: string,
): Promise<string | null> {
  try {
    const ext = guessImageExtension(imageUrl);
    const localPath = `${FileSystem.cacheDirectory}olf-share-${opportunityId}.${ext}`;
    const existing = await FileSystem.getInfoAsync(localPath);
    if (existing.exists) return localPath;

    const { uri, status } = await FileSystem.downloadAsync(imageUrl, localPath);
    return status >= 200 && status < 300 ? uri : null;
  } catch {
    return null;
  }
}

function firstNWords(text: string, n: number): string {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, n).join(' ');
}

export function buildShareMessage(opportunity: Opportunity, opportunityLink: string): string {
  const description = opportunity.description?.trim() ?? '';
  const snippet = description ? firstNWords(description, 50) : '';

  const parts: Array<string> = [
    opportunity.title,
    opportunity.organization,
    `Deadline: ${formatDeadline(opportunity.deadline)}`,
    snippet ? `About: ${snippet}` : '',
    '',
    opportunityLink,
  ];

  return parts.filter((p) => p.trim().length > 0).join('\n');
}

/**
 * Shares the listing image file (when available) plus title, org, deadline,
 * and a single Olives Forum opportunity link — never the apply URL or raw image URL.
 */
export async function shareOpportunity(opportunity: Opportunity) {
  const opportunityLink = buildOpportunityWebLink(opportunity.id);
  const message = buildShareMessage(opportunity, opportunityLink);

  if (Platform.OS === 'web') {
    // Best-effort: attempt to download the image so the share sheet can attach it.
    // Some web share targets may ignore local file URIs, so we fallback to message-only.
    const imageUri = opportunity.imageUrl?.trim()
      ? await cacheOpportunityImage(opportunity.imageUrl.trim(), opportunity.id)
      : null;

    if (imageUri) {
      await Share.share({ title: opportunity.title, message, url: imageUri });
      return;
    }

    await Share.share({ title: opportunity.title, message });
    return;
  }

  const imageUri = opportunity.imageUrl?.trim()
    ? await cacheOpportunityImage(opportunity.imageUrl.trim(), opportunity.id)
    : null;

  if (imageUri) {
    await Share.share({
      title: opportunity.title,
      message,
      url: imageUri,
    });
    return;
  }

  await Share.share({
    title: opportunity.title,
    message,
  });
}
