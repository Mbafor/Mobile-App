export type EventLocationType = 'virtual' | 'in_person';
export type EventStatus = 'upcoming' | 'past' | 'cancelled';
export type EventOwnerType = 'partner' | 'admin';

export type Event = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  locationType: EventLocationType;
  locationOrLink: string | null;
  registerLink: string;
  imageUrl: string | null;
  category: string | null;
  ownerType: EventOwnerType;
  ownerId: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventTimingFilter = 'upcoming' | 'past';
