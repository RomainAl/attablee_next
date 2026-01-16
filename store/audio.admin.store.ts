import { createDevice, Device } from "@rnbo/js";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type userChanType = { id: string; ch: number };

type audioStoreType = {
  audioContext: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
  merger: ChannelMergerNode | null;
  reverb: Device | null;
  freeze: Device | null;
  globalClientsGain: number;
  setGlobalClientsGain: (val: number[]) => void;
  mergerGains: GainNode[]; // Tableau des gains individuels
  channelGains: number[]; // Valeurs numériques pour l'UI
  setChannelGain: (ch: number, val: number[]) => void;
  userSChannels: userChanType[];
  autoRouting: boolean;
  toggleAutoRouting: () => void;
  autoRoutingSpeed: number;
  setAutoRoutingSpeed: (val: number[]) => void;
  channelCount: number;
};

export const useAudioAdminStore = create<audioStoreType>()(
  subscribeWithSelector((set, get) => ({
    audioContext: null,
    source: null,
    merger: null,
    reverb: null,
    freeze: null,
    globalClientsGain: 1.0,
    setGlobalClientsGain: (val: number[]) => set({ globalClientsGain: val[0] }),
    mergerGains: [],
    channelGains: [],
    setChannelGain: (ch, val) => {
      const { mergerGains, audioContext } = get();
      const numericVal = val[0]; // On extrait la valeur du Slider

      if (mergerGains[ch] && audioContext) {
        mergerGains[ch].gain.setTargetAtTime(numericVal, audioContext.currentTime, 0.03);

        set((state) => {
          const newGains = [...state.channelGains];
          newGains[ch] = numericVal;
          return { channelGains: newGains };
        });
      }
    },
    userSChannels: [],
    autoRouting: false,
    toggleAutoRouting: () => set((state) => ({ autoRouting: !state.autoRouting })),
    autoRoutingSpeed: 10,
    setAutoRoutingSpeed: (val) => set({ autoRoutingSpeed: val[0] }),
    channelCount: 6,
  }))
);

export const setUserSChannels = (id: string, ch: number): void => {
  const currentChannels = useAudioAdminStore.getState().userSChannels || [];
  const filtered = currentChannels.filter((p) => p.id !== id && p.ch !== ch);
  useAudioAdminStore.setState({
    userSChannels: [...filtered, { id, ch }],
  });
};

export const setAdminAudio = async () => {
  // 1. Création immédiate du contexte et du routing de base
  let channelCount = useAudioAdminStore.getState().channelCount;
  const ctx = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });
  if (ctx.destination.maxChannelCount >= channelCount) {
    ctx.destination.channelCount = channelCount;
  } else {
    channelCount = ctx.destination.channelCount;
  }

  ctx.destination.channelCountMode = "explicit";
  ctx.destination.channelInterpretation = "discrete";
  await ctx.resume();

  const merger = ctx.createChannelMerger(channelCount);
  merger.channelCountMode = "explicit";
  merger.channelInterpretation = "discrete";
  merger.connect(ctx.destination);

  const gains: GainNode[] = [];
  const initialValues: number[] = [];

  for (let i = 0; i < channelCount; i++) {
    const g = ctx.createGain();
    g.gain.value = 1.0;
    g.connect(merger, 0, i);
    gains.push(g);
    initialValues.push(1.0);
  }

  useAudioAdminStore.setState({
    audioContext: ctx,
    merger: merger,
    mergerGains: gains,
    channelGains: initialValues,
    channelCount: channelCount,
  });
};

export const loadRNBOReverb = async () => {
  const state = useAudioAdminStore.getState();
  const ctx = state.audioContext;
  const merger = state.merger;

  if (!ctx || !merger) {
    console.error("Moteur non initialisé");
    return;
  }

  try {
    console.log("Début chargement REVERB seule...");

    // 1. On ne fetch que la reverb
    const response = await fetch(`effects/reverb.export.json`);
    const reverbJson = await response.json();

    // 2. Création et isolation immédiate
    const reverb = await createDevice({ context: ctx, patcher: reverbJson });
    reverb.node.disconnect();

    // 4. On s'assure que le contexte n'est pas suspendu
    if (ctx.state === "suspended") await ctx.resume();

    // 5. Mise à jour du store (on laisse freezes vide pour l'instant)
    useAudioAdminStore.setState({
      reverb,
    });

    console.log("✅ REVERB chargée, Merger reconnecté. Time:", ctx.currentTime.toFixed(3));
  } catch (err) {
    console.error("CRASH Chargement Reverb:", err);
  }
};

export const loadRNBOfreeze = async () => {
  const state = useAudioAdminStore.getState();
  const ctx = state.audioContext;
  const merger = state.merger;

  if (!ctx || !merger) {
    console.error("Moteur non initialisé");
    return;
  }

  try {
    console.log("Début chargement REVERB seule...");

    // 1. On ne fetch que la reverb
    const response = await fetch(`effects/freeze.export.json`);
    const reverbJson = await response.json();

    // 2. Création et isolation immédiate
    const freeze = await createDevice({ context: ctx, patcher: reverbJson });
    freeze.node.disconnect();

    // 4. On s'assure que le contexte n'est pas suspendu
    if (ctx.state === "suspended") await ctx.resume();

    // 5. Mise à jour du store (on laisse freezes vide pour l'instant)
    useAudioAdminStore.setState({
      freeze,
    });

    console.log("✅ REVERB chargée, Merger reconnecté. Time:", ctx.currentTime.toFixed(3));
  } catch (err) {
    console.error("CRASH Chargement Reverb:", err);
  }
};
