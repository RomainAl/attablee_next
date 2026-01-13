import { cn } from "@/lib/utils";
import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect, useRef, useState } from "react";

type VideosProps = {
  ref: React.RefObject<HTMLVideoElement | null>;
};
export const Videos = ({ ref }: VideosProps) => {
  console.log("VIDEOS RENDER");
  const refDiv = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (ref.current && refDiv.current)
          if (value === 2) {
            ref.current.muted = false;
            ref.current.loop = true;
            refDiv.current.style.zIndex = "20";
            ref.current.play().catch(() => {
              console.log("Pas possible de play()");
            });
            ref.current.currentTime = 0;
          } else {
            ref.current.muted = true;
            ref.current.loop = false;
            refDiv.current.style.zIndex = "10";
            ref.current.pause();
          }
      }
    );
    return () => {
      unsubscribeGain();
    };
  }, [ref]);

  return (
    <div
      ref={refDiv}
      onClick={() => {
        if (ref.current) {
          if (!isPlaying) {
            ref.current.play().then(() => setIsPlaying(true));
            ref.current.muted = false;
          }
        }
      }}
      className={cn(
        "absolute z-10",
        "portrait:w-dvh portrait:h-dvw portrait:top-1/2 portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:rotate-90",
        "landscape:w-full landscape:h-full"
      )}
    >
      <video className={cn("object-cover size-full")} ref={ref} autoPlay={true} playsInline muted>
        <source src={`/videos/video${1}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
