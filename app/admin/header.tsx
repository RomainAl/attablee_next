"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setAdminAudio, useAudioAdminStore } from "@/store/audio.admin.store";
import { setCurrentPage, useMessAdminStore } from "@/store/mess.admin.store";
import { createPeer, reconnUsers, useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { Activity, Ghost, Monitor, Power, Radio, RefreshCcw, X, Zap } from "lucide-react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Bitrate } from "./bitrate";

const NavigationTabs = memo(function NavigationTabs() {
  const currentPage = useMessAdminStore((s) => s.goto);

  const navItems = [
    { id: 1, label: "SAMPLER", icon: Activity },
    { id: 2, label: "VIDEOS", icon: Monitor },
    { id: 3, label: "NOISE", icon: Radio },
    { id: 4, label: "BACKOUT", icon: X },
    { id: 5, label: "NIKEDAL", icon: Ghost },
    { id: 6, label: "FIN", icon: Power },
  ];

  return (
    <div className="flex gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(item.id)}
            // Retrait des transitions et des ombres glow
            className={cn(
              "relative h-8 px-3 text-[10px] tracking-tighter rounded-md gap-2",
              isActive ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200"
            )}
          >
            <Icon size={14} className={isActive ? "text-red-500" : "text-inherit"} />
            {item.label}
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-red-500" />}
          </Button>
        );
      })}
    </div>
  );
});

export default function Header() {
  const audioState = useAudioAdminStore((s) => s.audioContext?.state);
  const isPeerOnline = useWebrtcAdminStore((s) => !!s.peer && !s.peer.destroyed);
  const usersCount = useWebrtcAdminStore(useShallow((s) => s.userS.filter((u) => u.peerCo).length));

  const initAdmin = () => {
    createPeer();
    setAdminAudio();
  };

  return (
    // Suppression du backdrop-blur et du bg-black/60 au profit d'un noir opaque
    <nav className="z-100 flex h-12 w-full shrink-0 items-center gap-3 border-b border-[#1a1a1a] bg-[#050505] px-3">
      {/* SECTION GAUCHE : SYSTEM INIT */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={initAdmin}
          // Suppression des transitions de 500ms
          className="h-8 gap-2 border-red-900 bg-red-950/20 text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white"
        >
          <Zap size={14} fill="currentColor" />
          INIT SYSTEM
        </Button>

        {/* STATUS INDICATORS - Opaque */}
        <div className="flex items-center gap-4 rounded-full border border-white/5 bg-zinc-900 px-3 py-1">
          {/* AUDIO LED - Pas de shadow glow */}
          <div className="flex items-center gap-2">
            <div className={cn("size-2 rounded-full", audioState === "running" ? "bg-green-500" : "bg-zinc-800")} />
            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Audio</span>
          </div>

          <div className="h-2 w-px bg-white/10" />

          {/* NETWORK LED - Pas de shadow glow */}
          <div className="flex items-center gap-2">
            <div className={cn("size-2 rounded-full", isPeerOnline ? "bg-blue-500" : "bg-zinc-800")} />
            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Network</span>
          </div>
        </div>
      </div>

      <div className="mx-1 h-4 w-px bg-white/10" />

      {/* SECTION CENTRE : NAVIGATION */}
      <NavigationTabs />

      {/* SECTION DROITE : USERS & TOOLS */}
      <div className="ml-auto flex items-center gap-4">
        <div className="mr-2 flex flex-col items-center leading-none">
          <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">Users active</span>
          <span className="font-mono text-xs font-bold text-red-500">{usersCount.toString().padStart(2, "0")}</span>
        </div>

        <Bitrate />

        <Button
          variant="ghost"
          size="sm"
          onClick={reconnUsers}
          className="h-8 gap-2 border border-zinc-800 text-[9px] text-zinc-500 hover:border-red-900/50 hover:text-red-400"
        >
          <RefreshCcw size={12} />
          RECONNECT ALL
        </Button>
      </div>
    </nav>
  );
}
