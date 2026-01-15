"use client";

import { useRef } from "react";
import { useEventListener } from "usehooks-ts";
import Header from "./header";
import MixerFooter from "./mixerFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  // console.log("RENDER LAYOUT"); // Nettoyage console pour la fluidité
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
    <div
      ref={pageRef}
      // 1. Ajout de antialiased et suppression de selection:bg pour éviter les calculs de repaint
      className="h-dvh w-dvw flex flex-col bg-black text-white antialiased select-none"
    >
      {/* BARRE DE NAVIGATION STYLE "RACK" */}
      <Header />

      {/* ZONE DE CONTENU */}
      {/* 2. Remplacement du radial-gradient complexe par une couleur unie (bg-zinc-950)
             Le rendu d'une couleur pleine est 10x plus rapide qu'un dégradé sur toute la page. */}
      <main className="flex-1 relative overflow-hidden bg-[#0a0a0a]">{children}</main>

      {/* PETITE BARRE D'ÉTAT DISCRÈTE */}
      <MixerFooter />
    </div>
  );
}
