"use client";

import { Crown, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type StatItem = {
  label: string;
  value: number;
  detail: string;
  iconClass: string;
  valueGradient: string;
  icon: "trophy" | "users" | "crown";
};

type HomeStatsSectionProps = {
  stats: StatItem[];
};

const ICONS = {
  trophy: Trophy,
  users: Users,
  crown: Crown,
} as const;

export default function HomeStatsSection({ stats }: HomeStatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(() => stats.map(() => 0));

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setHasStarted(true);
          observer.disconnect();
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const frameId = window.requestAnimationFrame(() => {
        setDisplayValues(stats.map((stat) => stat.value));
      });
      return () => window.cancelAnimationFrame(frameId);
    }

    const duration = 1600;
    const start = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValues(stats.map((stat) => Math.round(stat.value * eased)));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [hasStarted, stats]);

  const formattedValues = useMemo(
    () => displayValues.map((value) => new Intl.NumberFormat("fr-FR").format(value)),
    [displayValues],
  );

  return (
    <div ref={sectionRef} className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = ICONS[stat.icon];

        return (
          <div
            key={stat.label}
            className={`rounded-xl border border-[#8F60D0]/20 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 text-center shadow-xl transition-all duration-500 hover:border-[#8F60D0]/40 hover:shadow-2xl ${
              hasStarted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="mb-6 flex justify-center">
              <Icon size={56} className={stat.iconClass} />
            </div>
            <h3
              className={`mb-2 bg-linear-to-r ${stat.valueGradient} bg-clip-text text-4xl font-bold text-transparent md:text-5xl`}
            >
              {formattedValues[index]}
            </h3>
            <p className="text-2xl font-medium text-white">{stat.label}</p>
            <p className="mt-3 text-sm text-white">{stat.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
