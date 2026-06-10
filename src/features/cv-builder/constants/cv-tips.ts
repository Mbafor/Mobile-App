export type CVTip = {
  id: string;
  title: string;
  body: string;
};

export const CV_TIPS: CVTip[] = [
  {
    id: 'summary',
    title: 'Write a strong summary',
    body: 'Your summary is the first thing recruiters read — make it count. In 2–3 sentences, highlight who you are, your top skills, and what you bring to the table. Avoid generic phrases like "hardworking team player." Instead, be specific: mention your field, a key achievement, and your career goal. Think of it as your elevator pitch on paper.',
  },
  {
    id: 'experience',
    title: 'Quantify experience',
    body: 'Numbers make your experience credible and memorable. Instead of vague claims, attach real figures to your work. "Led a team of 5 and reduced bug reports by 30%" is far more convincing than "Led a team and improved product quality." Ask yourself: How many? How much? How often? Even estimates count — "Served 50+ customers daily" beats "Served many customers." Recruiters skim CVs fast; numbers make you stand out instantly.',
  },
  {
    id: 'skills',
    title: 'Match skills to the job',
    body: 'A generic skills list won\'t get you far. Before submitting your CV, read the job description carefully and mirror the exact keywords and skills they mention. If they ask for "project management" and you write "task coordination," an ATS (Applicant Tracking System) might filter you out before a human even sees your CV. Tailor your skills section for every application — move the most relevant skills to the top, drop the ones that don\'t apply, and use the employer\'s own language. A targeted CV always beats a one-size-fits-all one',
  },
{
  id: 'length',
  title: 'Keep it concise',
  body: 'Recruiters spend an average of 7 seconds scanning a CV — every word needs to earn its place. One page is ideal if you have less than 3 years of experience; two pages maximum if you have more. Cut old part-time jobs that are no longer relevant, trim lengthy bullet points to one line, and remove skills everyone assumes you have (like "Microsoft Word"). If it doesn\'t add value, it\'s just noise. A tight, focused CV signals good communication skills before you even walk through the door.',
},
{
  id: 'proofread',
  title: 'Proofread before sending',
  body: 'A single typo can undo hours of hard work. Spell-checkers miss more than they catch — "manger" instead of "manager" is technically correct spelling. Read your CV out loud to catch awkward phrasing, then read it backwards line by line to spot spelling errors your brain would otherwise autocorrect. Change the font temporarily to trick your eyes into seeing it fresh. Finally, send it to a friend or mentor for a second pair of eyes. You only get one first impression — make sure it\'s clean.',
},
];

export const ROTATING_TIPS = CV_TIPS.map((t) => t.body);
