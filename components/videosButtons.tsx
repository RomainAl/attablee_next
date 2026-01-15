"use client";

import { cn } from "@/lib/utils";
import { send1UserMess } from "@/store/webrtc.admin.store";
import { memo, useState } from "react";

export const VideosButtonsMemo = memo(function VideosButtons({ id }: { id: string }) {
  const [currentVid, setCurrentVid] = useState(0);

  const handlePress = (num: number) => {
    send1UserMess({ vid: num }, id);
    setCurrentVid(num);
  };

  return (
    <div className="relative size-full border border-white/5 bg-zinc-950 p-1">
      {/* Grille brute sans fioritures */}
      <div className="grid grid-cols-4 grid-rows-4 gap-1 h-full w-full">
        {[...Array(16)].map((_, i) => {
          const num = i + 1;
          const isActive = currentVid === num;

          return (
            <button
              key={i}
              onClick={() => handlePress(num)}
              className={cn(
                "flex items-center justify-center rounded-sm border tabular-nums",
                "text-[10px] font-mono font-black",
                isActive ? "bg-amber-600 border-amber-400 text-white" : "bg-zinc-900 border-white/5 text-white/20 hover:bg-zinc-800"
              )}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
});
