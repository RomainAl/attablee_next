"use client";

import { VideosButtonsMemo } from "@/components/videosButtons";
import { cn } from "@/lib/utils";
import { useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { useShallow } from "zustand/react/shallow"; // Correction import
import SamplerHeader from "./samplerHeader";

export default function Videos() {
  const userS_id = useWebrtcAdminStore(useShallow((store) => store.userS.filter((u) => u.peerCo).map((u) => u.id)));

  return (
    <div className="size-full overflow-hidden bg-zinc-950">
      {/* HEADER / BARRE DE GAIN FLOTTANTE */}
      <SamplerHeader />

      {/* GRILLE DE MONITORING - Retrait des calculs de flex compliqués au profit d'un layout simple */}
      <div className="flex size-full flex-row flex-wrap gap-0 justify-center content-center">
        {userS_id.map((user_id) => (
          <div
            key={user_id}
            // SUPPRESSION : transition-all duration-500 ease-in-out
            // On garde une bordure opaque pour éviter l'alpha-blending (border-white/5 -> border-[#121212])
            className={cn("relative border-[0.5px] border-[#1a1a1a]", {
              "h-full aspect-square": userS_id.length <= 1,
              "h-1/2 aspect-square": userS_id.length > 1 && userS_id.length <= 4,
              "h-1/3 aspect-square": userS_id.length > 4 && userS_id.length <= 9,
              "h-1/4 aspect-square": userS_id.length > 9 && userS_id.length <= 16,
              "h-1/5 aspect-square": userS_id.length > 16 && userS_id.length <= 25,
              "h-1/6 aspect-square": userS_id.length > 25 && userS_id.length <= 36,
              "h-1/8 aspect-square": userS_id.length > 36 && userS_id.length <= 64,
              "h-1/10 aspect-square": userS_id.length > 64 && userS_id.length <= 100,
              "h-1/12 aspect-square": userS_id.length > 100,
            })}
          >
            {/* ID INDICATOR - Texte opaque sans fioritures */}
            <div className="absolute top-1 left-1 z-10 text-[9px] text-red-800 font-black pointer-events-none select-none">{user_id.slice(-4)}</div>

            <div className="size-full overflow-hidden bg-black">
              <VideosButtonsMemo id={user_id} />
            </div>
          </div>
        ))}

        {/* EMPTY STATE - Simplifié (pas d'animation spin) */}
        {userS_id.length === 0 && (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <p className="text-[10px] tracking-widest uppercase font-black text-white">No Peer Connected</p>
          </div>
        )}
      </div>
    </div>
  );
}
