import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import { useState } from "react";

export const Accueil = ({ tabNb, start }: { tabNb: number; start: () => void }) => {
  const [clicked, setClicked] = useState(false);
  const handleClick = () => {
    start();
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
    }, 5000);
  };
  return (
    <div
      className={cn("absolute size-full bg-accent z-20 flex justify-center items-center gap-4 flex-col text-center text-xl", {
        "z-0": tabNb !== 0,
      })}
    >
      <div className="font-bold">
        <h2>
          Bienvenue dans l&apos;expérience <br />
        </h2>
        <h1 className="text-3xl">@TABLÉE</h1>
      </div>
      <p className="mb-3">
        . Monte ton volume . <br />. Monte ta luminosité . <br />. Et allume ton micro :
      </p>
      <Button size={"lg"} onClick={handleClick} className="aspect-square p-0">
        {/* <Play className=" text-accent fill-accent" /> */}
        {clicked ? <Spinner className="text-accent" /> : <Mic strokeWidth={3} absoluteStrokeWidth className="text-accent" />}
      </Button>
    </div>
  );
};
