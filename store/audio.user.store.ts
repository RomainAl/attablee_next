import { createDevice, Device } from "@rnbo/js";
import { create } from "zustand";
import { setToast } from "./shared.store";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioState {
  audioContext: AudioContext | null;
  devices: Record<string, Device>;
  names: string[];
  isLoading: number; // 0 à 1 (0% à 100%)
  activeEffects: string[];
  initAudio: (desiredSampleRate: number) => AudioContext;
  loadAllRNBO: (names: string[]) => Promise<void>;
  toggleEffect: (name: string) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioContext: null,
  devices: {},
  names: ["sampler", "delay", "downsample", "reverb", "disto"],
  isLoading: 0,
  activeEffects: ["sampler"], // Le sampler est actif par défaut

  initAudio: (desiredSampleRate: number) => {
    let ctx = get().audioContext;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: desiredSampleRate,
      });
      // Important : suspendre par défaut pour attendre le geste utilisateur
      ctx.suspend();
      set({ audioContext: ctx });
    }
    return ctx;
  },

  loadAllRNBO: async (names) => {
    const { isLoading, audioContext } = get();
    if (isLoading > 0) return;

    if (!audioContext) {
      setToast({
        type: "error",
        data: { title: "AUDIO ERROR", content: "L'AudioContext n'est pas initialisé." },
      });
      return;
    }

    set({ isLoading: 0.1 });

    try {
      const loadedDevices: Record<string, Device> = {};

      await Promise.all(
        names.map(async (name, i) => {
          set({ isLoading: (100 * i + 1) / names.length });
          const response = await fetch(`effects/${name}.export.json`);
          const patcher = await response.json();
          const device = await createDevice({ context: audioContext, patcher });
          loadedDevices[name] = device;

          const currentCount = Object.keys(loadedDevices).length;
          set({ isLoading: currentCount / names.length });
        })
      );

      loadedDevices["delay"].parameters.find((p) => p.name === "time")!.value = 30.0;
      loadedDevices["downsample"].parameters.find((p) => p.name === "down-sample").value = 10.0;
      loadedDevices["delay"].parameters.find((p) => p.name === "input").value = 1.0;
      loadedDevices["delay"].parameters.find((p) => p.name === "time").value = 30.0;
      loadedDevices["reverb"].parameters.find((p) => p.name === "mix").value = 100.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "drive").value = 20.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "mix").value = 100.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "treble").value = 50.0;

      set({ devices: loadedDevices, isLoading: 1 });
      console.log("🚀 RNBO Effects Loaded & Configured");
    } catch (err) {
      console.error("RNBO Loading Error:", err);
      set({ isLoading: 0 });
      setToast({
        type: "error",
        data: {
          title: "PROBLÈME AUDIO",
          content: "Erreur lors de la récupération des modules audio. Vérifie ta connexion.",
        },
      });
    }
  },

  toggleEffect: (name) => {
    // On empêche de désactiver le sampler car c'est notre source principale
    if (name === "sampler") return;

    set((state) => ({
      activeEffects: state.activeEffects.includes(name) ? state.activeEffects.filter((n) => n !== name) : [...state.activeEffects, name],
    }));
  },
}));
