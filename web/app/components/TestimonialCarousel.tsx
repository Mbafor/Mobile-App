'use client';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const AVATAR_BG = ['#0B6623', '#2D6040', '#3D7A50', '#8BC99A'];

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const doubled = [...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden">
      <div className="opp-scroll-track flex gap-5 pl-6" style={{ width: 'max-content' }}>
        {doubled.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="flex-shrink-0 w-[320px] p-8 bg-white rounded-2xl border border-[#E0E0E0] shadow-sm flex flex-col gap-4"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
            </div>
            <p className="text-[#1A1A1A] text-sm leading-[26px] italic flex-1">{t.quote}</p>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: AVATAR_BG[t.name.charCodeAt(0) % AVATAR_BG.length] }}
              >
                <span className="text-white font-bold text-base">{t.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A] text-sm">{t.name}</p>
                <p className="text-[#6B6B6B] text-xs mt-px">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
