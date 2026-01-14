"use client";
import { EffectList } from "@/components/effectList";
import { MasterGain } from "@/components/masterGain";
import { RecButton } from "@/components/recButton";
import { SoundwaveCanvas } from "@/components/soundwaveCanvas";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useAudioStore } from "@/store/audio.user.store";
import { useMessUserStore } from "@/store/mess.user.store";
import { setToast } from "@/store/shared.store";
import { Cog, Smartphone, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Sampler = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // État pour la popup
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

  // GainNode persistant pour le volume général
  const masterGainRef = useRef<GainNode | null>(null);

  // --- RECONSTRUCTION DU GRAPHE ---
  const rebuildGraph = useCallback(() => {
    if (!sourceRef.current || !analyser || !audioContext || !devices || !masterGainRef.current) return;

    sourceRef.current.disconnect();
    Object.values(devices).forEach((d) => d.node.disconnect());
    analyser.disconnect();
    masterGainRef.current.disconnect();

    let lastNode: AudioNode = sourceRef.current;

    names.forEach((name) => {
      const device = devices[name];
      if (device && activeEffects.includes(name)) {
        lastNode.connect(device.node);
        lastNode = device.node;
      }
    });

    // Insertion du Master Gain avant la destination
    lastNode.connect(masterGainRef.current);
    masterGainRef.current.connect(audioContext.destination);
    masterGainRef.current.connect(analyser);

    console.log("Graphe reconstruit avec Master Volume");
  }, [activeEffects, analyser, audioContext, devices, names]);

  useEffect(() => {
    let isMounted = true;

    const initAudioStack = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: { ideal: 48000 }, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const ctx = initAudio(stream.getAudioTracks()[0].getSettings().sampleRate || 48000);
        if (!ctx) return;

        // Initialisation du Master Gain
        const masterGain = ctx.createGain();
        masterGainRef.current = masterGain;

        micStreamRef.current = stream;
        sourceRef.current = ctx.createMediaStreamSource(stream);

        await loadAllRNBO(names);

        if (!isMounted) return;

        const analyserNode = ctx.createAnalyser();
        setAnalyser(analyserNode);
        ctx.resume();
      } catch (err) {
        console.error("Erreur Initialisation Instru:", err);
        setToast({ type: "error", data: { title: "MICRO/CAMERA", content: "Accès refusé..." }, autoClose: 20000 });
      }
    };
    if (goto === 1) initAudioStack();

    return () => {
      isMounted = false;
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      sourceRef.current?.disconnect();
      audioContext?.suspend();
    };
  }, [initAudio, loadAllRNBO, audioContext, goto, names]);

  useEffect(() => {
    if (isLoading === 1) rebuildGraph();
  }, [isLoading, rebuildGraph]);

  if (goto !== 1) return null;
  if (isLoading > 0 && isLoading < 1)
    return (
      <div className={cn("absolute size-full z-50 bg-accent flex flex-col justify-center items-center")}>
        <Spinner size={"xxlarge"} className="relative flex justify-center items-center">
          <p className="absolute text-2xl font-mono">{Math.floor(isLoading * 100)}%</p>
        </Spinner>
        <p className="text-sm text-primary/60">Initialisation du moteur audio...</p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none z-20">
      {showIntro && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-6 animate-in fade-in duration-500">
          {/* Background cliquable pour fermer */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowIntro(false)} />

          {/* Carte de la popup */}
          <div className="relative bg-accent/90 border border-white/10 p-4 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-white/5 text-white/50"
            >
              <X size={18} />
            </button>

            <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Cog className="text-primary animate-[spin_4s_linear_infinite]" size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase ">Console de Sampler</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Enregistre 10s de son, puis triture les effets pour le transformer en instrument unique.
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 bg-primary text-accent font-bold rounded-2xl active:scale-95 transition-transform"
            >
              C&apos;EST PARTI
            </button>
          </div>
        </div>
      )}
      {/* 1. Orientation Lock */}
      <div className="absolute inset-0 bg-black/90 z-100 flex justify-center items-center pointer-events-none portrait:hidden">
        <div className="flex flex-col items-center gap-4">
          <p className="text-white font-bold tracking-widest text-xs">PORTRAIT MODE REQUIRED</p>
          <Smartphone className="animate-pulse text-primary" size={48} />
        </div>
      </div>

      {/* 2. Soundwave */}
      {analyser && <SoundwaveCanvas className="absolute inset-0 h-screen w-full z-0" analyser={analyser} />}

      {/* 3. Tiroir des réglages */}
      <div
        className={cn(
          "fixed left-4 right-4 z-40 transition-all duration-500 ease-in-out",
          showSettings ? "bottom-20 opacity-100" : "bottom-0 opacity-0 pointer-events-none translate-y-10"
        )}
      >
        <div className="bg-black/70 backdrop-blur-xs p-6 rounded-[2rem] border border-accent shadow-2xl overflow-y-auto max-h-[calc(100svh-90px)]">
          <EffectList />
        </div>
      </div>

      {/* 4. Barre de navigation basse */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-linear-to-t from-black to-transparent z-50 flex items-center justify-evenly px-4">
        {/* Paramètres (Cog) */}
        <button
          onClick={() => {
            setShowSettings(!showSettings);
          }}
          className={cn(
            "size-14 rounded-full flex items-center justify-center transition-all active:scale-90 border",
            showSettings ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/20 backdrop-blur-xs"
          )}
        >
          <Cog className={cn("size-6 transition-transform duration-500", showSettings && "rotate-180")} />
        </button>

        <RecButton
          onRecord={() => {
            const sampler = devices["sampler"];
            if (!sampler || !masterGainRef.current || !audioContext) return;

            // 1. COUPER LE SON (Master Mute)
            // On utilise une rampe très courte (0.01s) pour éviter un "clic" sec
            masterGainRef.current.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);

            console.log("REC START - Muted");

            // Ta logique RNBO existante
            setTimeout(() => {
              sampler.parameters.find((p) => p.name == "clear_buf").value = 1.0 - sampler.parameters.find((p) => p.name == "clear_buf").value;
              sampler.parameters.find((p) => p.name == "rec").value = 1.0;
              sampler.parameters.find((p) => p.name === "out_gain").value = 0.0;
              sampler.parameters.find((p) => p.name === "rand_play").value = 0.0;
              sampler.parameters.find((p) => p.name === "loop_start_point").value = 1.0;
            }, 500);

            setTimeout(() => {
              console.log("STOP REC - Unmuted");

              // Ta logique RNBO existante
              sampler.parameters.find((p) => p.name == "rec").value = 0.0;
              sampler.parameters.find((p) => p.name === "out_gain").value = 1.0;
              sampler.parameters.find((p) => p.name === "rand_play").value = 1.0;
              sampler.parameters.find((p) => p.name === "loop_start_point").value = 0;
              sampler.parameters.find((p) => p.name === "size").value = 10.0;

              // 2. REMETTRE LE SON (Master Unmute)
              // On revient à 1 (ou la valeur que tu souhaites) avec une petite rampe de 0.1s
              masterGainRef.current?.gain.setTargetAtTime(1, audioContext.currentTime, 0.1);
            }, 10500);
          }}
        />

        <MasterGain masterGainRef={masterGainRef} audioContext={audioContext} />
      </div>
    </div>
  );
};
