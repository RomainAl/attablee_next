"use client";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useMessUserStore } from "@/store/mess.user.store";
import { setUserName } from "@/store/webrtc.user.store";
import { Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Accueil = ({ start }: { start: () => void }) => {
  const refDiv = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setUserName("Elon");
    start();
    setClicked(true);
    // On désactive le loader après 10s si rien ne s'est passé
    setTimeout(() => {
      setClicked(false);
    }, 10000);
  };

  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (refDiv.current) {
          refDiv.current.style.zIndex = value === 0 ? "20" : "10";
        }
      }
    );
    return () => unsubscribeGain();
  }, []);

  return (
    <div
      ref={refDiv}
      className={cn(
        "absolute uppercase tracking-widest size-full bg-accent z-20 flex justify-center items-center gap-10 flex-col text-center text-xl p-6"
      )}
    >
      <div className="text-4xl text-primary space-y-2">
        <h2 className="text-2xl opacity-90">Bienvenue dans</h2>
        <h1 className="font-bold text-5xl tracking-tighter">@TABLÉE</h1>
      </div>

      <p className="text-sm opacity-80 leading-relaxed text-white/60">
        . Monte ton volume . <br />
        . Monte ta luminosité . <br />. Et allume ton micro :
      </p>

      {/* CONTENEUR DU BOUTON AVEC EFFET DE HALO */}
      <div className="relative">
        {/* Halo pulsant - Disparaît quand on clique */}
        {!clicked && <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping scale-150 opacity-20" />}

        <button
          onClick={handleClick}
          disabled={clicked}
          aria-label="Démarrer l'expérience"
          className={cn(
            "relative aspect-square size-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
            "bg-primary text-accent hover:scale-105 active:scale-90 disabled:opacity-80 disabled:scale-100",
            !clicked && "animate-pulse shadow-[0_0_30px_rgba(var(--primary),0.6)]"
          )}
        >
          {clicked ? <Spinner size="large" className="text-accent" /> : <Mic strokeWidth={2.5} className="size-10" />}
        </button>
      </div>

      {/* Petit indicateur de chargement discret sous le bouton si cliqué */}
      {clicked && <p className="text-[10px] animate-pulse text-primary/60">Initialisation du moteur audio...</p>}
    </div>
  );
};
