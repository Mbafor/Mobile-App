"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export default function ScrollReveal({
  children,
  as: Component = "div",
  className = "",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <Component
      ref={ref as any}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
