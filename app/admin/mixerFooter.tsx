import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioAdminStore } from "@/store/audio.admin.store";

export default function MixerFooter() {
  console.log("RENDER FOOTER");
  // On s'abonne uniquement au tableau des gains pour ce composant
  const channelGains = useAudioAdminStore((s) => s.channelGains);
  const setChannelGain = useAudioAdminStore((s) => s.setChannelGain);

  return (
    <footer
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] 
                       w-fit max-w-[90vw] h-70
                       bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl
                       flex items-center px-8 gap-1 shadow-2xl overflow-x-auto custom-scrollbar"
    >
      {channelGains.map((gain, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[36px] h-full py-4 group">
          {/* Niveau numérique (Gain) */}
          <span className={cn("text-[11px] font-mono tabular-nums transition-colors", gain > 0 ? "text-red-500" : "text-white/20")}>
            {gain.toFixed(2)}
          </span>

          {/* Slider Vertical */}
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

          {/* Index du Canal */}
          <span className="text-[11px] font-black text-white/30 uppercase tracking-tighter">C{i.toString().padStart(2, "0")}</span>
        </div>
      ))}
    </footer>
  );
}
