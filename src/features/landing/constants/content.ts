import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export const LANDING_FEATURES: {
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    title: 'Personalised feed',
    description:
      'Opportunities matched to your academic profile, interests, and career goals — updated as you grow.',
    icon: 'compass-outline',
  },
  {
    title: 'Application tracker',
    description:
      'Save listings, track deadlines, and manage your pipeline without spreadsheets or scattered notes.',
    icon: 'clipboard-outline',
  },
  {
    title: 'CV builder',
    description:
      'Build polished CVs with templates, section guidance, and export tools designed for students.',
    icon: 'document-text-outline',
  },
  {
    title: 'Smart notifications',
    description:
      'Stay ahead of deadlines and mentorship updates with timely alerts across devices.',
    icon: 'notifications-outline',
  },
  {
    title: 'Category browsing',
    description:
      'Explore scholarships, internships, fellowships, and more — filtered the way you think.',
    icon: 'grid-outline',
  },
  {
    title: 'Secure sign-in',
    description:
      'Sign in with Google or email OTP — your session syncs securely across web and mobile.',
    icon: 'shield-checkmark-outline',
  },
];

export const LANDING_MENTORSHIP_POINTS = [
  {
    title: 'Coach matching',
    description: 'Get paired with mentors who understand your field and goals.',
  },
  {
    title: 'Session booking',
    description: 'Schedule 1:1 sessions and keep your calendar in sync.',
  },
  {
    title: 'In-app messaging',
    description: 'Chat with your mentor without switching to another tool.',
  },
];

export const LANDING_OPPORTUNITY_POINTS = [
  {
    title: 'Save & organise',
    description: 'Bookmark opportunities and revisit them when you are ready to apply.',
  },
  {
    title: 'Deadline visibility',
    description: 'See what is due soon and prioritise what matters most.',
  },
  {
    title: 'Category deep-dives',
    description: 'Browse by field, level, or region to find hidden gems.',
  },
];
