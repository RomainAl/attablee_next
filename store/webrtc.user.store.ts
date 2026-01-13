import { customAlphabet } from "nanoid";
import type { DataConnection, MediaConnection } from "peerjs";
import Peer, { util } from "peerjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useMessUserStore } from "./mess.user.store";
import { admin2userDataType, peerOptionsStore, setToast, user2adminDataType } from "./shared.store";

type userInfos = {
  username: string;
  id: string;
};

type webrtcUserStoreType = {
  peerDeco: boolean;
  // peerInterval: NodeJS.Timeout | null;
  peer: Peer | null;
  peerData: DataConnection | null;
  peerMedia: MediaConnection | null;
};

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);
const randomId = "ID_" + nanoid() + "_" + String(Date.now());
const adminId = "admin";

export const useUserInfos = create<userInfos>()(
  persist(
    () => ({
      username: "",
      id: randomId,
    }),
    { name: "UserInfos", storage: createJSONStorage(() => localStorage) }
  )
);

export const setUserName = (username: string) => {
  useUserInfos.setState({ username });
};

export const useWebrtcUserStore = create<webrtcUserStoreType>(() => ({
  peerDeco: true,
  // peerInterval: null,
  peer: null,
  peerData: null,
  peerMedia: null,
  webcamStream: null,
}));

export const setPeerTo0 = () => {
  const peer = useWebrtcUserStore.getState().peer;
  const peerData = useWebrtcUserStore.getState().peerData;
  const peerMedia = useWebrtcUserStore.getState().peerMedia;
  try {
    peer?.disconnect();
  } catch (e) {
    console.log(e);
  }
  try {
    peerData?.close();
  } catch (e) {
    console.log(e);
  }
  try {
    peerMedia?.close();
  } catch (e) {
    console.log(e);
  }
  try {
    peer?.destroy();
  } catch (e) {
    console.log(e);
  }
  useWebrtcUserStore.setState({ peer: null, peerData: null, peerMedia: null, peerDeco: true });
};

export const setPeerDeco = (peerDeco: boolean) => {
  useWebrtcUserStore.setState({ peerDeco });
};

export const createPeer = () => {
  if (!util.supports.data) {
    setToast({ type: "error", data: { title: "ERROR SP01 (RTC)", content: "Désolé, ton smartphone n'est pas compatible avec smartphonics !" } });
    throw new Error("E_01");
  }

  if (!util.supports.audioVideo)
    setToast({
      type: "error",
      data: { title: "CONNEXION", content: "Désolé, votre smartphone n'aura pas accès à toutes les fonctionnalités de smartphonics !" },
    });

  let peer = useWebrtcUserStore.getState().peer;

  if (!peer || !peer.open) {
    peer = new Peer(useUserInfos.getState().id, peerOptionsStore);

    peer.on("open", (id) => {
      console.log(id + " - my peer is open");
      // const peerInterval = useWebrtcUserStore.getState().peerInterval;
      // const peerData = useWebrtcUserStore.getState().peerData;
      // if (peerInterval) {
      //   clearInterval(peerInterval);
      //   useWebrtcUserStore.setState({ peerInterval: null });
      // }
      // if (peerData?.open) {
      //   peerData.close();
      // }
      peerDataConn();
    });

    peer.on("connection", () => {
      const peerData = useWebrtcUserStore.getState().peerData;
      if (peerData?.open) {
        peerData.close();
      }
      peerDataConn();
    });

    // peer.on("disconnected", (id) => {
    //   console.log(id + " - my peer is disconnected");
    //   setToast({
    //     type: "error",
    //     data: { title: "ERROR PEER", content: "Disconnected" },
    //   });
    // });

    peer.on("close", () => {
      console.log(" - my peer is closed");
      // setToast({
      //   type: "error",
      //   data: { title: "ERROR PEER", content: "Closed" },
      // });
    });

    peer.on("error", (mess) => {
      console.log(mess);
      // setToast({
      //   type: "error",
      //   data: { title: "ERROR PEER", content: `Impossible de se connecter [${mess.type}]` },
      // });
      switch (mess.type) {
        case "network":
          // peer?.destroy();
          // let peerInterval = useWebrtcUserStore.getState().peerInterval;
          // if (peerInterval) clearInterval(peerInterval);
          // peerInterval = setInterval(() => {
          //   fetch("https://smartphonics.art/socket/peerjs/peers")
          //     .then((r) => r.json())
          //     .catch((e) => console.log(e))
          //     .then((users) => {
          //       // if (Array.isArray(users)) createPeer();
          //       setToast({
          //         type: "warning",
          //         data: { content: `Tentative de reconnexion automatique [E : ${mess.type}]` },
          //       });
          //     });
          // }, 10000);
          // useWebrtcUserStore.setState({ peerInterval });
          break;
        case "unavailable-id":
          // peer?.reconnect();
          break;
        case "peer-unavailable":
          setToast({
            type: "error",
            data: { title: "CONNEXION", content: `Désolé, les artistes ne sont pas connectés !` },
          });
          break;
        default:
      }
    });
    useWebrtcUserStore.setState({ peer });
  } else {
    peerDataConn();
  }
};

