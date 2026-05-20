"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./GLHFLoader.module.css";

type GLHFLoaderProps = {
  message?: string;
  size?: number;
};

// Loader principal
const GLHFLoader = ({ message = "Chargement en cours...", size = 128 }: GLHFLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const orbitClasses = [styles.orbit0, styles.orbit1, styles.orbit2];
  const particleClasses = [
    styles.particle0,
    styles.particle1,
    styles.particle2,
    styles.particle3,
    styles.particle4,
    styles.particle5,
    styles.particle6,
    styles.particle7,
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev + 1) % 101);
    }, 50);

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#232426] text-white">
      {/* Conteneur principal */}
      <div className="relative flex flex-col items-center">
        {/* Logo avec effet de morphing */}
        <div className="relative mb-8">
          <div
            className={`relative p-8 rounded-3xl backdrop-blur-xl border border-white/10 ${styles.logoPanel}`}
          >
            {/* Logo */}
            <Image
              src="/images/logo.webp"
              alt="Logo GLHF, plateforme de tournois e-sports"
              width={size}
              height={size}
              className={`object-contain ${styles.logoImage}`}
            />

            {/* Effet de brillance */}
            <div
              className={`absolute inset-0 rounded-3xl opacity-50 pointer-events-none ${styles.shimmer}`}
            />
          </div>

          {/* Cercles flottants */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full border border-[#8F60D0]/30 ${styles.orbit} ${orbitClasses[i]}`}
            />
          ))}
        </div>

        {/* Barre de progression */}
        <div className="w-80 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white">
              {message}
              {dots}
            </span>
            <span className="text-sm font-mono text-[#8F60D0] font-semibold">{progress}%</span>
          </div>

          <div className="relative">
            <progress className={styles.progress} value={progress} max={100} />
            {/* Points de progression */}
            <div className="flex justify-between mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    progress > i * 25 ? "bg-[#8F60D0] scale-125" : "bg-gray-600 scale-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Indicateurs de statut */}
        <div className="flex space-x-4">
          {["Connexion", "Authentification", "Chargement"].map((status, i) => (
            <div key={status} className="flex items-center space-x-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  progress > (i + 1) * 30
                    ? "bg-[#8F60D0] shadow-lg shadow-[#8F60D0]/50"
                    : progress > i * 30
                      ? "bg-[#8F60D0] animate-pulse"
                      : "bg-gray-600"
                }`}
              />
              <span
                className={`transition-colors duration-500 ${
                  progress > (i + 1) * 30 ? "text-[#8F60D0]" : "text-white"
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* Particules ambiantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-[#8F60D0]/40 rounded-full ${styles.particle} ${particleClasses[i]}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GLHFLoader;
