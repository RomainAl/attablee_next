"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioAdminStore } from "@/store/audio.admin.store";
import { memo } from "react";

const MixerFooter = memo(function MixerFooter() {
  const channelGains = useAudioAdminStore((s) => s.channelGains);
  const setChannelGain = useAudioAdminStore((s) => s.setChannelGain);

  return (
    // 1. Suppression du backdrop-blur et de la transition hover.
    // 2. Remplacement du bg-black/40 par un gris très sombre opaque (#0c0c0e).
    <footer className="z-60 absolute bottom-6 left-1/2 h-70 w-fit max-w-[90vw] -translate-x-1/2 overflow-x-auto rounded-3xl border border-white/10 bg-[#0c0c0e] px-8 shadow-xl custom-scrollbar">
      <div className="flex h-full items-center gap-1">
        {channelGains.map((gain, i) => (
          <div key={i} className="flex h-full min-w-9 flex-col items-center gap-2 py-4">
            {/* Gain value - Tabular nums pour éviter les micro-mouvements de texte */}
            <span className={cn("font-mono text-[9px] tabular-nums", gain > 0 ? "text-red-500 font-bold" : "text-zinc-700")}>{gain.toFixed(2)}</span>

            {/* Slider container */}
            <div className="flex-1 py-1">
              <Slider
                orientation="vertical"
                min={0}
                max={1}
                step={0.01}
                value={[gain]}
                onValueChange={(val) => setChannelGain(i, val)}
                className="h-full"
              />
            </div>

            {/* Channel index - Suppression du group-hover:text-white */}
            <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-600">C{i.toString().padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </footer>
  );
});

export default MixerFooter;
