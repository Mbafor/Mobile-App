export type UserRole = 'member' | 'admin';

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isAdmin: boolean;
  onboardingComplete: boolean;
};