export const peerDataConn = () => {
  const peer = useWebrtcUserStore.getState().peer;
  if (peer && peer.open) {
    const peerData_ = useWebrtcUserStore.getState().peerData;
    if (!peerData_ || !peerData_.open) {
      const peerData = peer.connect(adminId);
      peerData.on("open", () => {
        console.log(peerData.peer + " - peerData is open");
        peerData.send({ conn: "Connected !", name: useUserInfos.getState().username });

        // const peerInterval = useWebrtcUserStore.getState().peerInterval;
        // if (peerInterval) {
        //   clearInterval(peerInterval);
        //   useWebrtcUserStore.setState({ peerInterval: null });
        // }

        peerData.on("data", (data) => {
          setPeerDeco(false);
          console.log(peerData.peer + " - sent mess :");
          console.log(data);
          const mess = data as admin2userDataType;
          if (mess.toast) setToast(mess.toast);
          useMessUserStore.setState(mess);
        });

        peerData.on("close", () => {
          console.log(peerData.peer + " - peerData is closed");
          setToast({
            type: "error",
            data: { title: "CONNEXION", content: "Oh !? Connexion coupée avec les artistes..." },
          });
          try {
            peerDataConn();
          } catch (e) {
            console.log(e);
          }
        });

        peerData.on("iceStateChanged", (state) => {
          console.log(peerData.peer + " - peerData is iceStateChanged to ", state);
          // setToast({
          //   type: "error",
          //   data: { title: `ERROR [peerData iceStateChanged to ${state}]`, content: "Problème de connexion avec les artistes..." },
          //   autoClose: 10000,
          // });
          switch (state) {
            case "connected":
              setPeerDeco(false);
              peer?.reconnect();
              // if (peerInterval) {
              //   clearInterval(peerInterval);
              //   useWebrtcUserStore.setState({ peerInterval: null });
              // }
              break;
            case "disconnected":
              setPeerDeco(true);
              break;
          }
        });

        peerData.on("error", (e) => {
          console.log(peerData.peer + " - peerData is closed (error) : ");
          // setToast({
          //   type: "error",
          //   data: { title: "ERROR [peerData error]", content: "Connexion impossible/coupée avec les artistes !" },
          //   autoClose: 10000,
          // });
          console.log(e.message);
          // try {
          //   peerDataConn();
          // } catch (e) {
          //   console.log(e);
          // }
        });

        useWebrtcUserStore.setState({ peerData: peerData, peerMedia: null });
      });
    } else {
      console.log(peerData_.peer + " - peerData is already opened");
      peerData_.send({ conn: "Connected !", name: useUserInfos.getState().username });
    }
  } else {
    createPeer();
  }
};

export const setStream = (stream: MediaStream) => {
  const peerMedia = useWebrtcUserStore.getState().peerMedia;
  if (peerMedia && peerMedia.open) {
    peerMedia.peerConnection
      .getSenders()
      .find((s) => s.track?.kind === "audio")
      ?.replaceTrack(stream.getAudioTracks()[0]);
    peerMedia.peerConnection
      .getSenders()
      .find((s) => s.track?.kind === "video")
      ?.replaceTrack(stream.getVideoTracks()[0]);
  } else {
    const peer = useWebrtcUserStore.getState().peer;
    const peerMedia = peer?.call(adminId, stream); // TODO GLOUPS PEERJS !??!
    useWebrtcUserStore.setState({ peerMedia });
  }
};

export const sendMess = (mess: user2adminDataType) => {
  const peerData = useWebrtcUserStore.getState().peerData;
  if (peerData?.open) peerData?.send(mess);
};

export const vibrate = (pattern: number | number[]) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  } else {
    console.warn("La vibration n'est pas prise en charge par ce navigateur.");
  }
};
