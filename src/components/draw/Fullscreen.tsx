// components/draw/Fullscreen.tsx
"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

const FullscreenCtx =
  createContext<MutableRefObject<HTMLDivElement | null> | null>(null);
export function useFullscreenContainer() {
  return useContext(FullscreenCtx);
}

export default function Fullscreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fs, setFs] = useState(false);
  const toggle = async () => {
    if (!document.fullscreenElement) {
      await ref.current?.requestFullscreen();
      setFs(true);
    } else {
      await document.exitFullscreen();
      setFs(false);
    }
  };
  return (
    <FullscreenCtx.Provider value={ref}>
      <div ref={ref} className="relative h-screen">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="absolute right-3 top-3 z-[1003]"
        >
          {fs ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
        {children}
      </div>
    </FullscreenCtx.Provider>
  );
}
