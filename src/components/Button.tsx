"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  textSize?: string; // 👈 permet de définir la taille du texte depuis l'extérieur
}

export default function Button({
  children = "Valider",
  onClick,
  className = "",
  disabled = false,
  textSize = "text-2xl",
}: ButtonProps) {
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const shineRef = useRef<HTMLDivElement | null>(null);
  const shineTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const shine = shineRef.current;

    gsap.set(shine, { x: "-100%" });

    shineTimeline.current = gsap.timeline({ paused: true })
      .to(btn, {
        scale: 1.05,
        boxShadow: "0 0 35px #8F60D0",
        duration: 0.15,
        ease: "power2.out",
      }, 0)
      .to(shine, {
        x: "120%",
        duration: 0.4,
        ease: "power2.out",
      }, 0);

    const handleEnter = () => {
      shineTimeline.current?.timeScale(1).play();
    };

    const handleLeave = () => {
      shineTimeline.current?.timeScale(2).reverse();
    };

    btn?.addEventListener("mouseenter", handleEnter);
    btn?.addEventListener("mouseleave", handleLeave);

    return () => {
      btn?.removeEventListener("mouseenter", handleEnter);
      btn?.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const handleClick = async () => {
    if (!onClick || loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center px-10 py-5 overflow-hidden
        font-bold text-white rounded-xl 
        bg-gradient-to-r from-[#8F60D0] to-[#A855F7]
        shadow-lg transition-all duration-300 group 
        cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
        ${textSize} ${className}
      `}
    >
      {/* Shine effect */}
      <div
        ref={shineRef}
        className="absolute top-0 left-0 w-1/3 h-full bg-white opacity-20 blur-lg rotate-[20deg] pointer-events-none"
      ></div>

      <div className="relative z-10 flex items-center gap-2">
        {loading ? "Chargement..." : children}
      </div>
    </button>
  );
}
