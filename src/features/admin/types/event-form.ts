import type { Event, EventLocationType } from '@/types/domain/event';

export type EventFormValues = {
  title: string;
  description: string;
  eventDate: string;
  locationType: EventLocationType;
  locationOrLink: string;
  registerLink: string;
  imageUrl: string;
  category: string;
};

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: '',
  description: '',
  eventDate: '',
  locationType: 'virtual',
  locationOrLink: '',
  registerLink: '',
  imageUrl: '',
  category: '',
};

export function eventToFormValues(event: Event): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    eventDate: event.eventDate.slice(0, 16),
    locationType: event.locationType,
    locationOrLink: event.locationOrLink ?? '',
    registerLink: event.registerLink,
    imageUrl: event.imageUrl ?? '',
    category: event.category ?? '',
  };
}
