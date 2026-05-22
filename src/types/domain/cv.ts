/** Paystack payment purpose for CV Builder. */
export type CVPaymentType = 'download' | 'template_unlock';

/** Paystack payment lifecycle status. */
export type CVPaymentStatus = 'pending' | 'success' | 'failed';

/** Contact / header block stored inside CV content JSON. */
export type CVPersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
};

export type CVEducationEntry = {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
};

export type CVExperienceEntry = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
};

export type CVCertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  description: string;
};

export type CVLanguageEntry = {
  id: string;
  language: string;
  proficiency: string;
};

export type CVProjectEntry = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  technologies: string;
  link: string;
};

export type CVAchievementEntry = {
  id: string;
  title: string;
  date: string;
  description: string;
};

export type CVReferenceEntry = {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
};

/** Section visibility and order stored in CV JSON. */
export type CVLayoutConfig = {
  sectionOrder: string[];
  disabledSections: string[];
};

/**
 * JSON document stored in `cvs.content`.
 */
export type CVContent = {
  personalInfo: CVPersonalInfo;
  summary: string;
  experience: CVExperienceEntry[];
  education: CVEducationEntry[];
  skills: string[];
  certifications: CVCertificationEntry[];
  hobbies: string[];
  languages: CVLanguageEntry[];
  voluntaryExperience: CVExperienceEntry[];
  projects: CVProjectEntry[];
  achievements: CVAchievementEntry[];
  references: CVReferenceEntry[];
  layout?: CVLayoutConfig;
};

export const EMPTY_CV_CONTENT: CVContent = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  hobbies: [],
  languages: [],
  voluntaryExperience: [],
  projects: [],
  achievements: [],
  references: [],
};

export type CV = {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: CVContent;
  createdAt: string;
  updatedAt: string;
};

export type CVPayment = {
  id: string;
  userId: string;
  cvId: string;
  amount: number;
  type: CVPaymentType;
  status: CVPaymentStatus;
  paystackReference: string | null;
  /** Set for template_unlock — which layout was purchased. */
  templateId: string | null;
  createdAt: string;
};
