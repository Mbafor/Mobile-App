import { create } from 'zustand';

import type {
  OnboardingAcademicInfo,
  OnboardingBasicInfo,
  OnboardingOpportunityPrefs,
} from '@/types/domain/onboarding';
import type { FundingPreference } from '@/types/domain/user-preferences';

type OnboardingDraft = {
  basic: OnboardingBasicInfo;
  academic: OnboardingAcademicInfo;
  preferences: OnboardingOpportunityPrefs;
};

const emptyDraft: OnboardingDraft = {
  basic: { fullName: '', country: '' },
  academic: {
    university: '',
    degreeLevel: 'bachelors',
    courseMajor: '',
    interests: [],
    careerInterests: [],
  },
  preferences: {
    opportunityTypes: [],
    preferredCountries: [],
    fundingPreference: 'any',
  },
};

type OnboardingState = {
  draft: OnboardingDraft;
  setBasic: (basic: Partial<OnboardingBasicInfo>) => void;
  setAcademic: (academic: Partial<OnboardingAcademicInfo>) => void;
  setPreferences: (preferences: Partial<OnboardingOpportunityPrefs>) => void;
  loadFromServer: (data: Partial<OnboardingDraft>) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: emptyDraft,
  setBasic: (basic) =>
    set((state) => ({
      draft: { ...state.draft, basic: { ...state.draft.basic, ...basic } },
    })),
  setAcademic: (academic) =>
    set((state) => ({
      draft: { ...state.draft, academic: { ...state.draft.academic, ...academic } },
    })),
  setPreferences: (preferences) =>
    set((state) => ({
      draft: {
        ...state.draft,
        preferences: { ...state.draft.preferences, ...preferences },
      },
    })),
  loadFromServer: (data) =>
    set((state) => ({
      draft: {
        basic: { ...state.draft.basic, ...data.basic },
        academic: { ...state.draft.academic, ...data.academic },
        preferences: { ...state.draft.preferences, ...data.preferences },
      },
    })),
  reset: () => set({ draft: emptyDraft }),
}));

export type { FundingPreference };
