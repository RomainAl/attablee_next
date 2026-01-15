import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect, useRef } from "react";

export default function Blackout() {
  const refDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (refDiv.current) {
          refDiv.current.style.zIndex = value === 4 ? "20" : "10";
        }
      }
    );
    return () => unsubscribeGain();
  }, []);

  return <div ref={refDiv} className="absolute z-0 size-full bg-black"></div>;
}
