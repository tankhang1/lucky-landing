"use client";
import Shell from "@/components/draw/Shell";
import Fullscreen from "@/components/draw/Fullscreen";

import { useMemo } from "react";
import { useSyncAcrossTabs } from "@/lib/sync";
import { useDrawStore } from "@/lib/store";
import { THEMES } from "@/lib/type";

export default function CageAudiencePage() {
  useSyncAcrossTabs("audience");
  const programs = useDrawStore((s) => s.programs);
  const programId = useDrawStore((s) => s.programId);
  const program = useMemo(
    () => programs?.find((p) => p.id === programId),
    [programId]
  );
  const themeKey = program?.status as keyof typeof THEMES;
  const cageDisplay = useDrawStore((s) => s.cageDisplay);

  return (
    <Shell>
      <Fullscreen>
        <div className="h-screen flex items-center justify-center">
          <div
            className={`text-[12vw] md:text-[10vw] font-black tracking-tight leading-none ${THEMES[themeKey].title} bg-clip-text text-transparent`}
          >
            {cageDisplay || "—"}
          </div>
        </div>
      </Fullscreen>
    </Shell>
  );
}
