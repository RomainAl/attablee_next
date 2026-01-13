"use client";
import { useAudioStore } from "@/store/audio.user.store";
import { EffectControl } from "./effectControl"; // Ton composant avec Switch
import { SamplerControl } from "./samplerControl"; // Le nouveau composant

export const EffectList = () => {
  const names = useAudioStore((s) => s.names);
  const reversedNames = [...names].reverse();
  return (
    <div className="flex flex-col gap-4">
      {reversedNames.map((name) => {
        // Si c'est le sampler, on utilise le contrôle spécial sans Switch
        if (name === "sampler") {
          return <SamplerControl key={name} />;
        }
        // Sinon, on garde le comportement avec Toggle
        return <EffectControl key={name} name={name} />;
      })}
    </div>
  );
};
