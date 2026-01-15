import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type userChanType = { id: string; ch: number };

type audioStoreType = {
  audioContext: AudioContext | null;
  audioAnalyser: AnalyserNode | null;
  merger: ChannelMergerNode | null;
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
    audioAnalyser: null,
    merger: null,
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
  const ctx = new AudioContext({ latencyHint: "interactive", sampleRate: 48000 });
  if (ctx.destination.maxChannelCount >= 10) {
    ctx.destination.channelCount = 10;
  }
  ctx.resume();
  const merger = ctx.createChannelMerger(Math.min(ctx.destination.channelCount, 10));
  console.log("NOMBRE DE SORTIES :", merger.numberOfInputs);
  // merger.channelCountMode = "explicit";
  merger.channelInterpretation = "discrete";
  merger.connect(ctx.destination);
  const gains: GainNode[] = [];
  const initialGainsValues: number[] = [];

  for (let i = 0; i < merger.numberOfInputs; i++) {
    const g = ctx.createGain();
    g.gain.value = 1.0;
    // On connecte chaque gain à son entrée spécifique du merger
    g.connect(merger, 0, i);
    gains.push(g);
    initialGainsValues.push(1.0);
  }
  useAudioAdminStore.setState({
    audioContext: ctx,
    merger: merger,
    mergerGains: gains,
    channelGains: initialGainsValues,
  });
};

export const setAudioAnalyser = () => {
  const ctx = useAudioAdminStore.getState().audioContext;
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        sampleRate: 44100,
        sampleSize: 16,
        noiseSuppression: false,
        echoCancellation: false,
        channelCount: 1,
        autoGainControl: true,
      },
      video: false,
    })
    .then((stream) => {
      const source = ctx?.createMediaStreamSource(stream);
      const audioAnalyser = ctx?.createAnalyser();
      if (audioAnalyser) {
        audioAnalyser.fftSize = 32;
        source?.connect(audioAnalyser);
      }
      useAudioAdminStore.setState({ audioAnalyser });
    });
};
