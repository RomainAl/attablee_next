"use client";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audio.user.store";
import { useCallback } from "react";

interface EffectControlProps {
  name: string;
}

// 1. Mapping des noms d'effets vers leurs paramètres RNBO respectifs
const PARAM_MAP: Record<string, string> = {
  delay: "time",
  disto: "drive",
  reverb: "decay",
  downsample: "down-sample",
};

export const EffectControl = ({ name }: EffectControlProps) => {
  const isActive = useAudioStore((s) => s.activeEffects.includes(name));
  const toggleEffect = useAudioStore((s) => s.toggleEffect);
  const devices = useAudioStore((s) => s.devices);

  // 2. On récupère le nom du paramètre via le mapping (fallback sur "drive" au cas où)
  const targetParamName = PARAM_MAP[name] || "drive";
  const device = devices[name];

  const param = device?.parameters.find((p) => p.name === targetParamName);

  const currentValue = param?.value ?? 0;
  const min = param?.min ?? 0;
  const max = param?.max ?? 100;
  // On s'assure que le step ne soit pas à 0 si min === max
  const step = max > min ? (max - min) / 100 : 0.01;

  const handleValueChange = useCallback(
    ([v]: number[]) => {
      // On utilise targetParamName ici aussi
      const p = devices[name]?.parameters.find((p) => p.name === targetParamName);
      if (p) {
        p.value = v;
      }
    },
    [devices, name, targetParamName]
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300",
        isActive ? "bg-white/15 border-white/20 shadow-lg" : "bg-white/5 border-white/5 opacity-60"
      )}
    >
      <label htmlFor={`switch-${name}`} className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-bold uppercase tracking-widest text-white/80 group-active:scale-95 transition-transform">{name}</span>
        <Switch
          id={`switch-${name}`}
          checked={isActive}
          onCheckedChange={() => toggleEffect(name)}
          className="data-[state=checked]:bg-primary pointer-events-none"
        />
      </label>

      {isActive && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Slider max={max} min={min} step={step} defaultValue={[currentValue]} onValueChange={handleValueChange} />
        </div>
      )}
    </div>
  );
};
