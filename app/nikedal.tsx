"use client";
import { useEffect } from "react";

type CrepitementsProps = {
  muted: boolean;
  tabNb: number;
  ref: React.RefObject<HTMLAudioElement | null>;
};

export const Nikedal = ({ ref, tabNb, muted }: CrepitementsProps) => {
  useEffect(() => {
    if (ref.current)
      if (tabNb === 42) {
        ref.current.muted = false;
        ref.current.loop = true;
      } else {
        ref.current.muted = true;
        ref.current.loop = false;
      }
  }, [tabNb, ref]);

  return <audio className="absolute z-50" ref={ref} src="/audios/nikedal.mp3" muted={muted} />;
};
