export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  country: string | null;
  university: string | null;
  degreeLevel: string | null;
  courseMajor: string | null;
  interests: string[];
  careerInterests: string[];
  onboardingComplete: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  avatarUrl: string | null;
  welcomeEmailSentAt: string | null;
};
