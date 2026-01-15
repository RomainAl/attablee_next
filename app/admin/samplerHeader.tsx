"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioAdminStore } from "@/store/audio.admin.store";
import { useState } from "react";

export default function SamplerHeader() {
  const globalGain = useAudioAdminStore((s) => s.globalClientsGain);
  const setGlobalGain = useAudioAdminStore((s) => s.setGlobalClientsGain);
  const autoSpeed = useAudioAdminStore((s) => s.autoRoutingSpeed);
  const setAutoSpeed = useAudioAdminStore((s) => s.setAutoRoutingSpeed);
  const isAuto = useAudioAdminStore((s) => s.autoRouting);
  const toggleAuto = useAudioAdminStore((s) => s.toggleAutoRouting);

  const [localSpeed, setLocalSpeed] = useState([autoSpeed]);
  const [prevAutoSpeed, setPrevAutoSpeed] = useState(autoSpeed);

  if (autoSpeed !== prevAutoSpeed) {
    setLocalSpeed([autoSpeed]);
    setPrevAutoSpeed(autoSpeed);
  }

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
        {/* AUTO-ROUTING */}
        <div className="flex items-center gap-5 pr-6 border-r border-white/5">
          <button
            onClick={toggleAuto}
            className={cn(
              "h-9 px-4 rounded-full text-[10px] font-black transition-all border shrink-0 tracking-widest",
              isAuto ? "bg-red-500 text-white" : "bg-white/5 text-white/30"
            )}
          >
            {isAuto ? "SPAT ON" : "SPAT OFF"}
          </button>

          <div className="flex flex-col justify-evenly w-32 gap-1">
            <span className="m-auto text-[10px] font-mono text-red-500 font-bold">{localSpeed[0]}s</span>

            <Slider
              max={60}
              min={0.5}
              step={1}
              value={localSpeed}
              onValueChange={setLocalSpeed}
              onValueCommit={setAutoSpeed}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* MASTER GAIN */}
        <div className="flex-1 flex items-center gap-6">
          <div className="flex flex-col min-w-17.5 text-center">
            <span className="text-[9px] text-white/20 font-black mb-1">MASTER GAIN</span>
            <span className="text-sm font-bold text-red-500 tabular-nums">{globalGain.toFixed(2)}</span>
          </div>
          <Slider max={1} min={0} step={0.01} value={[globalGain]} onValueChange={setGlobalGain} className="flex-1 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
