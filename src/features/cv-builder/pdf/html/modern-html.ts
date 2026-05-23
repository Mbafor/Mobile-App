import type { CVContent } from '@/types/domain/cv';
import {
  achievementsHtml,
  certsHtml,
  educationStandardHtml,
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

export function renderModernHtml(content: CVContent): string {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content)
    .map((c) => escapeHtml(c))
    .join('<span class="sep">|</span>');

  const parts: string[] = [
    `<div class="page modern">
      <div class="header">
        <h1 class="name">${escapeHtml(name.toUpperCase())}</h1>
        ${contacts ? `<div class="contact">${contacts}</div>` : ''}
      </div>`,
  ];

  if (content.summary.trim()) {
    parts.push(sectionHtml('PROFESSIONAL PROFILE', `<p class="summary">${escapeHtml(content.summary)}</p>`));
  }
  if (content.experience.length) {
    parts.push(sectionHtml('PROFESSIONAL EXPERIENCE', experienceStandardHtml(content.experience)));
  }
  if (content.projects.length) {
    parts.push(sectionHtml('PROJECTS', projectsStandardHtml(content.projects)));
  }
  if (content.education.length) {
    parts.push(sectionHtml('EDUCATION', educationStandardHtml(content.education)));
  }
  if (content.skills.length) {
    parts.push(sectionHtml('SKILLS', skillsSplitHtml(content.skills)));
  }
  if (content.certifications.some((c) => c.name.trim())) {
    parts.push(sectionHtml('CERTIFICATIONS', certsHtml(content.certifications)));
  }
  if (content.languages.length) {
    parts.push(sectionHtml('LANGUAGES', languagesHtml(content.languages)));
  }
  if (content.achievements.length) {
    parts.push(sectionHtml('ACHIEVEMENTS', achievementsHtml(content.achievements)));
  }
  if (content.references.length) {
    parts.push(sectionHtml('REFERENCES', referencesHtml(content.references)));
  }
  if (content.hobbies.length) {
    parts.push(
      sectionHtml('INTERESTS', `<div class="body">${escapeHtml(content.hobbies.join(', '))}</div>`),
    );
  }

  parts.push('</div>');

  const extraStyles = `
    .modern .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 12px; }
    .modern .name { font-size: 22pt; font-weight: 700; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 8px; }
    .modern .contact { font-size: 9.5pt; color: #374151; }
    .modern .sep { margin: 0 6px; color: #9ca3af; }
    .modern .section-title { background: #eff6ff; color: #1e40af; border-bottom: 1px solid #3b82f6; padding: 4px 8px; }
    .modern .row-title { color: #1e40af; }
  `;

  return wrapHtmlDocument(name, extraStyles, parts.join(''));
}
