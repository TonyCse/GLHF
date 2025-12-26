import React, { useEffect, useState } from 'react';
import Image from "next/image";

const GLHFLoader = ({ message = "Chargement en cours..." }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev + 1) % 101);
    }, 50);

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#232426] text-white">
      {/* Container principal */}
      <div className="relative flex flex-col items-center">
        
        {/* Logo avec effet morphing */}
        <div className="relative mb-8">
          <div 
            className="relative p-8 rounded-3xl backdrop-blur-xl border border-white/10"
            style={{
              background: `
                linear-gradient(135deg, rgba(143, 96, 208, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%),
                radial-gradient(circle at 30% 30%, rgba(143, 96, 208, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
              `,
              boxShadow: `
                0 8px 32px rgba(143, 96, 208, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
              animation: 'float-gentle 4s ease-in-out infinite'
            }}
          >
            {/* Votre logo */}
            <Image 
              src="/images/logo.png"
              alt="GLHF Logo"
              width={128}
              height={128}
              className="w-32 h-32 object-contain"
              style={{
                filter: 'drop-shadow(0 4px 20px rgba(143, 96, 208, 0.4))',
                animation: 'logo-breathe 3s ease-in-out infinite'
              }}
            />
            
            {/* Effet de brillance subtile */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                animation: 'shimmer 4s ease-in-out infinite'
              }}
            />
          </div>
          
          {/* Cercles flottants minimalistes */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-[#8F60D0]/30"
              style={{
                width: `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `orbit ${3 + i}s linear infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Barre de progression moderne */}
        <div className="w-80 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-300">{message}{dots}</span>
            <span className="text-sm font-mono text-[#8F60D0] font-semibold">{progress}%</span>
          </div>
          
          <div className="relative">
            {/* Track de la barre */}
            <div 
              className="w-full h-2 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, rgba(143, 96, 208, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Barre de progression */}
              <div 
                className="h-full rounded-full transition-all duration-100 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8F60D0 0%, #A855F7 100%)',
                  boxShadow: '0 0 10px rgba(143, 96, 208, 0.5)',
                  position: 'relative'
                }}
              >
                {/* Effet de brillance sur la barre */}
                <div 
                  className="absolute inset-0 rounded-full opacity-60"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: 'progress-shine 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
            
            {/* Points de progression */}
            <div className="flex justify-between mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    progress > i * 25 ? 'bg-[#8F60D0] scale-125' : 'bg-gray-600 scale-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Indicateurs de statut élégants */}
        <div className="flex space-x-4">
          {['Connexion', 'Authentification', 'Chargement'].map((status, i) => (
            <div 
              key={status}
              className="flex items-center space-x-2 text-xs"
            >
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  progress > (i + 1) * 30 
                    ? 'bg-[#8F60D0] shadow-lg shadow-[#8F60D0]/50' 
                    : progress > i * 30 
                    ? 'bg-[#8F60D0] animate-pulse' 
                    : 'bg-gray-600'
                }`}
              />
              <span className={`transition-colors duration-500 ${
                progress > (i + 1) * 30 ? 'text-[#8F60D0]' : 'text-gray-400'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* Particules ambiantes subtiles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#8F60D0]/40 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `particle-drift ${8 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%) rotate(45deg); opacity: 0; }
        }
        
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(20px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        
        @keyframes progress-shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes particle-drift {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-10px) translateX(5px); opacity: 0.8; }
          50% { transform: translateY(-5px) translateX(-5px); opacity: 0.6; }
          75% { transform: translateY(-15px) translateX(3px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

// Version overlay pour les changements de page
export const PageLoader = ({ message = "Chargement des données..." }) => {
  return (
    <div className="fixed inset-0 bg-[#232426]/80 backdrop-blur-md z-50 flex items-center justify-center">
      <GLHFLoader size={120} message={message} />
    </div>
  );
};

// Version inline pour les sections
export const SectionLoader = ({ message = "Chargement..." }) => {
  return (
    <div className="flex items-center justify-center py-20">
      <GLHFLoader size={80} message={message} />
    </div>
  );
};

// Version mini pour les boutons
export const ButtonLoader = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 border-2 border-[#8F60D0]/30 border-t-[#8F60D0] rounded-full animate-spin" />
      <span className="text-sm">Chargement...</span>
    </div>
  );
};

export default GLHFLoader;