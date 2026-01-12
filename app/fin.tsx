import { cn } from "@/lib/utils";

export const Fin = ({ tabNb }: { tabNb: number }) => {
  return (
    <div
      className={cn("absolute size-full bg-accent z-0 flex justify-center items-center gap-4 flex-col text-center text-lg", {
        "z-20": tabNb === -1,
      })}
    >
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
        Développement numérique / Vidéos live <br />
        <br />
        <strong>Nicolas CANOT</strong>
        <br />
        Électronique / FX / Spatialisation sonore
      </p>
      <p>
        Expérience imaginée avec
        <br />
        <strong>Yann JOUSSEIN</strong>
      </p>
    </div>
  );
};
