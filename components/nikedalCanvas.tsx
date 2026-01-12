"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useWindowSize } from "usehooks-ts";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export const NikedalCanvas = ({ tabNb }: { tabNb: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const isClient = useIsClient();

  const { width = 0, height = 0 } = useWindowSize();

  const drawNoise = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // 1. Fond blanc
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // On définit les styles une fois par frame pour plus de clarté
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      const r = Math.random();
      ctx.lineWidth = 500 * r * r * r;
      const density = 20 * (1 - r * r * r);

      for (let i = 0; i < density; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2000 + 20;

        ctx.strokeRect(x - 200, y - 200, size * 4 * Math.random(), size * 2 * Math.random());
      }
      requestRef.current = requestAnimationFrame(render);
    };
    render();
  };

  useEffect(() => {
    if (isClient && canvasRef.current && width > 0 && tabNb === 42) {
      drawNoise(canvasRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isClient, width, height, tabNb]);

  if (!isClient || tabNb !== 42) return null;

  return <canvas ref={canvasRef} width={width * 2} height={height * 2} className="absolute inset-0 size-full z-20" />;
};
