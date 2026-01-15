"use client";

import { setBitrates, useWebrtcAdminStore, webrtcBiterateType } from "@/store/webrtc.admin.store";
import { useState } from "react";
import { useInterval } from "usehooks-ts";

export function Bitrate() {
  const userS = useWebrtcAdminStore((store) => store.userS);
  const bitrates = useWebrtcAdminStore((store) => store.bitrates);
  const [BG, setBG] = useState(0);

  useInterval(async () => {
    if (bitrates.length === 0) return;

    try {
      // On récupère toutes les promesses de stats en parallèle
      const statsPromises = bitrates.map(async (b) => {
        const user = userS.find((u) => u.id === b.id);
        const pc = user?.peerMedia?.peerConnection;

        if (pc) {
          const res = await pc.getStats(null);
          return dumpStats(res, b);
        }
        return null;
      });

      const results = await Promise.all(statsPromises);

      let totalBitrate = 0;
      results.forEach((statsU) => {
        if (statsU) {
          totalBitrate += statsU.bitrate;
          setBitrates(statsU); // Mise à jour individuelle dans le store (Zustand gère l'optimisation)
        }
      });

      // UNE SEULE mise à jour d'état pour tout le composant
      setBG(totalBitrate);
    } catch (err) {
      // Console épurée pour éviter de charger le bus de données Chrome
      console.error(err);
    }
  }, 5000);

  return (
    <div className="mr-2 flex flex-col items-center leading-none select-none">
      <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600">Bitrate</span>
      <span className="font-mono text-xs font-bold text-red-500 tabular-nums">
        {BG} <span className="text-[10px] opacity-50">kb/s</span>
      </span>
    </div>
  );
}

function dumpStats(results: RTCStatsReport, statsPrev: webrtcBiterateType) {
  const stats: webrtcBiterateType = {
    id: statsPrev.id,
    bitrate: 0,
    bit: 0,
    time: Date.now(),
  };

  results.forEach((res) => {
    // On ne traite que l'audio inbound comme dans ton code original
    if (res.type === "inbound-rtp" && res.kind === "audio") {
      const bytes = res.bytesReceived || 0;
      const timeDiff = stats.time - statsPrev.time;

      if (timeDiff > 0) {
        // Calcul du bitrate en kbit/s
        stats.bitrate = Math.floor((8 * (bytes - statsPrev.bit)) / timeDiff);
      }
      stats.bit = bytes;
    }
  });

  return stats;
}
