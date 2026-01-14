import { create } from "zustand";

type audioStoreType = {
  audioContext: AudioContext | null;
  audioAnalyser: AnalyserNode | null;
  merger: ChannelMergerNode | null;
};

export const useAudioAdminStore = create<audioStoreType>(() => ({
  audioContext: null,
  audioAnalyser: null,
  merger: null,
}));

export const setAdminAudio = async () => {
  const ctx = new AudioContext();
  ctx.resume();
  const merger = ctx.createChannelMerger(ctx.destination.maxChannelCount);
  merger.channelInterpretation = "discrete";
  merger.connect(ctx.destination);
  useAudioAdminStore.setState({
    audioContext: ctx,
    merger: merger,
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
