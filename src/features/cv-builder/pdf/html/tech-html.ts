import type { CVContent } from '@/types/domain/cv';
import {
  achievementsHtml,
  experienceTechHtml,
  getContactItems,
  projectsTechHtml,
  referencesHtml,
  sectionHtml,
  wrapHtmlDocument,
  escapeHtml,
} from './shared';

export function renderTechHtml(content: CVContent): string {
  const name = content.personalInfo.fullName.trim() || 'Your Name';
  const contacts = getContactItems(content)
    .map((c) => `<div class="sidebar-text">${escapeHtml(c)}</div>`)
    .join('');

  const sidebarEdu = content.education
    .map(
      (e) => `<div class="edu-item">
        <div class="edu-date">${escapeHtml(e.endDate)}</div>
        <div class="edu-school">${escapeHtml(e.school.toUpperCase())}</div>
        <div class="sidebar-text">${escapeHtml(e.degree)}</div>
      </div>`,
    )
    .join('');

  const sidebarSkills = content.skills
    .map((s) => `<div class="sidebar-bullet">• ${escapeHtml(s)}</div>`)
    .join('');

  const sidebarCerts = content.certifications
    .filter((c) => c.name.trim())
    .map((c) => `<div class="sidebar-bullet">• ${escapeHtml(c.name)}</div>`)
    .join('');

  const sidebarLangs = content.languages
    .filter((l) => l.language.trim())
    .map((l) => `<div class="sidebar-text">${escapeHtml(l.language)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ''}</div>`)
    .join('');

  const mainParts: string[] = [];
  if (content.summary.trim()) {
    mainParts.push(sectionHtml('PROFILE', `<p class="summary">${escapeHtml(content.summary)}</p>`, 'main-section'));
  }
  if (content.experience.length) {
    mainParts.push(sectionHtml('EXPERIENCE', experienceTechHtml(content.experience), 'main-section'));
  }
  if (content.projects.length) {
    mainParts.push(sectionHtml('PROJECTS', projectsTechHtml(content.projects), 'main-section'));
  }
  if (content.achievements.length) {
    mainParts.push(sectionHtml('ACHIEVEMENTS', achievementsHtml(content.achievements), 'main-section'));
  }
  if (content.references.length) {
    mainParts.push(sectionHtml('REFERENCES', referencesHtml(content.references), 'main-section'));
  }

  const body = `<div class="page tech">
    <div class="sidebar">
      <h1 class="sidebar-name">${escapeHtml(name.toUpperCase())}</h1>
      ${contacts ? `<div class="sidebar-block"><h3>CONTACT</h3><hr/>${contacts}</div>` : ''}
      ${sidebarEdu ? `<div class="sidebar-block"><h3>EDUCATION</h3><hr/>${sidebarEdu}</div>` : ''}
      ${sidebarSkills ? `<div class="sidebar-block"><h3>SKILLS</h3><hr/>${sidebarSkills}</div>` : ''}
      ${sidebarCerts ? `<div class="sidebar-block"><h3>CERTIFICATIONS</h3><hr/>${sidebarCerts}</div>` : ''}
      ${sidebarLangs ? `<div class="sidebar-block"><h3>LANGUAGES</h3><hr/>${sidebarLangs}</div>` : ''}
    </div>
    <div class="main">${mainParts.join('')}</div>
  </div>`;

  const extraStyles = `
    .tech { display: flex; min-height: 100%; }
    .tech .sidebar { width: 35%; background: #1e2a3a; color: #e5e7eb; padding: 20px 16px; }
    .tech .main { width: 65%; background: #f3f4f6; padding: 20px 18px; color: #1F2937; }
    .tech .sidebar-name { font-size: 16pt; font-weight: 700; margin-bottom: 16px; letter-spacing: 0.5px; }
    .tech .sidebar-block { margin-bottom: 14px; }
    .tech .sidebar-block h3 { font-size: 9pt; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
    .tech .sidebar-block hr { border: none; border-top: 1px solid #4b5563; margin-bottom: 8px; }
    .tech .sidebar-text { font-size: 9pt; margin-bottom: 4px; }
    .tech .sidebar-bullet { font-size: 9pt; margin-bottom: 3px; }
    .tech .edu-item { margin-bottom: 8px; }
    .tech .edu-date { font-size: 8pt; color: #9ca3af; }
    .tech .edu-school { font-weight: 700; font-size: 9pt; margin: 2px 0; }
    .tech .main-section .section-title { color: #1e2a3a; border-bottom-color: #1e2a3a; }
    .tech .tech-timeline { border-left: 2px solid #9ca3af; padding-left: 14px; margin-left: 5px; margin-bottom: 14px; position: relative; }
    .tech .tech-timeline::before { content: ''; position: absolute; left: -6px; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: #1e2a3a; }
    .tech .tech-date { font-size: 8pt; font-weight: 700; color: #6b7280; margin-bottom: 2px; }
    .tech .tech-company { font-weight: 700; font-size: 11pt; }
    .tech .tech-role { font-style: italic; margin-bottom: 4px; }
    .tech .tags { margin-top: 4px; }
    .tech .tag { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 8pt; padding: 2px 6px; border-radius: 3px; margin: 2px 4px 2px 0; }
  `;

  return wrapHtmlDocument(name, extraStyles, body);
}
