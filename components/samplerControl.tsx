"use client";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/store/audio.user.store";
import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

export const SamplerControl = () => {
  const devices = useAudioStore((s) => s.devices);
  const [resetKey, setResetKey] = useState(0);

  const sampler = devices["sampler"];

  // 1. On récupère les OBJETS paramètres pour lire les bornes dynamiques
  const pitchParamObj = sampler?.parameters.find((p) => p.name === "pitch");

  // 2. On extrait les min/max/valeurs pour le rendu (Lecture seule ici)
  const pitchMin = pitchParamObj?.min ?? -2400;
  const pitchMax = pitchParamObj?.max ?? 2400;
  const pitchInitial = 1;

  const randInitial = 0;

  const handleParamChange = useCallback(
    (paramName: string, value: number) => {
      const p = devices["sampler"]?.parameters.find((p) => p.name === paramName);
      if (p) p.value = value;
    },
    [devices]
  );

  const handleParamRandPlay = useCallback(
    (value: number) => {
      const metro_speed = devices["sampler"]?.parameters.find((p) => p.name === "metro_speed");
      const rand_play = devices["sampler"]?.parameters.find((p) => p.name === "rand_play");
      const loop_start_point = devices["sampler"]?.parameters.find((p) => p.name === "loop_start_point");
      if (!metro_speed || !rand_play || !loop_start_point) return;
      if (value === 0) {
        rand_play.value = 1;
        loop_start_point.value = 0;
        metro_speed.value = 2000;
      } else {
        rand_play.value = 0;
        loop_start_point.value = 1;
        metro_speed.value = (1 - value) * 1000 + 10;
      }
    },
    [devices]
  );

  const handleReset = useCallback(() => {
    const s = devices["sampler"];
    if (!s) return;
    const pPitch = s.parameters.find((p) => p.name === "pitch");
    const metro_speed = s.parameters.find((p) => p.name === "metro_speed");
    const rand_play = s.parameters.find((p) => p.name === "rand_play");
    const loop_start_point = s.parameters.find((p) => p.name === "loop_start_point");
    if (pPitch) pPitch.value = 1;
    if (rand_play) rand_play.value = 1;
    if (loop_start_point) loop_start_point.value = 0;
    if (metro_speed) metro_speed.value = 2000;

    setResetKey((prev) => prev + 1);
  }, [devices]);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-white/20 bg-white/15 shadow-lg">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-bold uppercase tracking-widest text-primary">Main Sampler</Label>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-white/50 hover:bg-white/10 hover:text-primary transition-colors active:scale-95"
        >
          <RotateCcw size={10} />
          RESET
        </button>
      </div>

      <div className="space-y-6 mt-2">
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-white/40 uppercase font-medium">
            <span>Pitch</span>
          </div>
          <Slider
            key={`pitch-${resetKey}`}
            max={pitchMax}
            min={pitchMin}
            step={(pitchMax - pitchMin) / 100}
            defaultValue={[pitchInitial]}
            onValueChange={([v]) => handleParamChange("pitch", v)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-white/40 uppercase font-medium">
            <span>Random play</span>
          </div>
          <Slider key={`rand-${resetKey}`} max={1} min={0} step={0.01} defaultValue={[randInitial]} onValueChange={([v]) => handleParamRandPlay(v)} />
        </div>
      </div>
    </div>
  );
};
