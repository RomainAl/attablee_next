"use client";
import { NikedalCanvas } from "@/components/nikedalCanvas";
import { NoiseCanvas } from "@/components/noiseCanvas";
import { useEffect, useRef, useState } from "react";
import { Accueil } from "./accueil";
import { Crepitements } from "./crepitements";
import { Fin } from "./fin";
import { Nikedal } from "./nikedal";
import { Sampler } from "./sampler";
import { Videos } from "./videos";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export default function Home() {
  console.log("HOME RENDER");
  const [muted, setMuted] = useState<boolean>(true);
  const [tabNb, setTabNb] = useState<number>(0);
  const currentTabRef = useRef(tabNb);

  const crepRef = useRef<HTMLAudioElement>(null);
  const nikRef = useRef<HTMLAudioElement>(null);
  const videosRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    currentTabRef.current = tabNb;
  }, [tabNb]);

  const start = () => {
    setTabNb(3);
    if (crepRef.current) {
      crepRef.current.muted = false;
      crepRef.current.play();
      setTimeout(() => {
        if (crepRef.current && currentTabRef.current !== 3) {
          crepRef.current.muted = true;
        }
      }, 1000);
    }
    if (nikRef.current) {
      nikRef.current.muted = false;
      nikRef.current.play();
      setTimeout(() => {
        if (nikRef.current && currentTabRef.current !== 42) {
          nikRef.current.muted = true;
        }
      }, 1000);
    }
    if (videosRef.current) {
      videosRef.current.muted = false;
      setTimeout(() => {
        if (videosRef.current && currentTabRef.current !== 2) videosRef.current.muted = true;
      }, 1000);
    }
    setMuted(false);
  };

  // useTimeout(() => {
  //   setTabNb(42);
  // }, 10000);

  // useTimeout(() => {
  //   setTabNb(3);
  // }, 17000);

  // useTimeout(() => {
  //   setTabNb(2);
  // }, 20000);

  // useTimeout(() => {
  //   setTabNb(3);
  // }, 25000);

  // useTimeout(() => {
  //   setTabNb(2);
  // }, 30000);
  // useTimeout(() => {
  //   setTabNb(2);
  // }, 25000);

  // useTimeout(() => {
  //   setTabNb(0);
  // }, 30000);

  return (
    <main className="h-dvh w-dvw">
      <Accueil start={start} tabNb={tabNb} />
      <Sampler tabNb={tabNb} />
      <Videos ref={videosRef} tabNb={tabNb} muted={muted} />
      <NoiseCanvas tabNb={tabNb} />
      <Crepitements ref={crepRef} tabNb={tabNb} muted={muted} />
      <NikedalCanvas tabNb={tabNb} />
      <Nikedal ref={nikRef} tabNb={tabNb} muted={muted} />
      <Fin tabNb={tabNb} />
    </main>
  );
}
