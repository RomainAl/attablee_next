"use client";
import { useEffect } from "react";
type CrepitementsProps = {
  muted: boolean;
  tabNb: number;
  ref: React.RefObject<HTMLAudioElement | null>;
};
export const Crepitements = ({ ref, tabNb, muted }: CrepitementsProps & { tabNb: number }) => {
  useEffect(() => {
    if (ref.current)
      if (tabNb === 3) {
        ref.current.muted = false;
        ref.current.loop = true;
      } else {
        ref.current.muted = true;
        ref.current.loop = false;
      }
  }, [tabNb, ref]);
  return <audio className="absolute bottom-0 z-50" ref={ref} src="/audios/crepitements1.mp3" muted={muted} />;
};
