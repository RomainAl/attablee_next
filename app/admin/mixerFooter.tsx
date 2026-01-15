"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioAdminStore } from "@/store/audio.admin.store";
import { memo } from "react";

const MixerFooter = memo(function MixerFooter() {
  const channelGains = useAudioAdminStore((s) => s.channelGains);
  const setChannelGain = useAudioAdminStore((s) => s.setChannelGain);

  return (
    <footer className="z-60 absolute bottom-6 left-1/2 h-70 w-fit max-w-[90vw] -translate-x-1/2 overflow-x-auto rounded-3xl border border-white/10 bg-black/40 px-8 backdrop-blur-xl transition-colors duration-500 hover:bg-black/60 shadow-2xl custom-scrollbar">
      <div className="flex h-full items-center gap-1">
        {channelGains.map((gain, i) => (
          <div key={i} className="group flex h-full min-w-9 flex-col items-center gap-2 py-4">
            {/* Gain value */}
            <span className={cn("font-mono text-[9px] tabular-nums transition-colors", gain > 0 ? "text-red-500" : "text-white/20")}>
              {gain.toFixed(2)}
            </span>

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

            {/* Channel index */}
            <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 group-hover:text-white/60">
              C{i.toString().padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </footer>
  );
});

export default MixerFooter;
