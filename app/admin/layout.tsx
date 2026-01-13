"use client";

import { Button } from "@/components/ui/button";
import { setCurrentPage } from "@/store/mess.admin.store";
import { createPeer, reconnUsers } from "@/store/webrtc.admin.store";
import { useRef } from "react";
import { useEventListener } from "usehooks-ts";

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log("RENDER ADMIN LAYOUT !");
  const pageRef = useRef<HTMLDivElement>(null!);

  const initAdmin = () => {
    createPeer();
    // setAdminAudio().then(() => {
    //   setAudioAnalyser();
    // });
    // setMidis();
  };

  const requestFullscreen = () => {
    const element = pageRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  const handleDoubleClick = () => {
    if (!document.fullscreenElement) {
      // Vérifie si on n'est pas déjà en plein écran
      requestFullscreen();
    } else {
      // Optionnellement, on pourrait gérer la sortie du plein écran ici
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEventListener("dblclick", handleDoubleClick, pageRef);

  return (
    <div ref={pageRef} className="h-dvh w-dvw flex flex-col">
      <div className="w-full h-fit z-50 flex flex-row gap-1">
        <Button variant={"destructive"} onClick={initAdmin}>
          INIT
        </Button>
        <Button
          onClick={() => {
            setCurrentPage(1);
          }}
        >
          SAMPLER
        </Button>
        <Button
          onClick={() => {
            setCurrentPage(2);
          }}
        >
          VIDEOS
        </Button>
        <Button
          onClick={() => {
            setCurrentPage(3);
          }}
        >
          NOISE
        </Button>
        <Button
          onClick={() => {
            setCurrentPage(42);
          }}
        >
          NIKEDAL
        </Button>
        <Button
          onClick={() => {
            setCurrentPage(4);
          }}
        >
          FIN
        </Button>
        <Button variant={"destructive"} onClick={reconnUsers} className="ml-auto">
          RECONNECT ALL
        </Button>
      </div>
      {children}
    </div>
  );
}
