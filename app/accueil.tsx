"use client";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
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
    setTimeout(() => {
      setClicked(false);
    }, 10000);
  };

  useEffect(() => {
    const unsubscribeGain = useMessUserStore.subscribe(
      (state) => state.goto,
      (value) => {
        if (refDiv.current)
          if (value === 0) {
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
    <div ref={refDiv} className={cn("absolute size-full bg-accent z-20 flex justify-center items-center gap-10 flex-col text-center text-xl")}>
      <div className="text-3xl">
        <h2>
          Bienvenue <br />
          dans l&apos;expérience <br />
        </h2>
        <h1 className="font-bold text-3xl">@TABLÉE</h1>
      </div>
      <p className="mb-3">
        . Monte ton volume . <br />. Monte ta luminosité . <br />. Et allume ton micro :
      </p>
      <Button size={"lg"} onClick={handleClick} className="aspect-square size-15 p-0">
        {/* <Play className=" text-accent fill-accent" /> */}
        {clicked ? <Spinner className="text-accent" /> : <Mic strokeWidth={2} className="text-accent size-full" />}
      </Button>
    </div>
  );
};
