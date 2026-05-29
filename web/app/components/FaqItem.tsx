"use client";

import { useState } from "react";

export default function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 px-2 text-left rounded hover:bg-surface-tinted transition-colors duration-150 gap-4"
      >
        <span className="text-[#1A1A1A] font-semibold text-[17px] leading-relaxed flex-1">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-2 pb-5">
          <p className="text-muted text-base leading-7">{answer}</p>
        </div>
      )}
    </div>
  );
}
