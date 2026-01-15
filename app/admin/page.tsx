"use client";
import { AudioMeterMemo } from "@/components/audioMeter";
import { cn } from "@/lib/utils";
import { useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { useShallow } from "zustand/shallow";
import SamplerHeader from "./samplerHeader";

export default function Home() {
  const userS_id = useWebrtcAdminStore(useShallow((store) => store.userS.filter((u) => u.peerCo).map((u) => u.id)));

  return (
    <div className="relative size-full bg-black overflow-hidden font-mono">
      {/* HEADER / BARRE DE GAIN FLOTTANTE */}
      <SamplerHeader />

      {/* GRILLE DE MONITORING */}
      <div className="flex size-full flex-row flex-wrap gap-0 justify-center content-center bg-zinc-950">
        {userS_id.map((user_id) => (
          <div
            key={user_id}
            className={cn("relative transition-all duration-500 ease-in-out border-[0.5px] border-white/5", {
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
            {/* Petit indicateur de canal discret en overlay */}
            <div className="absolute top-1 left-1 z-10 text-[11px] text-red-500 pointer-events-none">ID:{user_id.slice(-4)}</div>

            <div className="size-full overflow-hidden">
              <AudioMeterMemo id={user_id} />
            </div>
          </div>
        ))}

        {/* Empty state si personne n'est connecté */}
        {userS_id.length === 0 && (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <div className="w-12 h-12 border-2 border-dashed border-white rounded-full animate-spin-slow" />
            <p className="text-[10px] tracking-widest uppercase">Waiting for streams...</p>
          </div>
        )}
      </div>
    </div>
  );
}
