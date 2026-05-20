"use client";

import Image from "next/image";
import { useState } from "react";
import AvatarRegenerateButton from "./AvatarRegenerateButton";

type ProfileAvatarProps = {
  initialAvatarUrl?: string;
  email?: string | null;
};

export default function ProfileAvatar({ initialAvatarUrl, email }: ProfileAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");

  return (
    <div className="relative w-[120px] h-[120px]">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          fill
          sizes="120px"
          alt="Photo de profil"
          className="object-cover rounded-full border-4 border-[#8F60D0] bg-linear-to-br from-[#8F60D0] to-[#2e2640]"
        />
      ) : (
        <div className="w-full h-full bg-[#754bb2] border-4 border-[#8F60D0] rounded-full" />
      )}
      <AvatarRegenerateButton email={email} onAvatarUpdated={setAvatarUrl} />
    </div>
  );
}
