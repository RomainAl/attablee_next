"use client";
import { cn } from "@/lib/utils";
import { useMessUserStore } from "@/store/mess.user.store";
import { useEffect, useRef } from "react";

export const Fin = () => {
  const refDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (refDiv.current)
          if (value === 6) {
            refDiv.current.style.zIndex = "20";
          } else {
            refDiv.current.style.zIndex = "10";
          }
      }
    );

    return () => {
      unsubscribeGain();
    };
  }, []);
  return (
    <div ref={refDiv} className={cn("absolute size-full bg-accent z-0 flex justify-center items-center gap-4 flex-col text-center text-lg")}>
      <h1 className="text-4xl py-5">
        <strong>FIN</strong>
      </h1>
      <p>
        <strong>Olivia SCEMAMA</strong>
        <br />
        Contrebasse <br />
        <br />
        <strong>Romain AL.</strong>
        <br />
        Développement numérique / Vidéos <br />
        <br />
        <strong>Nicolas CANOT</strong>
        <br />
        Électronique / FX
      </p>
      <p>
        Expérience imaginée avec
        <br />
        <strong>Yann JOUSSEIN</strong>
      </p>
    </div>
  );
};
