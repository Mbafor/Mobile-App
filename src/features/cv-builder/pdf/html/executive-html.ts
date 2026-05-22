import type { CVContent } from '@/types/domain/cv';
import {
  achievementsHtml,
  experienceStandardHtml,
  getContactItems,
  projectsStandardHtml,
  referencesHtml,
  wrapHtmlDocument,
  escapeHtml,
} from './shared';

function railSection(title: string, body: string): string {
  if (!body.trim()) return '';
  return `<div class="rail-section">
    <div class="rail-left"><div class="rail-title">${escapeHtml(title)}</div></div>
    <div class="rail-right">${body}</div>
  </div>`;
}

export function renderExecutiveHtml(content: CVContent): string {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content)
    .map((c) => escapeHtml(c))
    .join('<span class="sep">|</span>');

  const skillGrid = content.skills
    .map((s) => `<div class="skill-cell"><span class="dot">•</span> ${escapeHtml(s)}</div>`)
    .join('');

  const eduHtml = content.education
    .map(
      (e) => `<div class="item-block">
        <div class="row-title">${escapeHtml(e.degree)}${e.fieldOfStudy ? ` in ${escapeHtml(e.fieldOfStudy)}` : ''}</div>
        <div class="row-sub">${escapeHtml(e.school)}</div>
        <div class="row-date">${escapeHtml([e.startDate, e.endDate].filter(Boolean).join(' – '))}</div>
      </div>`,
    )
    .join('');

  const parts: string[] = [
    `<div class="page executive">
      <div class="banner">${contacts}</div>
      <h1 class="name">${escapeHtml(name.toUpperCase())}</h1>`,
  ];

  if (content.summary.trim()) {
    parts.push(railSection('SUMMARY', `<p class="summary">${escapeHtml(content.summary)}</p>`));
  }
  if (content.skills.length) {
    parts.push(railSection('SKILLS', `<div class="skill-grid">${skillGrid}</div>`));
  }
  if (content.experience.length) {
    parts.push(railSection('EXPERIENCE', experienceStandardHtml(content.experience)));
  }
  if (content.education.length) {
    parts.push(railSection('EDUCATION', eduHtml));
  }
  if (content.projects.length) {
    parts.push(railSection('PROJECTS', projectsStandardHtml(content.projects)));
  }
  if (content.achievements.length) {
    parts.push(railSection('ACHIEVEMENTS', achievementsHtml(content.achievements)));
  }
  if (content.references.length) {
    parts.push(railSection('REFERENCES', referencesHtml(content.references)));
  }

  parts.push('</div>');

  const extraStyles = `
    .executive .banner { background: #dbeafe; padding: 8px 16px; text-align: center; font-size: 9pt; color: #1e40af; }
    .executive .sep { margin: 0 8px; }
    .executive .name { text-align: center; font-size: 24pt; font-weight: 700; color: #2563eb; margin: 14px 0 16px; letter-spacing: 1px; }
    .executive .rail-section { display: flex; margin-bottom: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .executive .rail-left { width: 25%; padding-right: 12px; }
    .executive .rail-right { width: 75%; }
    .executive .rail-title { font-size: 10pt; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
    .executive .skill-grid { display: flex; flex-wrap: wrap; gap: 4px 12px; }
    .executive .skill-cell { font-size: 10pt; }
    .executive .dot { color: #2563eb; }
    .executive .row-title { color: #1e40af; font-weight: 700; }
  `;

  return wrapHtmlDocument(name, extraStyles, parts.join(''));
}
