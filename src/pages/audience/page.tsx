"use client";
import Shell from "@/components/draw/Shell";
import Fullscreen from "@/components/draw/Fullscreen";
import WinnersTicker from "@/components/draw/WinnersTicker";
import SpinWheel from "@/components/draw/SpinWheel";
import { Crown } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useDrawStore } from "@/lib/store";
import { useSyncAcrossTabs } from "@/lib/sync";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";
import FiveDigitJackpot from "@/components/five-digit-jackpot";

export default function AudiencePage() {
  useSyncAcrossTabs("audience");
  const programId = useDrawStore((s) => s.programId);
  const program = useMemo(
    () => DEMO_PROGRAMS.find((p) => p.id === programId),
    [programId]
  );
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;
  const isCage = program?.type === "cage";
  const prizes = useDrawStore((s) => s.prizes);
  const winners = useDrawStore((s) => s.winners);

  const prevCount = useRef(winners.length);
  const [dense, setDense] = useState(false);
  const [flash, setFlash] = useState(false);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (winners.length > prevCount.current) {
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.28 } });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2500);
      if (tableWrapRef.current)
        tableWrapRef.current.scrollTo({ top: 0, behavior: "smooth" });
      if (firstRowRef.current)
        firstRowRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      prevCount.current = winners.length;
      return () => clearTimeout(t);
    }
    prevCount.current = winners.length;
  }, [winners.length]);

  const last = winners[0];

  return (
    <Shell>
      <Fullscreen>
        <div className="h-screen w-screen overflow-clip flex justify-center flex-col relative bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(themeKey) + String(dense)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`relative gap-8 w-full`}
            >
              {isCage ? (
                <div className="col-span-2 flex flex-col items-center gap-6">
                  <div className="text-6xl md:text-8xl font-black tracking-tight">
                    —
                  </div>
                  <div className="text-center text-muted-foreground">
                    Đang chờ số từ màn Control…
                  </div>
                </div>
              ) : (
                <div className="px-10 w-full flex items-center gap-10">
                  <div className="flex flex-col items-center gap-6">
                    <div className="pointer-events-auto">
                      <FiveDigitJackpot />
                    </div>
                    <div className="text-center text-muted-foreground">
                      Đang chờ thao tác từ màn Control…
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                      <Crown className="w-8 h-8" />
                      Người trúng gần nhất
                    </div>

                    <motion.div
                      animate={
                        flash
                          ? {
                              scale: 1.02,
                              boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)",
                              outlineColor: "transparent",
                            }
                          : { scale: 1 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 18,
                      }}
                      className={`rounded-2xl border p-6 bg-card/60 ${
                        flash ? "ring-2 ring-amber-400" : ""
                      }`}
                    >
                      {last ? (
                        <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                          <div>
                            {last.image ? (
                              <img
                                src={last.image}
                                className="h-24 w-24 object-contain"
                              />
                            ) : (
                              <div className="h-24 w-24  bg-muted" />
                            )}
                          </div>
                          <div
                            className={`grid ${
                              dense ? "grid-cols-1" : "grid-cols-2"
                            } gap-3 text-lg`}
                          >
                            <div className="opacity-70">Giải</div>
                            <div className="font-semibold">
                              {last.prizeLabel}
                            </div>
                            <div className="opacity-70">Tên</div>
                            <div className="font-semibold">
                              {last.name ?? "—"}
                            </div>
                            <div className="opacity-70">SĐT</div>
                            <div className="font-mono">{last.phone}</div>
                            <div className="opacity-70">Thời gian</div>
                            <div>{new Date(last.time).toLocaleString()}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          Chưa có kết quả
                        </div>
                      )}
                    </motion.div>

                    <WinnersTicker items={winners} dot={THEMES[themeKey].dot} />

                    <div className="border rounded-xl overflow-hidden bg-card/50">
                      <div
                        ref={tableWrapRef}
                        className="max-h-[44vh] overflow-auto"
                      >
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                            <tr>
                              <th className="text-left p-3 w-12">#</th>
                              <th className="text-left p-3">Thời gian</th>
                              <th className="text-left p-3">Giải</th>
                              <th className="text-left p-3">Tên</th>
                              <th className="text-left p-3">SĐT</th>
                              <th className="text-left p-3">Ảnh</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winners.map((w, idx) => (
                              <tr
                                key={w.id}
                                ref={idx === 0 ? firstRowRef : undefined}
                                className="border-t"
                              >
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {new Date(w.time).toLocaleString()}
                                </td>
                                <td className="p-3 font-medium">
                                  {w.prizeLabel}
                                </td>
                                <td className="p-3">{w.name ?? "—"}</td>
                                <td className="p-3 font-mono">{w.phone}</td>
                                <td className="p-3">
                                  {w.image ? (
                                    <img
                                      src={w.image}
                                      className="h-8 w-8 rounded object-cover"
                                    />
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Fullscreen>
    </Shell>
  );
}
