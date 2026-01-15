"use client";

import { setUserSChannels, useAudioAdminStore } from "@/store/audio.admin.store";
import { useMessUser2AdminStore } from "@/store/mess.admin.store";
import { send1UserMess, useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { memo, useEffect, useRef } from "react";
import { useInterval } from "usehooks-ts";
import { useShallow } from "zustand/react/shallow";

export const AudioMeterMemo = memo(function AudioMeter({ id }: { id: string }) {
  console.log("RENDER AUDIOMETER ", id);
  const ref = useRef<HTMLDivElement>(null);
  const chRef = useRef<HTMLSpanElement>(null);
  const refAudio = useRef<HTMLAudioElement>(null);
  const requestRef = useRef<number>(0);

  // 1. Paramètres de l'intervalle (provoquent un re-render uniquement au onValueCommit)
  const autoSpeed = useAudioAdminStore((s) => s.autoRoutingSpeed);

  // 2. Refs pour synchroniser l'audio sans redémarrer le useEffect principal
  const fadeTimeRef = useRef(Math.min(Math.max(autoSpeed * 0.2, 0.2), 5));

  // Met à jour le calcul du fondu dès que la vitesse change dans le store
  useEffect(() => {
    fadeTimeRef.current = Math.min(Math.max(autoSpeed * 0.2, 0.2), 5);
  }, [autoSpeed]);

  const audioContext = useAudioAdminStore((s) => s.audioContext);
  const merger = useAudioAdminStore((s) => s.merger);
  const stream = useWebrtcAdminStore(useShallow((s) => s.userS.find((u) => u.id === id)?.stream));

  // Boucle de changement aléatoire
  useInterval(() => {
    const isAuto = useAudioAdminStore.getState().autoRouting;
    if (isAuto) {
      setUserSChannels(id, Math.floor(Math.random() * useAudioAdminStore.getState().channelCount));
    }
  }, autoSpeed * 1000);

  useEffect(() => {
    const currentAudioEl = refAudio.current;
    if (!audioContext || !merger || !stream || !stream.active) return;

    if (currentAudioEl) currentAudioEl.srcObject = stream;

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    // Système de double gain pour Crossfade
    const gainA = audioContext.createGain();
    const gainB = audioContext.createGain();
    gainA.gain.value = 0;
    gainB.gain.value = 0;

    source.connect(analyser);
    analyser.connect(gainA);
    analyser.connect(gainB);

    let activeNode = gainA;
    let currentChannel = -1;

    const crossfadeToChannel = (nextChannel: number) => {
      const gains = useAudioAdminStore.getState().mergerGains;
      if (!gains[nextChannel] || nextChannel === currentChannel) return;

      const now = audioContext.currentTime;
      const currentFadeDuration = fadeTimeRef.current; // Lecture de la ref dynamique
      const masterGain = useAudioAdminStore.getState().globalClientsGain;

      const fadingOutNode = activeNode;
      const fadingInNode = activeNode === gainA ? gainB : gainA;

      // Routage du nouveau canal
      fadingInNode.disconnect();
      fadingInNode.connect(gains[nextChannel]);

      // Sécurité anti-clic
      fadingOutNode.gain.cancelScheduledValues(now);
      fadingInNode.gain.cancelScheduledValues(now);
      fadingOutNode.gain.setValueAtTime(fadingOutNode.gain.value, now);
      fadingInNode.gain.setValueAtTime(fadingInNode.gain.value || 0.0001, now);

      // Transition linéaire
      fadingOutNode.gain.linearRampToValueAtTime(0, now + currentFadeDuration);
      fadingInNode.gain.linearRampToValueAtTime(Math.max(0, masterGain), now + currentFadeDuration);

      activeNode = fadingInNode;
      currentChannel = nextChannel;

      // Update UI sans re-render
      if (chRef.current) {
        chRef.current.innerText = `C${nextChannel.toString().padStart(2, "0")}`;
      }
    };

    // Connexion initiale
    const initialCh = useAudioAdminStore.getState().userSChannels?.find((u) => u.id === id)?.ch ?? 0;
    const initialMasterGain = useAudioAdminStore.getState().globalClientsGain;
    const gains = useAudioAdminStore.getState().mergerGains;

    if (gains[initialCh]) {
      gainA.connect(gains[initialCh]);
      gainA.gain.setValueAtTime(initialMasterGain, audioContext.currentTime);
      activeNode = gainA;
      currentChannel = initialCh;
      if (chRef.current) chRef.current.innerText = `C${initialCh.toString().padStart(2, "0")}`;
    }

    const unsubChannel = useAudioAdminStore.subscribe(
      (s) => s.userSChannels?.find((u) => u.id === id)?.ch,
      (newCh) => {
        if (newCh !== undefined) crossfadeToChannel(newCh);
      }
    );

    const unsubGain = useAudioAdminStore.subscribe(
      (s) => s.globalClientsGain,
      (v) => {
        const now = audioContext.currentTime;
        activeNode.gain.setTargetAtTime(v, now, 0.05);
      }
    );

    const unouestu = useMessUser2AdminStore.subscribe(
      (s) => s.ouestu,
      (v) => {
        if (v === id) {
          ref.current!.style.border = "10px solid red";
        } else {
          ref.current!.style.border = "1px solid grey";
        }
      }
    );

    // Dessin du VU-mètre
    const draw = () => {
      analyser.fftSize = 32;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += Math.abs(data[i] / 128 - 1);

      if (ref.current) {
        const intensity = Math.min(sum * 400, 255);
        ref.current.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
      }
      requestRef.current = requestAnimationFrame(draw);
    };
    requestRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(requestRef.current);
      unsubChannel();
      unsubGain();
      unouestu();
      source.disconnect();
      analyser.disconnect();
      gainA.disconnect();
      gainB.disconnect();
      if (currentAudioEl) currentAudioEl.srcObject = null;
    };
    // Note : On ne met PAS 'autoSpeed' ou 'isAuto' ici pour protéger le flux audio
  }, [audioContext, merger, stream, id]);

  return (
    <div
      className="relative size-full border border-white/5 bg-zinc-900 overflow-hidden"
      ref={ref}
      onClick={() => {
        send1UserMess({ ouestu: Date.now() }, id);
      }}
    >
      <audio ref={refAudio} autoPlay muted playsInline className="hidden" />

      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <span ref={chRef} className="font-mono text-xl font-black text-red-500 tracking-tighter">
          C00
        </span>
      </div>

      <div className="absolute right-1 bottom-1 font-mono text-[8px] uppercase text-white/20 pointer-events-none">{id.slice(0, 4)}</div>
    </div>
  );
});
