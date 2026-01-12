"use client";
import { SoundwaveCanvas } from "@/components/soundwaveCanvas";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audio.user.store";
import { useCallback, useEffect, useRef, useState } from "react";

export const Sampler = ({ tabNb }: { tabNb: number }) => {
  console.log("SAMPLER RENDER");
  const audioContext = useAudioStore((s) => s.audioContext);
  const devices = useAudioStore((s) => s.devices);
  const names = useAudioStore((s) => s.names);
  const isLoaded = useAudioStore((s) => s.isLoaded);
  const isLoading = useAudioStore((s) => s.isLoading);
  const activeEffects = useAudioStore((s) => s.activeEffects);
  const initAudio = useAudioStore((s) => s.initAudio);
  const loadAllRNBO = useAudioStore((s) => s.loadAllRNBO);
  const toggleEffect = useAudioStore((s) => s.toggleEffect);
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
      }
    };
    if (tabNb === 1) initAudioStack();

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
  }, [initAudio, loadAllRNBO, audioContext, tabNb, names]); // Dépendances stables du store

  // Reconstruction dès que isLoaded est vrai OU que la liste activeEffects change
  useEffect(() => {
    if (isLoaded) rebuildGraph();
  }, [isLoaded, rebuildGraph]);

  // Helper de paramètres utilisant 'devices' du store
  const setParam = (deviceName: string, paramName: string, value: number) => {
    const device = devices[deviceName];
    if (device) {
      const p = device.parameters.find((p) => p.name === paramName);
      if (p) p.value = value;
    }
  };

  if (tabNb !== 1) return null;
  if (isLoading || !isLoaded)
    return (
      <div className={cn("absolute size-full z-10 bg-accent flex justify-center items-center", { "z-20": tabNb === 1 })}>
        <Spinner size={"xxlarge"} />
      </div>
    );

  return (
    <div className={cn("absolute size-full z-10 bg-accent", { "z-20": tabNb === 1 })}>
      {analyser && <SoundwaveCanvas className="absolute inset-0 size-full z-0" analyser={analyser} />}

      <div className="z-20 w-full flex flex-col gap-8 bg-black/40 p-8 rounded-3xl backdrop-blur-xs border border-white/10">
        <Button
          className="h-20 text-xl font-bold bg-red-600 hover:bg-red-700 transition-all active:scale-95"
          onClick={() => {
            const sampler = devices["sampler"];
            if (!sampler) return;

            console.log("REC START");
            sampler.parameters.find((param) => param.name == "clear_buf").value =
              1.0 - sampler.parameters.find((param) => param.name == "clear_buf").value;
            sampler.parameters.find((param) => param.name == "rec").value = 1.0;
            sampler.parameters.find((p) => p.name === "out_gain").value = 0.0;
            sampler.parameters.find((p) => p.name === "rand_play").value = 0.0;
            sampler.parameters.find((p) => p.name === "loop_start_point").value = 1.0;

            setTimeout(() => {
              console.log("STOP REC");
              sampler.parameters.find((param) => param.name == "rec").value = 0.0;
              sampler.parameters.find((p) => p.name === "out_gain").value = 1.0;
              sampler.parameters.find((p) => p.name === "rand_play").value = 1.0;
              sampler.parameters.find((p) => p.name === "loop_start_point").value = 0.0;
              sampler.parameters.find((p) => p.name === "size").value = 5.0;
            }, 5000);
          }}
        >
          RECORD 5s
        </Button>

        {/* TOGGLES D'EFFETS */}
        <div className="flex flex-wrap gap-2">
          {names.map((name) => (
            <Button
              key={name}
              variant={activeEffects.includes(name) ? "default" : "secondary"}
              onClick={() => toggleEffect(name)}
              className={activeEffects.includes(name) ? "bg-green-500 hover:bg-green-600 text-white" : "opacity-50"}
            >
              {name.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* SLIDERS */}
        <div className="space-y-6">
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest text-center">Effects Control</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white">Delay Time</label>
              <Slider max={100} min={0} step={0.1} onValueChange={([v]) => setParam("delay", "time", v)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white">Disto Drive</label>
              <Slider max={100} min={0} step={0.1} onValueChange={([v]) => setParam("disto", "drive", v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
