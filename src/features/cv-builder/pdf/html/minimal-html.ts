import type { CVContent } from '@/types/domain/cv';
import {
  achievementsHtml,
  experienceStandardHtml,
  getContactItems,
  projectsStandardHtml,
  wrapHtmlDocument,
  escapeHtml,
} from './shared';

export function renderMinimalHtml(content: CVContent): string {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content)
    .map((c) => escapeHtml(c))
    .join(' <span class="dot-sep">·</span> ');

  const half = Math.ceil(content.skills.length / 2);
  const technical = content.skills.slice(0, half);
  const soft = content.skills.slice(half);

  const sidebarEdu = content.education
    .map(
      (e) => `<div class="edu-block">
        <div class="edu-degree">${escapeHtml(e.degree)}</div>
        <div class="edu-school">${escapeHtml(e.school)}</div>
        <div class="edu-date">${escapeHtml(e.endDate)}</div>
      </div>`,
    )
    .join('');

  const sidebarSkills = [
    technical.length
      ? `<div class="skill-block"><div class="skill-cat">Technical</div><div class="skill-text">${escapeHtml(technical.join(', '))}</div></div>`
      : '',
    soft.length
      ? `<div class="skill-block"><div class="skill-cat">Soft Skills</div><div class="skill-text">${escapeHtml(soft.join(', '))}</div></div>`
      : '',
  ].join('');

  const mainParts: string[] = [];
  if (content.summary.trim()) {
    mainParts.push(`<div class="main-section"><h2>Profile</h2><p>${escapeHtml(content.summary)}</p></div>`);
  }
  if (content.experience.length) {
    mainParts.push(`<div class="main-section"><h2>Experience</h2>${experienceStandardHtml(content.experience)}</div>`);
  }
  if (content.projects.length) {
    mainParts.push(`<div class="main-section"><h2>Projects</h2>${projectsStandardHtml(content.projects)}</div>`);
  }
  if (content.achievements.length) {
    mainParts.push(`<div class="main-section"><h2>Achievements</h2>${achievementsHtml(content.achievements)}</div>`);
  }

  const body = `<div class="page minimal">
    <div class="header">
      <h1 class="name">${escapeHtml(name.toUpperCase())}</h1>
      ${contacts ? `<div class="contact">${contacts}</div>` : ''}
    </div>
    <div class="columns">
      <div class="sidebar">
        ${sidebarEdu ? `<div class="side-section"><h3>Education</h3>${sidebarEdu}</div>` : ''}
        ${sidebarSkills ? `<div class="side-section"><h3>Expertise</h3>${sidebarSkills}</div>` : ''}
      </div>
      <div class="main">${mainParts.join('')}</div>
    </div>
  </div>`;

  const extraStyles = `
    .minimal .header { border-bottom: 1px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
    .minimal .name { font-size: 20pt; font-weight: 700; letter-spacing: 2px; margin-bottom: 6px; }
    .minimal .contact { font-size: 9pt; color: #6b7280; }
    .minimal .dot-sep { margin: 0 6px; }
    .minimal .columns { display: flex; gap: 16px; }
    .minimal .sidebar { width: 28%; }
    .minimal .main { width: 72%; }
    .minimal .side-section { margin-bottom: 14px; }
    .minimal .side-section h3 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #111827; padding-bottom: 3px; margin-bottom: 8px; }
    .minimal .edu-degree { font-weight: 700; font-size: 10pt; }
    .minimal .edu-school { font-size: 9.5pt; }
    .minimal .edu-date { font-size: 9pt; color: #6b7280; margin-bottom: 8px; }
    .minimal .skill-cat { font-weight: 700; font-size: 9pt; margin-top: 6px; }
    .minimal .skill-text { font-size: 9.5pt; }
    .minimal .main-section { margin-bottom: 12px; }
    .minimal .main-section h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  `;

  return wrapHtmlDocument(name, extraStyles, body);
}
