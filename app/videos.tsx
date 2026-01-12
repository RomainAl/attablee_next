import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type VideosProps = {
  tabNb: number;
  muted: boolean;
  ref: React.RefObject<HTMLVideoElement | null>;
};
export const Videos = ({ muted, tabNb, ref }: VideosProps) => {
  console.log("VIDEOS RENDER");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (ref.current)
      if (tabNb === 2) {
        ref.current.muted = false;
        ref.current.loop = true;
      } else {
        ref.current.muted = true;
        ref.current.loop = false;
      }
  }, [tabNb, ref]);
  // const audioContext = useAudioStore((s) => s.audioContext);
  // const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  // const gainNodeRef = useRef<GainNode | null>(null);

  // useEffect(() => {
  //   if (!audioContext || !ref.current || sourceRef.current) return;

  //   // 1. On crée le nœud source une fois et une seule
  //   const source = audioContext.createMediaElementSource(ref.current);

  //   // 2. On ajoute un GainNode pour gérer le volume proprement sans mute HTML
  //   const gainNode = audioContext.createGain();

  //   source.connect(gainNode);
  //   // On ne connecte pas encore à destination ici

  //   sourceRef.current = source;
  //   gainNodeRef.current = gainNode;

  //   return () => {
  //     // Nettoyage propre
  //     gainNode.disconnect();
  //   };
  // }, [audioContext]);

  // // Gestion de la connexion au Master selon la visibilité
  // useEffect(() => {
  //   if (!gainNodeRef.current || !audioContext) return;

  //   if (props.className?.includes("invisible")) {
  //     // gainNodeRef.current.gain.setTargetAtTime(0, audioContext.currentTime, 0.02);
  //     gainNodeRef.current.disconnect();
  //   } else {
  //     try {
  //       gainNodeRef.current.disconnect();
  //     } catch (e) {
  //       console.warn(e);
  //     }
  //     gainNodeRef.current.connect(audioContext.destination);
  //   }
  // }, [props.className, audioContext]);

  // useEffect(() => {
  //   if (!audioContext || !play) return;
  //   if (ref.current) {
  //     ref.current.play();
  //   }
  // }, [audioContext, play]);

  return (
    <div
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
        "landscape:w-full landscape:h-full",
        { "z-20": tabNb === 2 }
      )}
    >
      <video className={cn("object-cover size-full")} ref={ref} muted={muted} autoPlay={true} playsInline>
        <source src={`/videos/video${1}.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
