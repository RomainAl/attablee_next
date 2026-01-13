"use client";
import { EffectList } from "@/components/effectList";
import { RecButton } from "@/components/recButton";
import { SoundwaveCanvas } from "@/components/soundwaveCanvas";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audio.user.store";
import { useMessUserStore } from "@/store/mess.user.store";
import { setToast } from "@/store/shared.store";
import { Cog, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Sampler = () => {
  console.log("SAMPLER RENDER");
  const [showSettings, setShowSettings] = useState(false);
  const goto = useMessUserStore((s) => s.goto);
  const audioContext = useAudioStore((s) => s.audioContext);
  const devices = useAudioStore((s) => s.devices);
  const names = useAudioStore((s) => s.names);
  const isLoading = useAudioStore((s) => s.isLoading);
  const activeEffects = useAudioStore((s) => s.activeEffects);
  const initAudio = useAudioStore((s) => s.initAudio);
  const loadAllRNBO = useAudioStore((s) => s.loadAllRNBO);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // --- FONCTION DE RECONSTRUCTION DU GRAPHE ---
  const rebuildGraph = useCallback(() => {
    // On utilise 'devices' venant du store Zustand
    if (!sourceRef.current || !analyser || !audioContext || !devices) return;

    // 1. Déconnexion totale
    sourceRef.current.disconnect();
    Object.values(devices).forEach((d) => d.node.disconnect());
    analyser.disconnect();

    // 3. Chaînage dynamique
    let lastNode: AudioNode = sourceRef.current;

    names.forEach((name) => {
      const device = devices[name];
      // On vérifie si l'appareil existe dans le store ET est actif
      if (device && activeEffects.includes(name)) {
        lastNode.connect(device.node);
        lastNode = device.node;
      }
    });

    // 4. Sortie finale
    lastNode.connect(audioContext.destination);
    lastNode.connect(analyser);

    console.log("Graphe reconstruit :", activeEffects.length ? activeEffects.join(" -> ") : "Direct");
  }, [activeEffects, analyser, audioContext, devices, names]);

  useEffect(() => {
    let isMounted = true;

    const initAudioStack = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: 48000 },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const ctx = initAudio(stream.getAudioTracks()[0].getSettings().sampleRate || 48000);
        if (!ctx) return;

        micStreamRef.current = stream;
        sourceRef.current = ctx.createMediaStreamSource(stream);

        // Déclenche le chargement dans Zustand (le store gère si c'est déjà chargé)
        await loadAllRNBO(names);

        if (!isMounted) return;

        const analyserNode = ctx.createAnalyser();
        setAnalyser(analyserNode);
        ctx.resume();
      } catch (err) {
        console.error("Erreur Initialisation Instru:", err);
        setToast({
          type: "error",
          data: {
            title: "MICRO/CAMERA",
            content: "Accès caméra non autorisé... allez dans les paramètres de votre navigateur : Paramètres > Paramètres du site > Caméra",
          },
          autoClose: 20000,
        });
      }
    };
    if (goto === 1) initAudioStack();

    return () => {
      isMounted = false;
      // On coupe le micro mais on laisse les devices dans Zustand
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      sourceRef.current?.disconnect();
      if (audioContext) {
        audioContext?.suspend();
      }
    };
  }, [initAudio, loadAllRNBO, audioContext, goto, names]); // Dépendances stables du store

  // Reconstruction dès que isLoaded est vrai OU que la liste activeEffects change
  useEffect(() => {
    if (isLoading === 1) rebuildGraph();
  }, [isLoading, rebuildGraph]);

  if (goto !== 1) return null;
  if (isLoading > 0 && isLoading < 1)
    return (
      <div className={cn("absolute size-full z-10 bg-accent flex justify-center items-center", { "z-20": goto === 1 })}>
        <div className="relative size-fit">
          <Spinner size={"xxlarge"} className="relative flex justify-center items-center">
            <p className="absolute text-2xl">{isLoading}%</p>
          </Spinner>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none z-20">
      {/* 1. Orientation Lock Overlay */}
      <div className="absolute inset-0 bg-black/90 z-100 flex justify-center items-center pointer-events-none portrait:hidden">
        <div className="flex flex-col items-center gap-4">
          <p className="text-white font-bold">MODE PORTRAIT REQUIS</p>
          <Smartphone className="animate-pulse text-primary" size={48} />
        </div>
      </div>

      {/* 2. Visualisation Audio (Background) */}
      {analyser && <SoundwaveCanvas className="absolute inset-0 h-screen w-full z-0" analyser={analyser} />}

      {/* 3. Tiroir des réglages (EffectList) */}
      <div
        className={cn(
          "fixed left-4 right-4 z-40 transition-all duration-500 ease-in-out",
          // Sur iPhone SE, on veut que le panneau parte de plus haut
          showSettings ? "bottom-20 backdrop-blur-xs " : "bottom-0 opacity-0 pointer-events-none translate-y-10"
        )}
      >
        <div
          className={cn(
            "bg-black/70 backdrop-blur-xs p-6 rounded-[2rem] border border-accent shadow-2xl overflow-y-auto",
            // Calcul dynamique : Hauteur de l'écran - (Barre du bas + marge du haut)
            "max-h-[calc(100svh-90px)]"
          )}
        >
          <EffectList />
        </div>
      </div>

      {/* 4. Barre de navigation basse */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-linear-to-t from-black/80 to-transparent z-50 flex items-center justify-evenly">
        {/* Toggle Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "size-14 rounded-full flex items-center justify-center transition-all active:scale-90 border",
            showSettings ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/20 backdrop-blur-md"
          )}
        >
          <Cog className={cn("size-6 transition-transform duration-500", showSettings && "rotate-180")} />
        </button>

        {/* Record Button */}
        <div className="size-14">
          <RecButton
            onRecord={() => {
              const sampler = devices["sampler"];
              if (!sampler) return;

              sampler.parameters.find((p) => p.name == "clear_buf").value = 1.0 - sampler.parameters.find((p) => p.name == "clear_buf").value;
              sampler.parameters.find((p) => p.name == "rec").value = 1.0;
              sampler.parameters.find((p) => p.name === "out_gain").value = 0.0;
              sampler.parameters.find((p) => p.name === "rand_play").value = 0.0;
              sampler.parameters.find((p) => p.name === "loop_start_point").value = 1.0;

              setTimeout(() => {
                sampler.parameters.find((p) => p.name == "rec").value = 0.0;
                sampler.parameters.find((p) => p.name === "out_gain").value = 1.0;
                sampler.parameters.find((p) => p.name === "rand_play").value = 1.0;
                sampler.parameters.find((p) => p.name === "loop_start_point").value = 0.0;
                sampler.parameters.find((p) => p.name === "size").value = 10.0;
              }, 10000);
            }}
          />
        </div>
      </div>
    </div>
  );
};
