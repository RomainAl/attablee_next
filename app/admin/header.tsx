"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMessAdminStore, setCurrentPage } from "@/store/mess.admin.store";
import { useAudioAdminStore, setAdminAudio } from "@/store/audio.admin.store";
import { createPeer, reconnUsers, useWebrtcAdminStore } from "@/store/webrtc.admin.store";
import { Activity, Ghost, Monitor, Power, Radio, RefreshCcw, Zap } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

// On isole la navigation pour éviter les re-renders inutiles
const NavigationTabs = memo(function NavigationTabs() {
  const currentPage = useMessAdminStore((s) => s.goto);

  const navItems = [
    { id: 1, label: "SAMPLER", icon: Activity },
    { id: 2, label: "VIDEOS", icon: Monitor },
    { id: 3, label: "NOISE", icon: Radio },
    { id: 42, label: "NIKEDAL", icon: Ghost },
    { id: 4, label: "FIN", icon: Power },
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
            className={cn(
              "relative h-8 px-3 text-[10px] tracking-tighter transition-all rounded-md gap-2",
              isActive ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={14} className={isActive ? "text-red-500" : "text-inherit"} />
            {item.label}
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-red-500" />}
          </Button>
        );
      })}
    </div>
  );
});

export default function Header() {
  // On récupère uniquement ce qui est nécessaire pour le header
  const audioState = useAudioAdminStore((s) => s.audioContext?.state);
  const usersCount = useWebrtcAdminStore(useShallow((s) => s.userS.filter((u) => u.peerCo).length));

  const initAdmin = () => {
    createPeer();
    setAdminAudio();
  };

  return (
    <nav className="w-full h-12 flex items-center px-3 gap-3 bg-black/60 backdrop-blur-xl border-b border-white/5 z-[100] shrink-0">
      {/* SECTION GAUCHE : SYSTEM INIT */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={initAdmin}
          className="bg-red-950/10 border-red-900/40 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 font-black text-[10px] gap-2 h-8"
        >
          <Zap size={14} fill="currentColor" />
          INIT SYSTEM
        </Button>

        {/* ENGINE STATUS LED */}
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <div
            className={cn(
              "size-1.5 rounded-full transition-all duration-500",
              audioState === "running" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-zinc-700"
            )}
          />
          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{audioState === "running" ? "Online" : "Offline"}</span>
        </div>
      </div>

      <div className="h-4 w-[1px] bg-white/10" />

      {/* SECTION CENTRE : NAVIGATION */}
      <NavigationTabs />

      {/* SECTION DROITE : USERS & TOOLS */}
      <div className="ml-auto flex items-center gap-4">
        {/* USERS COUNTER */}
        <div className="flex flex-col items-end mr-2">
          <span className="text-[7px] text-white/20 font-black uppercase tracking-[0.2em]">Users active</span>
          <span className="text-xs font-mono font-bold text-red-500">{usersCount.toString().padStart(2, "0")}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reconnUsers}
          className="text-[9px] text-white/30 hover:text-red-400 gap-2 border border-white/5 hover:border-red-900/30 h-8"
        >
          <RefreshCcw size={12} />
          RECONNECT ALL
        </Button>
      </div>
    </nav>
  );
}
