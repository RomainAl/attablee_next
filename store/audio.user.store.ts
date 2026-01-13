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
  isLoading: number;
  activeEffects: string[];

  // Actions
  initAudio: (desiredSampleRate: number) => AudioContext;
  loadAllRNBO: (names: string[]) => Promise<void>;
  toggleEffect: (name: string) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioContext: null,
  devices: {},
  names: ["sampler", "delay", "downsample", "reverb", "disto"],
  isLoading: 0,
  activeEffects: ["sampler"],

  initAudio: (desiredSampleRate: number) => {
    let ctx = get().audioContext;
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: desiredSampleRate,
      });
      ctx.suspend();
      set({ audioContext: ctx });
    }
    return ctx;
  },

  loadAllRNBO: async (names) => {
    const { isLoading, audioContext } = get();

    // Sécurité : si déjà chargé ou en cours, on ne fait rien
    if (isLoading) return;

    set({ isLoading: 0 });
    if (!audioContext) {
      alert("Audio non initialisé ! Recharge la page !");
      return;
    }

    try {
      const loadedDevices: Record<string, Device> = {};

      await Promise.all(
        names.map(async (name, i) => {
          set({ isLoading: (100 * i + 1) / names.length });
          const response = await fetch(`effects/${name}.export.json`);
          const patcher = await response.json();
          const device = await createDevice({ context: audioContext, patcher });
          loadedDevices[name] = device;
        })
      );

      // 3. Configuration initiale
      loadedDevices["delay"].parameters.find((p) => p.name === "time")!.value = 30.0;
      loadedDevices["downsample"].parameters.find((p) => p.name === "down-sample").value = 10.0;
      loadedDevices["delay"].parameters.find((p) => p.name === "input").value = 1.0;
      loadedDevices["delay"].parameters.find((p) => p.name === "time").value = 30.0;
      loadedDevices["reverb"].parameters.find((p) => p.name === "mix").value = 100.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "drive").value = 20.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "mix").value = 100.0;
      loadedDevices["disto"].parameters.find((p) => p.name === "treble").value = 50.0;

      set({ devices: loadedDevices, isLoading: 1 });
    } catch (err) {
      console.error("RNBO Loading Error:", err);
      set({ isLoading: 0 });
      setToast({
        type: "error",
        data: { title: "PROBLÈME AUDIO", content: "Un problème est survenu lors du chargement des effets. Actualise ta page et retente !" },
      });
    }
  },

  toggleEffect: (name) =>
    set((state) => ({
      activeEffects: state.activeEffects.includes(name) ? state.activeEffects.filter((n) => n !== name) : [...state.activeEffects, name],
    })),
}));
