"use client";

import { useAudioAdminStore } from "@/store/audio.admin.store";
import { NoiseHeader } from "./noiseHeader";

export default function Noise() {
  const reverb = useAudioAdminStore((s) => s.reverb);
  console.log(reverb);
  // const source = useAudioAdminStore((s) => s.source);
  // console.log(devices["freeze"].parameters);
  // console.log(source);
  return (
    <div className="size-full overflow-hidden bg-black">
      {/* HEADER / BARRE DE GAIN FLOTTANTE */}
      <NoiseHeader />
      {/* <Button onClick={loadRNBOReverb}>TEST</Button>
      <Button onClick={loadRNBOfreeze}>TEST</Button>
      <Button
        onClick={() => {
          const { audioContext, merger } = useAudioAdminStore.getState();
          if (!audioContext || !merger) return;
          audioContext.resume();
          merger.disconnect();
          merger.connect(audioContext.destination);
        }}
      >
        PANIC
      </Button> */}
    </div>
  );
}
