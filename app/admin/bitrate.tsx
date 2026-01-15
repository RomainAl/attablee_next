"use client";

import { setBitrates, useWebrtcAdminStore, webrtcBiterateType } from "@/store/webrtc.admin.store";

import { useState } from "react";
import { useInterval } from "usehooks-ts";

export function Bitrate() {
  const userS = useWebrtcAdminStore((store) => store.userS);
  const bitrates = useWebrtcAdminStore((store) => store.bitrates);
  const [BG, setBG] = useState(0);

  useInterval(() => {
    try {
      if (bitrates.length > 0) {
        setBG(0);
        bitrates.forEach((b) => {
          userS
            .find((u) => u.id === b.id)
            ?.peerMedia?.peerConnection.getStats(null)
            .then((res) => {
              const statsU = dumpStats(res, b);
              setBG((BG) => BG + statsU.bitrate);
              setBitrates(statsU);
            });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, 5000);

  return (
    <div className="mr-2 flex flex-col items-center leading-none">
      <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Bitrate :</span>
      <span className="font-mono text-xs font-bold text-red-500">{`${BG} kbit/s`}</span>
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
    if (res.type === "inbound-rtp" && res.mediaType === "audio") {
      stats.bitrate = Math.floor((8 * (res.bytesReceived - statsPrev.bit)) / (stats.time - statsPrev.time));
      stats.bit = res.bytesReceived;
    }
    // } else if (res.type === "inbound-rtp" && res.mediaType === "video") {
    //   stats.bitrate[1] = Math.floor((8 * (res.bytesReceived - statsPrev.bit[1])) / (stats.time - statsPrev.time));
    //   stats.bit[1] = res.bytesReceived;
    // } else if (res.type === "outbound-rtp" && res.mediaType === "audio") {
    //   stats.bitrate[2] = Math.floor((8 * (res.bytesReceived - statsPrev.bit[2])) / (stats.time - statsPrev.time));
    //   stats.bit[2] = res.bytesReceived;
    // } else if (res.type === "outbound-rtp" && res.mediaType === "video") {
    //   stats.bitrate[3] = Math.floor((8 * (res.bytesReceived - statsPrev.bit[3])) / (stats.time - statsPrev.time));
    //   stats.bit[3] = res.bytesReceived;
    // }
  });

  return stats;
}
