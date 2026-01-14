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

    try {
      const loadedDevices: Record<string, Device> = {};

      // Helper pour assigner un paramètre sans faire planter l'app
      const setSafeParam = (deviceName: string, paramName: string, value: number) => {
        const dev = loadedDevices[deviceName];
        const p = dev?.parameters.find((p) => p.name === paramName);
        if (p) p.value = value;
      };

      // Chargement séquentiel pour mettre à jour la barre de progression
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        set({ isLoading: Math.max(i / names.length, 0.01) }); // Update progress (0 to 0.99)

        const response = await fetch(`effects/${name}.export.json`);
        if (!response.ok) throw new Error(`Failed to load ${name}`);

        const patcher = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const device = await createDevice({ context: audioContext, patcher });
        loadedDevices[name] = device;
      }

      // 3. Configuration initiale sécurisée
      setSafeParam("delay", "time", 30.0);
      setSafeParam("delay", "input", 1.0);
      setSafeParam("downsample", "down-sample", 10.0);
      setSafeParam("reverb", "mix", 100.0);
      setSafeParam("disto", "drive", 20.0);
      setSafeParam("disto", "mix", 100.0);
      setSafeParam("disto", "treble", 50.0);

      set({ devices: loadedDevices, isLoading: 1 });
      console.log("🚀 RNBO Effects Loaded & Configured");
    } catch (err) {
      console.error("RNBO Loading Error:", err);
      set({ isLoading: 0 });
      setToast({
        type: "error",
        data: {
          title: "PROBLÈME CHARGEMENT",
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
