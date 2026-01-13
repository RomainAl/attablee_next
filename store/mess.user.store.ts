import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { admin2userDataType } from "./shared.store";

export const initAdmin2UserData: admin2userDataType = {
  goto: 0,
  // toast?: toastStoreType; -> directement dans setToast (webrtc user)
};

export const useMessUserStore = create(
  subscribeWithSelector<admin2userDataType>(() => ({
    ...initAdmin2UserData,
  }))
);

export const setInitMessUserStore = () => {
  useMessUserStore.setState(initAdmin2UserData);
};
