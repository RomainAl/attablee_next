"use client";
import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect } from "react";
type CrepitementsProps = {
  ref: React.RefObject<HTMLAudioElement | null>;
};
export const Crepitements = ({ ref }: CrepitementsProps) => {
  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
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
      }
    );

    return () => {
      unsubscribeGain();
    };
  }, [ref]);

  return <audio className="absolute bottom-0 z-50" ref={ref} src="/audios/crepitements1.mp3" />;
};
