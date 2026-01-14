"use client";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Volume2, VolumeOff } from "lucide-react";
import { RefObject, useEffect, useState } from "react";

interface MasterVolumeProps {
  masterGainRef: RefObject<GainNode | null>;
  audioContext: AudioContext | null;
}

export const MasterGain = ({ masterGainRef, audioContext }: MasterVolumeProps) => {
  const [volume, setVolume] = useState(0.8);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (masterGainRef.current && audioContext) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);
    }
  }, [volume, audioContext, masterGainRef]);

  return (
    <div className="relative size-14 flex items-center justify-center">
      {/* 1. Div avec bg-foreground (couleur claire) */}
      <div
        className={cn(
          "absolute bottom-20 w-12 bg-foreground border border-white/20 rounded-full py-6 flex flex-col items-center gap-4 transition-all duration-300 shadow-2xl",
          showVolume ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <div className="h-40 w-1 flex items-center justify-center">
          {/* 2. Slider avec couleurs inversées via CSS local ou classes spécifiques */}
          <Slider
            orientation="vertical"
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            // On force les couleurs sombres sur le fond clair
            className="h-full [&&_.relative]:bg-black/20 [&&_.bg-primary]:bg-black [&&_.border-primary]:border-black"
          />
        </div>
      </div>

      <button
        onClick={() => setShowVolume(!showVolume)}
        className={cn(
          "size-14 rounded-full flex items-center justify-center transition-all active:scale-90 border",
          showVolume ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/20 backdrop-blur-md"
        )}
      >
        {volume === 0 ? <VolumeOff className="size-6" /> : <Volume2 className="size-6" />}
      </button>
    </div>
  );
};
