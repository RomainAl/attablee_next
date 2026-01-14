import { useAudioAdminStore } from "@/store/audio.admin.store";
import { useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { memo, useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";

export const AudioMeterMemo = memo(function AudioMeter({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const refAudio = useRef<HTMLAudioElement>(null); // RÉ-AJOUTÉ

  const audioContext = useAudioAdminStore((store) => store.audioContext);
  const merger = useAudioAdminStore((store) => store.merger);
  const stream = useWebrtcAdminStore(useShallow((store) => store.userS.find((u) => u.id === id)?.stream));

  const requestRef = useRef<number>(null);

  const divisor = merger?.numberOfInputs ?? 2;
  const ch = parseInt(id.slice(-2)) % divisor || 0;

  useEffect(() => {
    if (!audioContext || !merger || !stream || !stream.active) return;

    const currentAudioEl = refAudio.current;
    // 1. ATTACHER LE FLUX À L'ÉLÉMENT AUDIO (Crucial !)
    if (currentAudioEl) {
      currentAudioEl.srcObject = stream;
      // On ne l'entend pas ici (muted), mais ça "active" le flux pour le WebAudio
    }

    const analyser = audioContext.createAnalyser();
    const splitter = audioContext.createChannelSplitter(2);
    const source = audioContext.createMediaStreamSource(stream);
    const gainStream = audioContext.createGain();
    gainStream.gain.value = useAudioAdminStore.getState().globalClientsGain;
    const unsub = useAudioAdminStore.subscribe(
      (state) => state.globalClientsGain,
      (value) => {
        gainStream.gain.setTargetAtTime(value, audioContext.currentTime, 0.05);
      }
    );
    source.connect(splitter);
    splitter.connect(analyser, 0);
    analyser.connect(gainStream);

    const gains = useAudioAdminStore.getState().mergerGains;

    if (ch < gains.length) {
      // On connecte le gain local du stream au fader de la console admin
      gainStream.connect(gains[ch]);
    }

    // --- VISU ---
    const draw = () => {
      analyser.fftSize = 32;
      const times = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(times);

      let sum = 0;
      for (const v of times) sum += Math.abs(v / 128 - 1);

      if (ref.current) {
        const intensity = Math.min(sum * 500, 255); // Ajuste le multiplicateur selon le gain
        ref.current.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
      }
      requestRef.current = requestAnimationFrame(draw);
    };
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      source.disconnect();
      splitter.disconnect();
      analyser.disconnect();
      gainStream.disconnect();
      unsub();
      if (currentAudioEl) {
        currentAudioEl.srcObject = null;
        currentAudioEl.load(); // Force la libération des ressources sur certains navigateurs
      }
    };
  }, [audioContext, merger, stream, ch]);

  return (
    <div className="size-full border border-white/5 relative" ref={ref}>
      <audio ref={refAudio} autoPlay muted playsInline className="hidden" />
    </div>
  );
});
