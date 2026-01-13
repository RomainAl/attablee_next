"use client";
import { useMessUserStore } from "@/store/mess.user.store";
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

export const NoiseCanvas = () => {
  const goto = useMessUserStore((s) => s.goto);
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

      const density = 1000;
      // On définit les styles une fois par frame pour plus de clarté
      ctx.strokeStyle = "black";
      ctx.fillStyle = "black";
      ctx.lineWidth = 3;

      for (let i = 0; i < density; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 50 + 20;

        // 2. Logique de décision (50/50)
        if (Math.random() > 0.7) {
          // Carré plein
          ctx.fillRect(x - 25, y - 25, size * Math.random(), size * Math.random());
        } else {
          // Carré contour uniquement
          ctx.strokeRect(x - 25, y - 25, size * 4 * Math.random(), size * 2 * Math.random());
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };
    render();
  };

  useEffect(() => {
    if (isClient && canvasRef.current && width > 0 && goto === 3) {
      drawNoise(canvasRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isClient, width, height, goto]);

  if (!isClient || goto !== 3) return null;

  return <canvas ref={canvasRef} width={width * 2} height={height * 2} className="absolute inset-0 size-full z-20" />;
};
