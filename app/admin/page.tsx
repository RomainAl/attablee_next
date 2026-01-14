"use client";

import { AudioMeterMemo } from "@/components/audioMeter";
import { cn } from "@/lib/utils";
import { useAudioAdminStore } from "@/store/audio.admin.store";
import { useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { useEffect } from "react";
import { useUnmount } from "usehooks-ts";
import { useShallow } from "zustand/react/shallow";

// const NB = 20;
// const array = new Array(NB).fill(null);
export default function Home() {
  const userS_id = useWebrtcAdminStore(useShallow((store) => store.userS.filter((u) => u.peerCo).map((u) => u.id)));
  const audioContext = useAudioAdminStore((store) => store.audioContext);

  useEffect(() => {
    audioContext?.resume();
    // setAudioAnalyser();
  }, [audioContext]);

  useUnmount(() => {
    audioContext?.suspend();
  });

  return (
    <div className="flex size-full flex-row flex-wrap gap-0 justify-center content-start">
      {userS_id.map((user_id) => (
        <div
          key={user_id}
          className={cn("relative h-1/13 aspect-square border border-accent", {
            "h-full": userS_id.length <= 1,
            "h-1/2": userS_id.length > 1 && userS_id.length <= 6,
            "h-1/3": userS_id.length > 6 && userS_id.length <= 15,
            "h-1/4": userS_id.length > 15 && userS_id.length <= 28,
            "h-1/5": userS_id.length > 28 && userS_id.length <= 40,
            "h-1/6": userS_id.length > 40 && userS_id.length <= 60,
            "h-1/7": userS_id.length > 60 && userS_id.length <= 84,
            "h-1/8": userS_id.length > 84 && userS_id.length <= 112,
            "h-1/9": userS_id.length > 112 && userS_id.length <= 144,
            "h-1/10": userS_id.length > 144 && userS_id.length <= 170,
            "h-1/11": userS_id.length > 170 && userS_id.length <= 209,
            "h-1/12": userS_id.length > 209 && userS_id.length <= 252,
          })}
        >
          <div className="aspect-square w-full">
            <AudioMeterMemo id={user_id} />
          </div>
        </div>
      ))}
      {/* {array.map((user, i) => (
        <div
          key={i}
          className={cn("relative h-1/13 aspect-square border border-accent", {
            "h-full": NB <= 1,
            "h-1/2": NB > 1 && NB <= 6,
            "h-1/3": NB > 6 && NB <= 15,
            "h-1/4": NB > 15 && NB <= 28,
            "h-1/5": NB > 28 && NB <= 40,
            "h-1/6": NB > 40 && NB <= 60,
            "h-1/7": NB > 60 && NB <= 84,
            "h-1/8": NB > 84 && NB <= 112,
            "h-1/9": NB > 112 && NB <= 144,
            "h-1/10": NB > 144 && NB <= 170,
            "h-1/11": NB > 170 && NB <= 209,
            "h-1/12": NB > 209 && NB <= 252,
          })}
        >
          <div className="absolute top-0 flex size-full">
            <p
              className={cn("w-3/5 h-1/3 m-auto bg-background font-black text-primary flex items-center justify-center text-lg", {
                "text-xs font-base": NB > 94,
              })}
            >
              {"TOTO"}
            </p>
          </div>
        </div>
      ))} */}
    </div>
  );
}
