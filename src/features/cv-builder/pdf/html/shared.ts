import { formatExperienceDates } from '@/features/cv-builder/components/preview/preview-shared';
import { escapeHtml, wrapHtmlDocument } from '@/features/cv-builder/pdf/html/document-shell';
import type {
  CVAchievementEntry,
  CVCertificationEntry,
  CVContent,
  CVEducationEntry,
  CVExperienceEntry,
  CVLanguageEntry,
  CVProjectEntry,
  CVReferenceEntry,
} from '@/types/domain/cv';

export { escapeHtml, wrapHtmlDocument };

function hasText(v?: string | null): boolean {
  return Boolean(v?.trim());
}

export function getContactItems(content: CVContent): string[] {
  const p = content.personalInfo;
  return [p.email, p.phone, p.location, p.linkedIn, p.website].filter(hasText) as string[];
}

function bulletsHtml(text?: string): string {
  if (!hasText(text)) return '';
  const lines = text!
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith('•') || l.startsWith('-') ? l.slice(1).trim() : l));
  return `<ul class="bullets">${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

function rowWithDateHtml(
  title: string,
  subtitle: string | undefined,
  date: string | undefined,
): string {
  if (!hasText(title) && !hasText(subtitle)) return '';
  return `<div class="row-header">
    <div class="row-left">
      ${hasText(title) ? `<div class="row-title">${escapeHtml(title)}</div>` : ''}
      ${hasText(subtitle) ? `<div class="row-sub">${escapeHtml(subtitle!)}</div>` : ''}
    </div>
    ${hasText(date) ? `<div class="row-date">${escapeHtml(date!)}</div>` : ''}
  </div>`;
}

export function experienceStandardHtml(entries: CVExperienceEntry[]): string {
  return entries
    .map((e) => {
      const loc = hasText(e.location) ? ` — ${e.location}` : '';
      return `<div class="item-block">
        ${rowWithDateHtml(
          e.role,
          `${e.company}${loc}`,
          formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking),
        )}
        ${bulletsHtml(e.description)}
      </div>`;
    })
    .join('');
}

export function experienceTechHtml(entries: CVExperienceEntry[]): string {
  return entries
    .map((e) => {
      const dates = formatExperienceDates(e.startDate, e.endDate, e.currentlyWorking).toUpperCase();
      return `<div class="tech-timeline">
        <div class="tech-date">${escapeHtml(dates)}</div>
        <div class="tech-company">${escapeHtml(e.company)}</div>
        <div class="tech-role">${escapeHtml(e.role)}</div>
        ${bulletsHtml(e.description)}
      </div>`;
    })
    .join('');
}

export function educationAtsHtml(entries: CVEducationEntry[]): string {
  return entries
    .map((e) => {
      const title = `${e.degree}${hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}`;
      const body = [e.gpa ? `GPA: ${e.gpa}` : '', e.description].filter(hasText).join('\n');
      return `<div class="item-block">
        ${rowWithDateHtml(title, e.school, e.endDate)}
        ${bulletsHtml(body)}
      </div>`;
    })
    .join('');
}

export function educationStandardHtml(entries: CVEducationEntry[]): string {
  return entries
    .map((e) => {
      const title = `${e.degree}${hasText(e.fieldOfStudy) ? ` in ${e.fieldOfStudy}` : ''}`;
      const dates = [e.startDate, e.endDate].filter(hasText).join(' – ');
      return `<div class="item-block">
        ${rowWithDateHtml(title, e.school, dates)}
        ${bulletsHtml(e.description)}
      </div>`;
    })
    .join('');
}

export function projectsStandardHtml(entries: CVProjectEntry[]): string {
  return entries
    .map((p) => {
      const dates = [p.startDate, p.endDate || 'Present'].filter(hasText).join(' – ');
      return `<div class="item-block">
        ${rowWithDateHtml(p.name, undefined, dates)}
        ${bulletsHtml(p.description)}
        ${hasText(p.technologies) ? `<div class="tech-line"><strong>Tech:</strong> ${escapeHtml(p.technologies)}</div>` : ''}
        ${hasText(p.link) ? `<div class="link">${escapeHtml(p.link)}</div>` : ''}
      </div>`;
    })
    .join('');
}

export function projectsTechHtml(entries: CVProjectEntry[]): string {
  return entries
    .map((p) => {
      const dates = [p.startDate, p.endDate || 'PRESENT'].filter(hasText).join(' - ').toUpperCase();
      const tags = hasText(p.technologies)
        ? `<div class="tags">${p.technologies!.split(',').map((t) => `<span class="tag">${escapeHtml(t.trim())}</span>`).join('')}</div>`
        : '';
      return `<div class="tech-timeline">
        <div class="tech-date">${escapeHtml(dates)}</div>
        <div class="tech-company">${escapeHtml(p.name)}</div>
        ${bulletsHtml(p.description)}
        ${tags}
      </div>`;
    })
    .join('');
}

export function achievementsHtml(entries: CVAchievementEntry[]): string {
  return entries
    .map(
      (a) => `<div class="item-block">
        ${rowWithDateHtml(a.title, undefined, a.date)}
        ${bulletsHtml(a.description)}
      </div>`,
    )
    .join('');
}

export function referencesHtml(entries: CVReferenceEntry[]): string {
  return entries
    .map((r) => {
      const sub = `${r.position}${hasText(r.company) ? ` at ${r.company}` : ''}`;
      return `<div class="item-block">
        <div class="ref-name">${escapeHtml(r.name)}</div>
        <div class="ref-sub">${escapeHtml(sub)}</div>
        ${hasText(r.email) ? `<div class="body">${escapeHtml(r.email)}</div>` : ''}
        ${hasText(r.phone) ? `<div class="body">Phone: ${escapeHtml(r.phone)}</div>` : ''}
      </div>`;
    })
    .join('');
}

export function certsHtml(entries: CVCertificationEntry[]): string {
  return entries
    .filter((c) => c.name.trim())
    .map((c) => `<div class="cert-line">• ${escapeHtml(c.name)}</div>`)
    .join('');
}

export function languagesHtml(entries: CVLanguageEntry[]): string {
  const line = entries
    .filter((l) => l.language.trim())
    .map((l) => `${l.language}${hasText(l.proficiency) ? ` (${l.proficiency})` : ''}`)
    .join(', ');
  return line ? `<div class="body">${escapeHtml(line)}</div>` : '';
}

export function skillsSplitHtml(skills: string[]): string {
  if (skills.length === 0) return '';
  const half = Math.ceil(skills.length / 2);
  const technical = skills.slice(0, half);
  const soft = skills.slice(half);
  let html = '';
  if (technical.length) {
    html += `<div class="skill-row"><span class="skill-label">Technical:</span><span class="body">${escapeHtml(technical.join(', '))}</span></div>`;
  }
  if (soft.length) {
    html += `<div class="skill-row"><span class="skill-label">Soft Skills:</span><span class="body">${escapeHtml(soft.join(', '))}</span></div>`;
  }
  return html;
}

export function sectionHtml(title: string, body: string, className = 'section'): string {
  if (!body.trim()) return '';
  return `<div class="${className}">
    <h2 class="section-title">${escapeHtml(title)}</h2>
    ${body}
  </div>`;
}
