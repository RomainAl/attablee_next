"use client";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAudioStore } from "@/store/audio.user.store";

export const SamplerControl = () => {
  const devices = useAudioStore((s) => s.devices);

  const setParam = (paramName: string, value: number) => {
    const sampler = devices["sampler"];
    if (sampler) {
      const p = sampler.parameters.find((p) => p.name === paramName);
      if (p) p.value = value;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-accent rounded-2xl border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
      <Label className="text-sm font-bold uppercase tracking-widest text-primary">Main Sampler</Label>

      <div className="space-y-6">
        {/* Premier Slider : Grain Size ou Pitch par exemple */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-white/40 uppercase">
            <span>Grain Size</span>
          </div>
          <Slider max={100} min={0} step={0.1} onValueChange={([v]) => setParam("size", v)} className="bg-black/20" />
        </div>

        {/* Deuxième Slider : Spray ou Gain par exemple */}
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-white/40 uppercase">
            <span>Spray / Random</span>
          </div>
          <Slider max={100} min={0} step={0.1} onValueChange={([v]) => setParam("rand_play", v)} className="bg-black/20" />
        </div>
      </div>
    </div>
  );
};
