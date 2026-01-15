"use client";

import { AudioMeterMemo } from "@/components/audioMeter";
import { cn } from "@/lib/utils";
import { useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { useShallow } from "zustand/react/shallow";
import SamplerHeader from "./samplerHeader";

export default function Sampler() {
  const userS_id = useWebrtcAdminStore(useShallow((store) => store.userS.filter((u) => u.peerCo).map((u) => u.id)));

  return (
    <div className="size-full overflow-hidden bg-black">
      {/* HEADER / BARRE DE GAIN FLOTTANTE */}
      <SamplerHeader />

      {/* GRILLE DE MONITORING - Layout statique haute performance */}
      <div className="flex size-full flex-row flex-wrap gap-0 justify-center content-center">
        {userS_id.map((user_id) => (
          <div
            key={user_id}
            // SUPPRESSION : transition-all duration-500
            // Remplacement des couleurs transparentes par du solide
            className={cn("relative border-[0.5px] border-[#111]", {
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
            {/* Overlay ID - Statique et opaque */}
            <div className="absolute top-1 left-1 z-10 text-[9px] font-black text-red-900 pointer-events-none select-none">
              ID:{user_id.slice(-4)}
            </div>

            <div className="size-full bg-[#050505]">
              <AudioMeterMemo id={user_id} />
            </div>
          </div>
        ))}

        {/* Empty state sans animation de rotation */}
        {userS_id.length === 0 && (
          <div className="flex flex-col items-center gap-2 opacity-10">
            <p className="text-[10px] tracking-widest uppercase text-white font-bold">Waiting for streams...</p>
          </div>
        )}
      </div>
    </div>
  );
}
