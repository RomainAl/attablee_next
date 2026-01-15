import type { DataConnection, MediaConnection } from "peerjs";
import Peer from "peerjs";
import { create } from "zustand";
import { setUserSChannels, useAudioAdminStore } from "./audio.admin.store";
import { setOuestu, useMessAdminStore } from "./mess.admin.store";
import { admin2userDataType, peerOptionsStore, setToast, user2adminDataType } from "./shared.store";

type userType = {
  id: string;
  name: string;
  peerCo: boolean;
  peerData: DataConnection | null;
  peerMedia: MediaConnection | null;
  stream: MediaStream | null;
};

export type webrtcBiterateType = {
  id: string;
  bitrate: number;
  bit: number;
  time: number;
};

type webrtcAdminStoreType = {
  peer: Peer | null;
  userS: userType[];
  bitrates: webrtcBiterateType[];
};

export const useWebrtcAdminStore = create<webrtcAdminStoreType>(() => ({
  peer: null,
  userS: [],
  bitrates: [],
}));

export const reconnUsers = () => {
  const peer = useWebrtcAdminStore.getState().peer;
  if (!peer || !peer.open) {
    createPeer();
  } else {
    fetch("http://localhost:9000/socket/peerjs/peers")
      .then((r) => r.json())
      .then((users) =>
        users.forEach((u: string) => {
          // console.log(u);
          if (u !== "admin") peer?.connect(u);
        })
      );
  }
};

