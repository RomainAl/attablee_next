"use client";
import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect } from "react";

type CrepitementsProps = {
  ref: React.RefObject<HTMLAudioElement | null>;
};

export const Nikedal = ({ ref }: CrepitementsProps) => {
  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (ref.current)
          if (value === 42) {
            ref.current.muted = false;
            ref.current.loop = true;
            ref.current.currentTime = 0;
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

  return <audio className="absolute z-50" ref={ref} src="/audios/nikedal.mp3" />;
};
