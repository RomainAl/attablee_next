"use client";
import { useMessAdminStore } from "@/store/mess.admin.store";
import Noise from "./noise";
import Sampler from "./sampler";
import Videos from "./videos";

export default function Home() {
  const goto = useMessAdminStore((s) => s.goto);
  console.log("RENDER HOME ", goto);
  return (
    <div className="relative size-full bg-black overflow-hidden font-mono">
      {goto === 1 && <Sampler />}
      {goto === 2 && <Videos />}
      {(goto === 3 || goto === 4) && <Noise />}
    </div>
  );
}
