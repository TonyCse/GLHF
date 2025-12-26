"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { gsap } from "gsap";

export default function DeleteTournamentButton({ id, textSize = "text-2xl" }: { id: number, textSize?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const buttonRef = useRef(null);
  const shineRef = useRef(null);
  const shineTimeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const shine = shineRef.current;

    gsap.set(shine, { x: "-100%" });

    shineTimeline.current = gsap.timeline({ paused: true })
      .to(btn, {
        scale: 1.05,
        boxShadow: "0 0 35px #dc2626",
        duration: 0.15,
        ease: "power2.out",
      }, 0)
      .to(shine, {
        x: "120%",
        duration: 0.4,
        ease: "power2.out",
      }, 0);

    const handleEnter = () => {
      if (shineTimeline.current) {
        shineTimeline.current.timeScale(1);
        shineTimeline.current.play();
      }
    };

    const handleLeave = () => {
      if (shineTimeline.current) {
        shineTimeline.current.timeScale(2);
        shineTimeline.current.reverse();
      }
    };

    btn?.addEventListener("mouseenter", handleEnter);
    btn?.addEventListener("mouseleave", handleLeave);

    return () => {
      btn?.removeEventListener("mouseenter", handleEnter);
      btn?.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const handleDelete = async () => {
    if (!confirm("Es-tu sûr de vouloir supprimer ce tournoi ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournament/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/tournois");
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleDelete}
      disabled={loading}
      className={`relative inline-flex items-center justify-center px-10 py-5 overflow-hidden font-bold text-white rounded-xl bg-gradient-to-r from-red-600 to-red-800 shadow-lg transition-all duration-300 group cursor-pointer disabled:cursor-not-allowed ${textSize}`}
    >
      {/* Shine effect */}
      <div
        ref={shineRef}
        className="absolute top-0 left-0 w-1/3 h-full bg-white opacity-20 blur-lg rotate-[20deg] pointer-events-none"
      ></div>

      <div className="relative z-10 flex items-center gap-4">
        <Trash2 size={30} />
        {loading ? "Suppression..." : "Supprimer le tournoi"}
      </div>
    </button>
  );
}
