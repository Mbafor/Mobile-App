export type CVTip = {
  id: string;
  title: string;
  body: string;
};

export const CV_TIPS: CVTip[] = [
  {
    id: 'summary',
    title: 'Write a strong summary',
    body: 'Keep your professional summary to 2–4 sentences. Lead with your role or goal, then highlight one or two achievements.',
  },
  {
    id: 'experience',
    title: 'Quantify experience',
    body: 'Use numbers where possible: “Increased sales by 20%” reads stronger than “Improved sales performance.”',
  },
  {
    id: 'skills',
    title: 'Match skills to the job',
    body: 'Prioritise skills mentioned in the job description. Put the most relevant skills near the top of your list.',
  },
  {
    id: 'length',
    title: 'Keep it concise',
    body: 'One page is ideal for early-career CVs; two pages max for experienced professionals. Remove outdated roles.',
  },
  {
    id: 'proofread',
    title: 'Proofread before sending',
    body: 'Read your CV aloud, check spelling, and ask someone else to review it. Small errors can cost interviews.',
  },
];

export const ROTATING_TIPS = CV_TIPS.map((t) => t.body);
