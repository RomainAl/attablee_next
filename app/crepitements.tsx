"use client";
import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect } from "react";
type CrepitementsProps = {
  ref: React.RefObject<HTMLAudioElement | null>;
};
export const Crepitements = ({ ref }: CrepitementsProps) => {
  const startChaosVibration = () => {
    if (!("vibrate" in navigator)) return null;

    const interval = setInterval(() => {
      // Génère 3 durées aléatoires pour un pattern [vibration, pause, vibration]
      // Entre 20ms (très court) et 150ms (secousse plus longue)
      const v1 = Math.floor(Math.random() * 130) + 20;
      const p1 = Math.floor(Math.random() * 100) + 10;
      const v2 = Math.floor(Math.random() * 130) + 20;

      navigator.vibrate([v1, p1, v2]);
    }, 300); // Se relance toutes les 300ms pour maintenir la vibration

    return interval;
  };

  useEffect(() => {
    let vibrationInterval: NodeJS.Timeout | null = null;
    const unsubscribeGoto = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (ref.current)
          if (value === 3) {
            ref.current.muted = false;
            ref.current.loop = true;
            ref.current.play().catch(() => {
              console.log("Pas possible de play()");
            });
          } else {
            ref.current.muted = true;
            ref.current.loop = false;
            ref.current.pause();
          }
        if (value === 3) {
          // ON ACTIVE LA VIBRATION CHAOTIQUE
          if (!vibrationInterval) {
            vibrationInterval = startChaosVibration();
          }
        } else {
          // ON ARRÊTE TOUT
          if (vibrationInterval) {
            clearInterval(vibrationInterval);
            vibrationInterval = null;
            navigator.vibrate(0); // Stop immédiat
          }
        }
      }
    );

    return () => {
      unsubscribeGoto();
    };
  }, [ref]);

  return <audio className="absolute bottom-0 z-50" ref={ref} src="/audios/crepitements1.mp3" />;
};
