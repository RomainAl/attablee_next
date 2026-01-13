import { create } from "zustand";
import { persist } from "zustand/middleware";
import { admin2userDataType } from "./shared.store";
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
