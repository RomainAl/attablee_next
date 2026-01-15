"use client";

import ToastG from "@/components/toastG";
import { requestWakeLock, useUserStore } from "@/store/user.store";
import { sendMess } from "@/store/webrtc.user.store";
import { useRef } from "react";
import { useEventListener } from "usehooks-ts";

export default function Layout_mine({ children }: { children: React.ReactNode }) {
  console.log("RENDER LAYOUT_MINE");
  const wakeLock = useUserStore((store) => store.wakeLock);
  const pageRef = useRef<HTMLDivElement>(null!);

  const requestFullscreen = () => {
    const element = pageRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  const handleDoubleClick = () => {
    sendMess({ ouestu: Date.now().toString() });
    console.log("DLBCLICK");
    if (!document.fullscreenElement) {
      requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEventListener("dblclick", handleDoubleClick, pageRef);

  return (
    <div
      className="size-full"
      ref={pageRef}
      onClick={() => {
        if (!wakeLock) requestWakeLock();
      }}
    >
      <ToastG />
      {children}
    </div>
  );
}
