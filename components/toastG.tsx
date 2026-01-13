"use client";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/shared.store";
import { useEffect, useRef } from "react";
import { Id, Slide, toast, ToastContainer, ToastContentProps } from "react-toastify";

type CustomNotificationProps = ToastContentProps<{
  title?: string;
  content: string;
  isAdmin?: boolean;
}>;

export default function ToastG() {
  const toastG = useToastStore();
  const toastID = useRef<Id>(null);

  useEffect(() => {
    if (toastG.type === "loading") {
      toastID.current = toast.loading("Loading...", toastG as unknown as CustomNotificationProps);
    } else if (toastG.type === "update" && toastID.current) {
      toast.update(toastID.current, toastG as unknown as CustomNotificationProps);
    } else if (toastG.data) {
      toast(CustomNotification, { ...(toastG as unknown as CustomNotificationProps) });
    }
  }, [toastG]);

  // useTimeout(() => {
  //   setToast({ type: "update", render: "Chargement...[2]", progress: 0.9 });
  //   console.log("top");
  // }, 10000);

  // useTimeout(() => {
  //   setToast({ type: "update", render: "Chargement...[2]", progress: 1 });
  //   console.log("top");
  // }, 14000);
  // toast("toto", { position: "top-center", transition: Slide, className: "w-[1000px]", autoClose: false });
  // useInterval(() => {
  //   toast("toto", { position: "top-center", transition: Slide, className: "w-[12000px]" });
  // }, 10000);

  return (
    <ToastContainer
      limit={9}
      draggable
      autoClose={7000}
      transition={Slide}
      position="top-center"
      theme="dark"
      pauseOnFocusLoss={false}
      closeOnClick={true}
      className="pt-2 lg:pt-0 gap-2 lg:gap-1 px-8 lg:px-0"
    />
  );
}

function CustomNotification({ data, toastProps }: CustomNotificationProps) {
  return (
    <div className="flex flex-col w-full gap-1">
      {data.title && (
        <h3 className={cn("text-sm font-semibold", "text-white", { "text-primary": toastProps.type === "default", "text-2xl": data.isAdmin })}>
          {data.title}
        </h3>
      )}
      <div className="flex items-center justify-between">
        {data.title ? (
          <p className={cn("text-sm italic", { "text-2xl": data.isAdmin })}>{data.content}</p>
        ) : (
          <p className={cn("text-sm", { "text-2xl": data.isAdmin })}>{data.content}</p>
        )}
      </div>
    </div>
  );
}
