import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap gap-10 justify-between mb-10">
          <div className="flex-[2] min-w-[240px] flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-forest flex items-center justify-center">
                <span className="text-accent text-base font-bold">O</span>
              </div>
              <span className="text-[#1A1A1A] font-bold text-lg">Voila</span>
            </div>
            <p className="text-muted text-sm leading-[22px] max-w-[280px]">
              Building career confidence for African students and young professionals.
            </p>
            <div className="flex gap-2 mt-1">
              {['Twitter', 'LinkedIn', 'Instagram'].map((label) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors duration-150 text-xs font-semibold"
                >
                  {label[0]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[{ label: 'Google Play', sub: 'Get it on' }, { label: 'App Store', sub: 'Download on' }].map((store) => (
                <button
                  key={store.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface hover:border-primary hover:bg-primary/5 transition-colors duration-150"
                >
                  <div>
                    <p className="text-[10px] text-muted leading-[14px]">{store.sub}</p>
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-[18px]">{store.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {[
            { heading: 'Product', links: ['Opportunities', 'Mentorship', 'CV Builder', 'Tracker', 'Notifications'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
          ].map((col) => (
            <div key={col.heading} className="flex-1 min-w-[130px] flex flex-col gap-3">
              <p className="text-sm font-bold text-[#1A1A1A] tracking-wide mb-1">{col.heading}</p>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-muted hover:text-primary leading-[22px] transition-colors duration-100"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-wrap justify-between items-center gap-3">
          <p className="text-muted text-sm">© {year} Voila. All rights reserved.</p>
          <p className="text-muted text-sm">Made with care for African students 🌿</p>
        </div>
      </div>
    </footer>
  );
}
