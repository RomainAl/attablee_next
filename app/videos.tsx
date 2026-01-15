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
    const unsubscribeGoto = useMessUserStore.subscribe(
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
    const unsubscribeVid = useMessUserStore.subscribe(
      (state) => state.vid,
      (value) => {
        const video = ref.current;
        if (!video) return;

        // On change la source directement sur l'élément video
        video.src = `/videos/video${value}.mp4`;

        // Load est indispensable pour que le navigateur prenne en compte la nouvelle source
        video.load();

        // Si on est déjà en mode "vidéo active", on relance le play
        if (useMessUserStore.getState().goto === 2) {
          video.play().catch(() => console.log("Play failed after source change"));
        }
      }
    );
    return () => {
      unsubscribeGoto();
      unsubscribeVid();
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
            ref.current.loop = true;
          }
        }
      }}
      className={cn(
        "absolute z-10 bg-black",
        "portrait:w-dvh portrait:h-dvw portrait:top-1/2 portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:rotate-90",
        "landscape:w-full landscape:h-full"
      )}
    >
      <video
        className="object-cover size-full"
        ref={ref}
        autoPlay
        playsInline
        muted
        // On définit la source initiale (video1 par défaut)
        src="/videos/video1.mp4"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
