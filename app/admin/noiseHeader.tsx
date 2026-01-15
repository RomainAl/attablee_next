import { Slider } from "@/components/ui/slider";
import { setCurrentPage } from "@/store/mess.admin.store";
import { sendRandomUserMess } from "@/store/webrtc.admin.store";
import { useState } from "react";

export const NoiseHeader = () => {
  const [percent, setPercent] = useState(100);
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      {/* Suppression du shadow-2xl et réduction de l'arrondi pour plus de sobriété */}
      <div className="bg-[#09090b] border border-[#1a1a1a] rounded-2xl px-6 py-4 flex items-center gap-8 shadow-md">
        {/* ACTION GROUP (START/STOP) - Zéro transition, couleurs fixes */}
        <div className="flex items-center gap-1 pr-8 border-r border-[#1a1a1a]">
          <button
            onClick={() => sendRandomUserMess({ goto: 3 }, percent)}
            // Retrait du hover:bg et de toute transition
            className="h-12 px-6 rounded-l-md text-[11px] font-black bg-red-700 text-white border-r border-red-900 active:bg-red-800 tracking-[0.2em]"
          >
            START
          </button>
          <button
            onClick={() => setCurrentPage(4)}
            // Retrait du hover:bg, couleur de texte zinc-600 fixe
            className="h-12 px-6 rounded-r-md text-[11px] font-black bg-[#121212] text-zinc-600 border border-[#1a1a1a] active:bg-black tracking-[0.2em]"
          >
            STOP
          </button>
        </div>

        {/* DENSITY SLIDER */}
        <div className="flex flex-col flex-1 gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Noise Target Density</span>
            <div className="bg-black px-2 py-0.5 rounded border border-[#1a1a1a]">
              <span className="text-xs font-mono text-red-600 font-bold">{percent}%</span>
            </div>
          </div>
          <Slider max={100} min={0} step={1} value={[percent]} onValueChange={(v) => setPercent(v[0])} className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
