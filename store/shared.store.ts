import { create } from "zustand";

export type admin2userDataType = {
  goto?: number;
  toast?: toastStoreType;
  ouestu?: number;
};

export type user2adminDataType = {
  name?: string;
  audioChan?: number;
  ouestu?: string;
};

type toastStoreType = {
  data?: {
    title?: string;
    content: string;
    isAdmin?: boolean;
  };
  position?: string;
  progress?: number | undefined;
  autoClose?: boolean | number;
  render?: string;
  type?: "error" | "info" | "warning" | "success" | "" | "loading" | "update" | "form";
};

export const peerOptionsStore = {
  host: "attablee.art",
  port: 443,
  path: "/socket",
  debug: 2,
  key: "attablee",
  config: {
    iceServers: [{ urls: "stun:stun.services.mozilla.com" }, { urls: "stun:stun.l.google.com:19302" }],
  },
};

export const useToastStore = create<toastStoreType>(() => ({}));

export const setToast = (toast: toastStoreType) => {
  useToastStore.setState(toast, true);
};
