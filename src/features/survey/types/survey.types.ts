export type MostUsedFeature = 'opportunities' | 'cv-builder' | 'mentorship';

export type SurveyAnswers = {
  experienceRating: number;
  mostUsedFeature: MostUsedFeature;
  likesMobileApp: boolean;
  featureRequest: string;
};
