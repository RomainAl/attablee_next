"use client";

import { useRef } from "react";
import { useEventListener } from "usehooks-ts";
import Header from "./header";
import MixerFooter from "./mixerFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log("RENDER LAYOUT");
  const pageRef = useRef<HTMLDivElement>(null!);

  const handleDoubleClick = () => {
    if (!document.fullscreenElement) {
      pageRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEventListener("dblclick", handleDoubleClick, pageRef);

  return (
    <div ref={pageRef} className="h-dvh w-dvw flex flex-col bg-[#050505] text-white selection:bg-red-500/30">
      {/* BARRE DE NAVIGATION STYLE "RACK" */}
      <Header />

      {/* ZONE DE CONTENU */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,20,1)_0%,_rgba(0,0,0,1)_100%)]">
        {children}
      </main>

      {/* PETITE BARRE D'ÉTAT DISCRÈTE */}
      <MixerFooter />
    </div>
  );
}
