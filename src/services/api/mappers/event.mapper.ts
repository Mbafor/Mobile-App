import type { EventRow } from '@/services/supabase/types';
import type { Event } from '@/types/domain/event';

export function mapEventRow(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    locationType: row.location_type as Event['locationType'],
    locationOrLink: row.location_or_link,
    registerLink: row.register_link,
    imageUrl: row.image_url,
    category: row.category,
    ownerType: row.owner_type as Event['ownerType'],
    ownerId: row.owner_id,
    status: row.status as Event['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
