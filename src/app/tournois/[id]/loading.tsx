import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#232426] text-white flex items-center justify-center px-6">
      <div className="bg-[#1c1d1f] border border-[#2a2c30] shadow-[0_10px_30px_rgba(0,0,0,0.35)] rounded-[1.25rem] px-8 py-6 grid gap-3 justify-items-center">
        <div className="w-20 h-20 rounded-full border border-[#2a2c30] bg-[radial-gradient(circle_at_30%_30%,#2a2c30,#1c1d1f_70%)] grid place-items-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <Image
            src="/images/logo.webp"
            alt="Logo GLHF, plateforme de tournois e-sports"
            width={72}
            height={72}
            className="drop-shadow-[0_6px_12px_rgba(143,96,208,0.35)]"
            priority
            data-loader-logo
          />
        </div>
        <div className="text-[25px] font-medium text-gray-400 flex items-center h-10 px-2">
          <p>Chargement</p>
          <div className="relative overflow-hidden h-10 ml-2" data-loader-words>
            <span className="block h-full pl-1 text-[#956afa]" data-loader-word>
              tournois
            </span>
            <span className="block h-full pl-1 text-[#956afa]" data-loader-word>
              joueurs
            </span>
            <span className="block h-full pl-1 text-[#956afa]" data-loader-word>
              brackets
            </span>
            <span className="block h-full pl-1 text-[#956afa]" data-loader-word>
              stats
            </span>
            <span className="block h-full pl-1 text-[#956afa]" data-loader-word>
              tournois
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
