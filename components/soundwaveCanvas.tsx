import { ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";

// Ajout de isRecording dans les props
type SoundwaveCanvasProps = ComponentPropsWithoutRef<"canvas"> & {
  analyser: AnalyserNode | null;
  isRecording?: boolean;
};

export const SoundwaveCanvas = ({ analyser, isRecording = false, ...props }: SoundwaveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  // On stocke la couleur dans une ref pour que la fonction draw y ait accès sans redémarrer la boucle
  const colorRef = useRef("white");
  const { width = 0, height = 0 } = useWindowSize();

  // On met à jour la couleur dès que la prop change
  useEffect(() => {
    colorRef.current = isRecording ? "#ef4444" : "white"; // #ef4444 est un beau rouge (Tailwind red-500)
  }, [isRecording]);

  const soundVisualizer = (canvas: HTMLCanvasElement, analyser: AnalyserNode) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isVertical = canvas.height / canvas.width > 1;
    const wOrh = isVertical ? "width" : "height";
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 1.0;
    const stroke = false;
    const rand = 0;
    const gain = 3.0;
    const rectSize = 10;
    let rectSize_ = rectSize;

    const times = new Uint8Array(analyser.frequencyBinCount);
    const barWidth = canvas[isVertical ? "height" : "width"] / analyser.frequencyBinCount;

    const draw = () => {
      // Utilisation de la couleur stockée dans la ref
      const currentColor = colorRef.current;

      if (Math.random() * rand < 0.1) ctx.clearRect(0, 0, canvas.width, canvas.height);

      let meanVal = 0;
      let value;
      analyser.getByteTimeDomainData(times);

      if (stroke) {
        for (let i = 0; i < analyser.frequencyBinCount; i++) {
          value = times[i] / 256 - 0.5;
          const z = Math.min(Math.max(value * canvas[wOrh] * gain + canvas[wOrh] * 0.5, 0), canvas[wOrh]) - rectSize / 2;
          ctx.strokeStyle = currentColor; // Applique le rouge ici
          if (isVertical) {
            ctx.strokeRect(z, i * barWidth, rectSize_ * (1 - value), rectSize_ * (1 - value));
          } else {
            ctx.strokeRect(i * barWidth, z, rectSize_ * (1 - value), rectSize_ * (1 - value));
          }
          ctx.lineWidth = value * value * value * value * 10000;
        }
      } else {
        for (let i = 0; i < analyser.frequencyBinCount; i++) {
          value = 2 * (times[i] / 256 - 0.5);
          meanVal += Math.abs(value);
          const z = Math.min(Math.max(value * canvas[wOrh] * gain + canvas[wOrh] * 0.5, 0), canvas[wOrh]) - rectSize / 2;
          ctx.fillStyle = currentColor; // Applique le rouge ici
          if (isVertical) {
            ctx.fillRect(z, i * barWidth, rectSize_, rectSize_);
          } else {
            ctx.fillRect(i * barWidth, z, rectSize_, rectSize_);
          }
        }
      }

      meanVal /= analyser.frequencyBinCount;
      if (meanVal > 0.1) {
        rectSize_ = rectSize * 5;
      } else if (meanVal > 0.4) {
        rectSize_ = rectSize * 10;
      } else {
        rectSize_ = rectSize;
      }
      requestRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  useEffect(() => {
    if (!analyser) return;
    if (canvasRef.current) soundVisualizer(canvasRef.current, analyser);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [analyser, width]);

  return <canvas ref={canvasRef} width={width * 2} height={height * 2} {...props}></canvas>;
};
