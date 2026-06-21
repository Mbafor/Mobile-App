'use client';

type OpportunityCardData = {
  id: string;
  title: string;
  organization: string;
  image_url: string | null;
  category: string | null;
  deadline: string | null;
};

const PLACEHOLDER_COLORS = ['#0B6623', '#2D6040', '#3D7A50', '#1A4D2E', '#5A8F6B'];

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return 'Deadline today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function CalendarIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function OpportunityCarousel({ opportunities }: { opportunities: OpportunityCardData[] }) {
  const doubled = [...opportunities, ...opportunities];

  return (
    <div className="overflow-hidden">
      <div className="opp-scroll-track flex gap-5 pl-6" style={{ width: 'max-content' }}>
        {doubled.map((opp, i) => {
          const deadlineLabel = formatDeadline(opp.deadline);
          const color = PLACEHOLDER_COLORS[opp.organization.charCodeAt(0) % PLACEHOLDER_COLORS.length];

          return (
            <a
              key={`${opp.id}-${i}`}
              href={`/opportunity/${opp.id}`}
              className="flex-shrink-0 w-[280px] rounded-2xl border border-[#E0E0E0] bg-white shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {opp.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opp.image_url} alt={opp.title} className="w-full h-36 object-cover" />
              ) : (
                <div
                  className="w-full h-36 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span
                    className="text-white font-bold opacity-80"
                    style={{ fontSize: 48, lineHeight: 1 }}
                  >
                    {opp.organization.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="p-4">
                {opp.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-[11px] font-semibold capitalize mb-2">
                    {opp.category}
                  </span>
                )}
                <h3 className="text-[#1A1A1A] font-semibold text-sm leading-snug line-clamp-2 mb-1.5">
                  {opp.title}
                </h3>
                <p className="text-[#6B6B6B] text-xs mb-3 truncate">{opp.organization}</p>
                {deadlineLabel && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-semibold">
                    <CalendarIcon />
                    {deadlineLabel}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
