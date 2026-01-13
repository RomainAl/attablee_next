"use client";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAudioStore } from "@/store/audio.user.store";

interface EffectControlProps {
  name: string;
}

export const EffectControl = ({ name }: EffectControlProps) => {
  const isActive = useAudioStore((s) => s.activeEffects.includes(name));
  const toggleEffect = useAudioStore((s) => s.toggleEffect);
  const devices = useAudioStore((s) => s.devices);

  // Helper pour modifier le paramètre principal de l'effet
  const setParam = (value: number) => {
    const device = devices[name];
    if (device && device.parameters.length > 0) {
      // On prend le premier paramètre ou on cible par nom spécifique
      // Ici, on adapte selon le nom de l'effet pour l'exemple
      const paramName = name === "delay" ? "time" : "drive";
      const p = device.parameters.find((p) => p.name === paramName);
      if (p) p.value = value;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <Label htmlFor={`switch-${name}`} className="text-sm font-bold uppercase tracking-widest text-white/80">
          {name}
        </Label>
        <Switch id={`switch-${name}`} checked={isActive} onCheckedChange={() => toggleEffect(name)} className="data-[state=checked]:bg-primary" />
      </div>

      {/* ON AFFICHE LE SLIDER UNIQUEMENT SI ACTIF */}
      {isActive && (
        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Slider max={100} min={0} step={0.1} onValueChange={([v]) => setParam(v)} />
        </div>
      )}
    </div>
  );
};
