import { Share } from 'react-native';

import { formatDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

export async function shareOpportunity(opportunity: Opportunity) {
  const lines = [
    opportunity.title,
    opportunity.organization,
    `Deadline: ${formatDeadline(opportunity.deadline)}`,
  ];
  if (opportunity.applyUrl) {
    lines.push(`Apply: ${opportunity.applyUrl}`);
  }

  await Share.share({
    title: opportunity.title,
    message: lines.join('\n'),
  });
}
