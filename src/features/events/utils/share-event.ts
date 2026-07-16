import { formatEventDateTime } from '@/utils/formatting';
import type { Event } from '@/types/domain/event';

/** Plain-text share message for the WhatsApp inline share button (LinkedIn/Facebook only need the link). */
export function buildEventShareMessage(event: Event, eventLink: string): string {
  const lines: string[] = [];

  lines.push(`📅 *${event.title}*`);
  lines.push('');
  lines.push(`🗓️ *When:* ${formatEventDateTime(event.eventDate)}`);
  lines.push(
    event.locationType === 'virtual'
      ? `💻 *Where:* Virtual${event.locationOrLink ? ` · ${event.locationOrLink}` : ''}`
      : `📍 *Where:* In person${event.locationOrLink ? ` · ${event.locationOrLink}` : ''}`,
  );

  const snippet = event.description?.trim();
  if (snippet) {
    lines.push('');
    lines.push(snippet.length > 200 ? `${snippet.slice(0, 197)}...` : snippet);
  }

  lines.push('');
  lines.push(eventLink);

  return lines.join('\n');
}
