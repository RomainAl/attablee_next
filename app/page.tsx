"use client";
import { NikedalCanvas } from "@/components/nikedalCanvas";
import { NoiseCanvas } from "@/components/noiseCanvas";
import { setInitMessUserStore } from "@/store/mess.user.store";
import { setToast } from "@/store/shared.store";
import { createPeer, useWebrtcUserStore } from "@/store/webrtc.user.store";
import { useRef, useState } from "react";
import { Accueil } from "./accueil";
import { Crepitements } from "./crepitements";
import { Fin } from "./fin";
import Layout_mine from "./layout_mine";
import { Nikedal } from "./nikedal";
import { Reco } from "./reco";
import { Sampler } from "./sampler";
import { Videos } from "./videos";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export default function Home() {
  console.log("HOME RENDER");
  const crepRef = useRef<HTMLAudioElement>(null);
  const nikRef = useRef<HTMLAudioElement>(null);
  const videosRef = useRef<HTMLVideoElement>(null);
  const peerDeco = useWebrtcUserStore((store) => store.peerDeco);
  const [begining, setBegining] = useState(true);

  const start = () => {
    try {
      setInitMessUserStore();
      createPeer();
      setTimeout(() => {
        setBegining(false);
      }, 20000);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
        setToast({ type: "error", data: { title: "Oh zut !", content: "Une erreur s'est produite !" }, autoClose: false });
      }
      return;
    }

    if (crepRef.current) {
      crepRef.current.muted = false;
      crepRef.current.play();
    }
    if (nikRef.current) {
      nikRef.current.muted = false;
      nikRef.current.play();
    }
    if (videosRef.current) {
      videosRef.current.muted = false;
    }
  };

  return (
    <main className="size-full">
      <Layout_mine>
        {
          <div className="relative size-full">
            {peerDeco && !begining && <Reco />}
            <Accueil start={start} />
            <Sampler />
            <Videos ref={videosRef} />
            <NoiseCanvas />
            <Crepitements ref={crepRef} />
            <NikedalCanvas />
            <Nikedal ref={nikRef} />
            <Fin />
          </div>
        }
      </Layout_mine>
    </main>
  );
}
