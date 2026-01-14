"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RecButtonProps {
  onRecord: () => void;
}

export const RecButton = ({ onRecord }: RecButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    if (isRecording) return;
    setIsRecording(true);
    onRecord();

    // 1. Durée du timeout passée à 10000ms
    setTimeout(() => setIsRecording(false), 10000);
  };

  return (
    <div className="z-100 pointer-events-none">
      <button
        onClick={handleClick}
        className={cn(
          "pointer-events-auto relative size-14 rounded-full flex items-center justify-center transition-all active:scale-95",
          isRecording ? "bg-zinc-900" : "bg-red-600 shadow-xl shadow-red-900/40"
        )}
      >
        {/* Bordure de progression circulaire */}
        {isRecording && (
          <svg className="absolute inset-0 size-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="163"
              // 2. Animation CSS passée à 10s ici dans la classe
              className="animate-[progress_10s_linear_forwards]"
              style={{ strokeDashoffset: 163 }}
            />
          </svg>
        )}

        {/* Icône centrale */}
        <div
          className={cn("transition-all duration-300", isRecording ? "size-4 rounded-sm bg-red-600 animate-pulse" : "size-5 rounded-full bg-white")}
        />
      </button>

      <style jsx>{`
        @keyframes progress {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};
