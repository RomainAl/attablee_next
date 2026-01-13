"use client";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audio.user.store";

import { createPeer, setPeerTo0, useWebrtcUserStore } from "@/store/webrtc.user.store";
import { useEffect, useRef, useState } from "react";
import { useInterval, useTimeout } from "usehooks-ts";

export function Reco() {
  const peer = useWebrtcUserStore((store) => store.peer);
  const peerData = useWebrtcUserStore((store) => store.peerData);
  const [okButton, setOkButton] = useState(false);
  const audioContext = useAudioStore((store) => store.audioContext);
  const [checkSocket, setCheckSocket] = useState(false);
  const refTentativeNb = useRef(0);

  useTimeout(() => {
    setOkButton(true);
  }, 10000);

  useEffect(() => {
    audioContext?.suspend();
    return () => {
      audioContext?.resume();
    };
  }, [audioContext]);

  useInterval(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    fetch("https://attablee.art/socket/attablee/peers", { signal: controller.signal })
      .then((r) => {
        clearTimeout(timeoutId);
        if (!r.ok) {
          throw new Error("Impossible de se connecter au socket !");
        }
        return r.json();
      })
      .then((users) => {
        setCheckSocket(false);
        if (Array.isArray(users)) {
          if (peerData?.open && refTentativeNb.current < 2) {
            peerData?.close();
            refTentativeNb.current++;
          } else if (refTentativeNb.current < 2) {
            peer?.reconnect();
            refTentativeNb.current++;
          } else if (refTentativeNb.current < 10) {
            setPeerTo0();
            createPeer();
            refTentativeNb.current++;
          } else {
            window.location.reload();
          }
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setCheckSocket(true);
      });
  }, 5000);

  return (
    <div className="absolute size-full bg-[#000000BB] backdrop-blur-xs flex justify-center items-center z-50">
      <div className="p-4 rounded-2xl ring-1 ring-input bg-background flex flex-col gap-2 max-w-4/5">
        <div className="flex flex-crow items-center justify-center gap-2 w-full">
          <Spinner size="large" className="text-foreground"></Spinner>
          <p>Tentative de reconnexion automatique</p>
        </div>
        {checkSocket && (
          <p className="text-primary text-center w-full  mb-5">
            Vérifiez que vous êtes bien connectés au wifi <strong className="italic">smartphonics</strong>
          </p>
        )}
        {okButton && (
          <div className="flex flex-crow items-center justify-center gap-2  w-full">
            <Button onClick={() => window.location.reload()} variant={"outline"}>
              Réinitialiser tout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
