"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
  icon: string;
};

type HomeFaqAccordionProps = {
  items: FaqItem[];
  className?: string;
};

export default function HomeFaqAccordion({ items, className = "" }: HomeFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={`mx-auto flex w-full max-w-5xl flex-col gap-5 ${className}`.trim()}>
      {items.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.question}
            className={`group w-full overflow-hidden rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] text-left shadow-none transition-all duration-300 hover:border-[#8F60D0]/40 ${
              isOpen ? "border-[#8F60D0]/45" : ""
            }`}
          >
            <button
              id={`faq-btn-${index}`}
              type="button"
              className="flex w-full items-center gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
            >
              <span className="text-4xl" aria-hidden="true">{faq.icon}</span>
              <span className="flex-1 text-xl font-semibold text-white md:text-2xl">
                {faq.question}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl leading-none text-[#d6bcff] transition-transform duration-300 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>

            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-btn-${index}`}
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={`px-6 pb-6 pt-4 text-lg leading-relaxed text-white transition-all duration-300 md:text-xl ${
                    isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
