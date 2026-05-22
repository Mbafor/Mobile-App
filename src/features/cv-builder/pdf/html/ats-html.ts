import type { CVContent } from '@/types/domain/cv';
import {
  achievementsHtml,
  certsHtml,
  educationAtsHtml,
  experienceStandardHtml,
  getContactItems,
  languagesHtml,
  projectsStandardHtml,
  referencesHtml,
  sectionHtml,
  skillsSplitHtml,
  wrapHtmlDocument,
  escapeHtml,
} from './shared';

export function renderAtsHtml(content: CVContent): string {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content)
    .map((c) => escapeHtml(c))
    .join(' <span class="sep">|</span> ');

  const parts: string[] = [
    `<div class="page ats">
      <div class="header">
        <h1 class="name">${escapeHtml(name.toUpperCase())}</h1>
        ${contacts ? `<div class="contact">${contacts}</div>` : ''}
      </div>`,
  ];

  if (content.summary.trim()) {
    parts.push(sectionHtml('PROFESSIONAL SUMMARY', `<p class="summary">${escapeHtml(content.summary)}</p>`));
  }
  if (content.education.length) {
    parts.push(sectionHtml('EDUCATION', educationAtsHtml(content.education)));
  }
  if (content.skills.length) {
    parts.push(sectionHtml('SKILLS', skillsSplitHtml(content.skills)));
  }
  if (content.projects.length) {
    parts.push(sectionHtml('KEY PROJECTS', projectsStandardHtml(content.projects)));
  }
  if (content.experience.length) {
    parts.push(sectionHtml('PROFESSIONAL EXPERIENCE', experienceStandardHtml(content.experience)));
  }
  if (content.certifications.some((c) => c.name.trim())) {
    parts.push(sectionHtml('CERTIFICATIONS', certsHtml(content.certifications)));
  }
  if (content.languages.length) {
    parts.push(sectionHtml('LANGUAGES', languagesHtml(content.languages)));
  }
  if (content.achievements.length) {
    parts.push(sectionHtml('ACHIEVEMENTS & AWARDS', achievementsHtml(content.achievements)));
  }
  if (content.voluntaryExperience.length) {
    parts.push(sectionHtml('VOLUNTEER EXPERIENCE', experienceStandardHtml(content.voluntaryExperience)));
  }
  if (content.references.length) {
    parts.push(sectionHtml('REFERENCES', referencesHtml(content.references)));
  }
  if (content.hobbies.length) {
    parts.push(sectionHtml('INTERESTS', `<div class="body">${escapeHtml(content.hobbies.join(', '))}</div>`));
  }

  parts.push('</div>');

  const extraStyles = `
    .ats .header { text-align: center; margin-bottom: 12px; }
    .ats .name { font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 10px; }
    .ats .contact { font-size: 9.5pt; }
    .ats .sep { margin: 0 4px; }
    .ats .summary { text-align: justify; }
  `;

  return wrapHtmlDocument(name, extraStyles, parts.join(''));
}