export const createPeer = () => {
  // PEER :
  // if (!util.supports.data) throw new Error("E_01");
  // if (!util.supports.audioVideo) throw new Error("E_02");
  let peer = useWebrtcAdminStore.getState().peer;
  if (!peer || !peer.open) {
    peer = new Peer("admin", peerOptionsStore);
  }

  peer.on("error", (mess) => {
    console.log(mess);
    setToast({
      type: "error",
      autoClose: false,
      data: { title: "ERROR PEER", content: `[${mess.type}]` },
    });
  });

  // PEER DATA :
  peer.on("open", (id) => {
    console.log(id + " - my peer is open");

    peer.on("connection", (peerData) => {
      console.log(peerData.peer + " - peerData is conn");

      peerData.on("open", () => {
        console.log(peerData.peer + " - peerData is open");

        peerData.on("data", (data) => {
          console.log(peerData.peer + " - sent mess :");
          console.log(data);
          const userData = data as user2adminDataType;
          if (userData.name) {
            console.log("TODO : PEER MOCHE !");

            peerData.send({
              goto: useMessAdminStore.getState().goto,
              toast: {
                type: "success",
                data: { title: "CONNEXION 👍", content: "Vous êtes bien connecté(e) !" },
                autoclose: 5000,
                progress: undefined,
              },
            });
            const user_ = useWebrtcAdminStore.getState().userS.find((u) => u.id === peerData.peer);
            const user: userType = {
              id: peerData.peer,
              name: userData.name,
              peerCo: true,
              peerData: peerData,
              peerMedia: user_?.peerMedia ?? null,
              stream: user_?.stream ?? null,
            };

            const B: webrtcBiterateType = { id: peerData.peer, bitrate: 0, bit: 0, time: Date.now() };
            useWebrtcAdminStore.setState((state) => ({
              userS: [...state.userS.filter((p) => p.id !== peerData.peer), user],
              bitrates: [...state.bitrates.filter((p) => p.id !== peerData.peer), B],
            }));
          }
          if (userData.audioChan !== undefined) {
            setUserSChannels(peerData.peer, userData.audioChan);
          }
          if (userData.ouestu) setOuestu(peerData.peer);
        });

        peerData.on("close", () => {
          console.log(peerData.peer + " - peerData is closed");
          useWebrtcAdminStore.setState((state) => ({
            userS: state.userS.filter((p) => p.id !== peerData.peer),
          }));
          useWebrtcAdminStore.setState((state) => ({
            userS: state.userS.filter((p) => p.id !== peerData.peer),
            bitrates: state.bitrates.filter((p) => p.id !== peerData.peer),
          }));
        });

        peerData.on("iceStateChanged", (state) => {
          console.log(peerData.peer + " - peerData is iceStateChanged to ", state);
          const user = useWebrtcAdminStore.getState().userS.find((u) => u.id === peerData.peer);
          if (user) {
            switch (state) {
              case "disconnected":
                useWebrtcAdminStore.setState((state) => ({
                  userS: [...state.userS.filter((p) => p.id !== peerData.peer), { ...user, peerCo: false }],
                }));
                break;

              case "connected":
                useWebrtcAdminStore.setState((state) => ({
                  userS: [...state.userS.filter((p) => p.id !== peerData.peer), { ...user, peerCo: true }],
                }));
                break;
            }
          }
        });

        peerData.on("error", (e) => {
          console.log(peerData.peer + " - peerData is closed (error) : ");
          console.log(e.message);
          useWebrtcAdminStore.setState((state) => ({
            userS: state.userS.filter((p) => p.id !== peerData.peer),
            bitrates: state.bitrates.filter((p) => p.id !== peerData.peer),
          }));
        });
      });
    });

    // PEER MEDIA:
    peer.on("call", (peerMedia) => {
      console.log("CALL");
      peerMedia.answer();

      peerMedia.on("stream", (stream) => {
        console.log(peerMedia.peer + " - is streaming");
        console.log("TODO : PEER MOCHE !");
        const divisor = useAudioAdminStore.getState().merger?.numberOfInputs ?? 2;
        setUserSChannels(peerMedia.peer, parseInt(peerMedia.peer.slice(-2)) % divisor || 0);
        const user_ = useWebrtcAdminStore.getState().userS.find((u) => u.id === peerMedia.peer);
        if (user_) {
          const user: userType = {
            id: peerMedia.peer,
            name: user_?.name ?? "",
            peerCo: true,
            peerData: user_?.peerData ?? null,
            peerMedia: peerMedia,
            stream: stream,
          };
          useWebrtcAdminStore.setState((state) => ({ userS: [...state.userS.filter((p) => p.id !== peerMedia.peer), user] }));
          // user_.peerData?.send({ toast: { type: "success", data: { content: "Media connexion [OK]" }, autoclose: 5000, progress: undefined } });
        }
      });

      peerMedia.on("close", () => {
        console.log(peerMedia.peer + " - peerMedia is closed");
        // useWebrtcAdminStore.setState((state) => ({
        //   userS: [...state.userS.filter((p) => p.id !== peerMedia.peer)],
        // }));
        const user_ = useWebrtcAdminStore.getState().userS.find((u) => u.id === peerMedia.peer);
        console.log("TODO : BETTER !!");
        if (user_) {
          const user: userType = {
            id: peerMedia.peer,
            name: user_?.name ?? "",
            peerCo: user_?.peerCo ?? false,
            peerData: user_?.peerData ?? null,
            peerMedia: null,
            stream: null,
          };
          useWebrtcAdminStore.setState((state) => ({ userS: [...state.userS.filter((p) => p.id !== peerMedia.peer), user] }));
        }
      });

      peerMedia.on("error", (e) => {
        console.log(peerMedia.peer + " - peerMedia is closed (error) :");
        console.log(e.message);
        // useWebrtcAdminStore.setState((state) => ({
        //   userS: [...state.userS.filter((p) => p.id !== peerMedia.peer)],
        // }));
        const user_ = useWebrtcAdminStore.getState().userS.find((u) => u.id === peerMedia.peer);
        if (user_) {
          const user: userType = {
            id: peerMedia.peer,
            name: user_?.name ?? "",
            peerCo: user_?.peerCo ?? false,
            peerData: user_?.peerData ?? null,
            peerMedia: null,
            stream: null,
          };
          useWebrtcAdminStore.setState((state) => ({ userS: [...state.userS.filter((p) => p.id !== peerMedia.peer), user] }));
        }
      });
    });
  });

  peer.on("error", (mess) => {
    console.log(mess);
    setToast({
      type: "error",
      data: { title: "ERROR PEER", content: `Impossible de se connecter [${mess.type}]` },
    });
  });

  peer.on("close", () => {
    console.log("peer is closed");
    setToast({
      type: "error",
      data: { title: "ERROR PEER", content: "Closed" },
    });
  });

  useWebrtcAdminStore.setState({ peer });
};

export const setBitrates = ({ id, bitrate, bit, time }: webrtcBiterateType) => {
  const bitrateUpdate: webrtcBiterateType = { id, bitrate, bit, time };
  useWebrtcAdminStore.setState((state) => ({ bitrates: [...state.bitrates.filter((p) => p.id !== id), bitrateUpdate] }));
};

export const sendMess = (mess: admin2userDataType) => {
  const userS = useWebrtcAdminStore.getState().userS;
  userS.forEach((user) => {
    if (user.peerData?.open) user.peerData.send(mess);
  });
};

export const send1UserMess = (mess: admin2userDataType, id: string) => {
  const user = useWebrtcAdminStore.getState().userS.find((p) => p.id === id);
  if (user && user.peerData?.open) user.peerData.send(mess);
};

export const sendRandomUserMess = (mess: admin2userDataType, percent: number) => {
  const userS = useWebrtcAdminStore.getState().userS;
  userS.forEach((user) => {
    if (user.peerData?.open) {
      if (Math.random() <= percent / 100) user.peerData.send(mess);
    }
  });
};
