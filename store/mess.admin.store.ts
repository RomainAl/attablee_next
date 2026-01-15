import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { admin2userDataType, user2adminDataType } from "./shared.store";
import { sendMess } from "./webrtc.admin.store";

export const initAdmin2UserData: admin2userDataType = {
  goto: 1, // FOR USER CONNECTION GOTO
};

export const useMessAdminStore = create<admin2userDataType>()(
  persist(
    () => ({
      ...initAdmin2UserData,
    }),
    { name: "goto" }
  )
);

export const setCurrentPage = (goto: number) => {
  useMessAdminStore.setState({ goto });
  sendMess({ goto });
};

export const initUser2AdminData: user2adminDataType = {
  ouestu: "", // FOR USER CONNECTION GOTO
};

export const useMessUser2AdminStore = create<user2adminDataType>()(
  subscribeWithSelector(() => ({
    ...initUser2AdminData,
  }))
);

export const setOuestu = (id: string) => {
  useMessUser2AdminStore.setState({ ouestu: id });
};
