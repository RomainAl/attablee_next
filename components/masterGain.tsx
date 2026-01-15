"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { sendMess } from "@/store/webrtc.user.store";
import { Speaker, Volume2, VolumeOff } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
// Importe ton sendMess et ton store ici
// import { sendMess, useAudioStore } from "@/store/audio.store";

interface UserAudioProps {
  masterGainRef: RefObject<GainNode | null>;
  audioContext: AudioContext | null;
}

export const MasterGain = ({ masterGainRef, audioContext }: UserAudioProps) => {
  const [volume, setVolume] = useState(0.8);
  const [showMenu, setShowMenu] = useState(false);

  // 1. État local pour gérer le bouton actif (Toggle entre eux)
  const [activeCh, setActiveCh] = useState<number>(0);

  useEffect(() => {
    if (masterGainRef.current && audioContext) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);
    }
  }, [volume, audioContext, masterGainRef]);

  const handleSpeakerChange = (ch: number) => {
    // 2. On met à jour l'état local : ça désactive automatiquement l'ancien
    setActiveCh(ch);
    sendMess({ audioChan: ch });
    // 3. Envoi du message via la fonction externe Zustand
    // sendMess({ speaker: { id: "user-id", ch } });
    console.log(`Switched to Speaker C${ch + 1}`);
  };

  return (
    <div className="relative size-14 flex items-center justify-center">
      {/* MENU VERTICAL */}
      <div
        className={cn(
          "absolute bottom-20 flex flex-col items-center gap-4 transition-all duration-300",
          showMenu ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {/* PILE DE 6 BOUTONS SPEAKERS (MODE RADIO) */}
        <div className="flex flex-col-reverse gap-3">
          {[...Array(6)].map((_, i) => {
            const isActive = activeCh === i; // Détermine si ce bouton est l'actif

            return (
              <button
                key={i}
                type="button" // Sécurité pour éviter les soumissions de formulaire
                onClick={() => handleSpeakerChange(i)}
                className={cn(
                  "relative size-11 rounded-full flex items-center justify-center transition-all border shadow-xl active:scale-95",
                  isActive
                    ? "bg-black text-white border-red-500  scale-120 z-10"
                    : "bg-foreground text-black border-black/10 hover:text-black hover:border-black/30"
                )}
              >
                <Speaker className={cn("size-5", isActive ? "animate-pulse" : "")} />

                {/* INDICE NUMÉRIQUE */}
                <span
                  className={cn(
                    "absolute -bottom-1 -right-1 size-5 rounded-full text-[9px] font-black flex items-center justify-center border-2 transition-colors",
                    isActive ? "bg-red-500 text-white border-black" : "bg-black text-white border-foreground"
                  )}
                >
                  {i + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* SLIDER DE VOLUME */}
        <div className="w-12 bg-foreground border border-black/5 rounded-full py-6 flex flex-col items-center gap-4 shadow-2xl">
          <div className="h-40 w-1 flex items-center justify-center">
            <Slider
              orientation="vertical"
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              className="h-full [&&_.relative]:bg-black/10 [&&_.bg-primary]:bg-black [&&_.border-primary]:border-black"
            />
          </div>
        </div>
      </div>

      {/* BOUTON PRINCIPAL (TRIGGER) */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "size-14 rounded-full flex items-center justify-center transition-all active:scale-90 border z-50 shadow-lg",
          showMenu ? "bg-white text-black border-white ring-4 ring-white/10" : "bg-zinc-900 text-white border-white/10 backdrop-blur-md"
        )}
      >
        {volume === 0 ? <VolumeOff className="size-6" /> : <Volume2 className="size-6" />}
      </button>
    </div>
  );
};
