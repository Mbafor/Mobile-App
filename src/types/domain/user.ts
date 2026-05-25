export type UserRole = 'member' | 'admin' | 'super_admin';

export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  onboardingComplete: boolean;
};
