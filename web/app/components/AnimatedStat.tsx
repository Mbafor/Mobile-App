"use client";

import { useEffect, useRef, useState } from "react";

function parseValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  return { numeric: match ? parseFloat(match[1]) : 0, suffix: match ? match[2] : "" };
}

export default function AnimatedStat({ value, label }: { value: string; label: string }) {
  const { numeric, suffix } = parseValue(value);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const precision = Number.isInteger(numeric) ? 1 : 10;
          let startTime: number | null = null;

          function step(ts: number) {
            if (startTime === null) startTime = ts;
            const eased = Math.min((ts - startTime) / duration, 1);
            const progress = eased < 0.5 ? 2 * eased * eased : -1 + (4 - 2 * eased) * eased;
            setCount(Math.round(numeric * progress * precision) / precision);
            if (progress < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [numeric]);

  const display = Number.isInteger(count) ? count.toString() : count.toFixed(1);

  return (
    <div
      ref={ref}
      className="flex-1 min-w-[200px] p-6 bg-surface-tinted rounded-2xl border border-border border-l-4 border-l-primary gap-2 shadow-sm"
    >
      <div className="w-8 h-0.5 rounded-sm bg-accent mb-2" />
      <p className="text-[42px] leading-[48px] font-extrabold text-primary tracking-tight">
        {display}{suffix}
      </p>
      <p className="text-muted text-sm font-medium">{label}</p>
    </div>
  );
}
