"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Crown, Gift, Maximize2, Minimize2 } from "lucide-react";
import FiveDigitJackpot from "@/components/five-digit-jackpot";
import WinnersTicker from "@/components/draw/WinnersTicker";
import { useDrawStore } from "@/lib/store";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

function PrizeTicker({
  items,
}: {
  items: { label: string; count: number; image?: string }[];
}) {
  const list = items.flatMap((p) =>
    Array.from({ length: p.count }, () => ({ label: p.label, image: p.image }))
  );
  if (!list.length) return null;

  return (
    <div className="absolute bottom-0 inset-x-0 h-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      <div className="h-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <motion.div
          className="flex items-center gap-5 h-full px-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          style={{ width: "200%" }}
        >
          {[...list, ...list].map((p, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center h-10 px-4 rounded-full border border-white/60 backdrop-blur-md shadow-sm",
                "bg-gradient-to-br from-white/60 to-white/30 hover:from-white/80 transition-all duration-300",
                "gap-2"
              )}
            >
              {p.image ? (
                <div className="flex-shrink-0 h-7 w-7 rounded-full overflow-hidden ring-1 ring-white/50">
                  <img
                    src={p.image}
                    alt={p.label}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <Gift className="h-5 w-5 text-amber-700/70" />
              )}
              <span className="text-[15px] font-semibold text-neutral-800 whitespace-nowrap">
                {p.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function AudienceDeluxe() {
  const navigate = useNavigate();
  const programId = useDrawStore((s) => s.programId);
  const program = useMemo(
    () => DEMO_PROGRAMS.find((p) => p.id === programId),
    [programId]
  );
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;
  const winners = useDrawStore((s) => s.winners);
  const prizes = useDrawStore((s) => s.prizes);

  const prevCount = useRef(winners.length);
  const [flash, setFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLTableRowElement | null>(null);
  const last = winners[0];
  const [isFull, setIsFull] = useState(false);
  const toggleFullScreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFull(true);
    } else {
      await document.exitFullscreen();
      setIsFull(false);
    }
  };
  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (winners.length > prevCount.current) {
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.28 } });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2200);
      tableWrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      firstRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      prevCount.current = winners.length;
      return () => clearTimeout(t);
    }
    prevCount.current = winners.length;
  }, [winners.length]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0",
          "bg-[radial-gradient(900px_600px_at_10%_-10%,#fff7e6_0%,transparent_60%),radial-gradient(800px_520px_at_110%_120%,#ffe4e6_0%,transparent_60%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22 viewBox=%220 0 4 4%22><path fill=%22%23000%22 fill-opacity=%220.6%22 d=%22M0 0h1v1H0zM2 0h1v1H2zM1 1h1v1H1zM3 1h1v1H3zM0 2h1v1H0zM2 2h1v1H2zM1 3h1v1H1zM3 3h1v1H3z%22/></svg>')]" />
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[36rem] w-[36rem] bg-amber-300/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 h-[36rem] w-[36rem] bg-rose-300/30 blur-3xl rounded-full" />
      </div>

      <div className="relative h-full px-6 md:px-10 py-8 flex gap-8 items-stretch">
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-8">
          <div className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900">
            Quay số may mắn
          </div>
          <div className="rounded-3xl border bg-white/60 backdrop-blur p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
            <FiveDigitJackpot />
          </div>
          <div className="text-center text-neutral-700 font-medium">
            Đang chờ thao tác từ màn Control…
          </div>
        </div>

        <div className="hidden lg:flex w-px bg-neutral-200/60 rounded-full" />

        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-md rounded-full bg-amber-400/60" />
              <Crown className="relative w-8 h-8 text-amber-600 drop-shadow" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-neutral-900">
              Người trúng gần nhất
            </div>
            <button
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 z-50 p-2"
              title={isFull ? "Exit Full Screen" : "Full Screen"}
            >
              {isFull ? (
                <Minimize2 className="h-5 w-5 text-neutral-700" />
              ) : (
                <Maximize2 className="h-5 w-5 text-neutral-700" />
              )}
            </button>
            <button
              onClick={() => navigate("/control")}
              className="absolute top-4 left-4 z-50 p-2"
              title={isFull ? "Exit Full Screen" : "Full Screen"}
            >
              <ArrowLeft />
            </button>
          </div>

          <motion.div
            animate={
              flash
                ? { scale: 1.02, boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" }
                : { scale: 1 }
            }
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className={cn(
              "relative rounded-2xl border bg-white/70 backdrop-blur p-6",
              "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
            )}
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
            {last ? (
              <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                <div>
                  {last.image ? (
                    <img src={last.image} className="w-44 object-contain" />
                  ) : (
                    <div className="h-44 w-44 rounded-xl bg-neutral-100" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
                  <div className="text-neutral-500">Giải</div>
                  <div className="font-semibold">{last.prizeLabel}</div>
                  <div className="text-neutral-500">Tên</div>
                  <div className="font-semibold">{last.name ?? "—"}</div>
                  <div className="text-neutral-500">SĐT</div>
                  <div className="font-mono">{last.phone}</div>
                  <div className="text-neutral-500">Thời gian</div>
                  <div>{new Date(last.time).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500">Chưa có kết quả</div>
            )}
          </motion.div>

          <WinnersTicker items={winners} dot={THEMES[themeKey].dot} />

          <div className="rounded-2xl border overflow-hidden bg-white/70 backdrop-blur">
            <div ref={tableWrapRef} className="max-h-[55vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-neutral-50/90 backdrop-blur">
                  <tr className="text-lg">
                    <th className="text-left p-3 w-12">#</th>
                    <th className="text-left p-3">Thời gian</th>
                    <th className="text-left p-3">Giải</th>
                    <th className="text-left p-3">Tên</th>
                    <th className="text-left p-3">SĐT</th>
                    <th className="text-left p-3">Ảnh</th>
                  </tr>
                </thead>
                <tbody className="text-lg">
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
                      <td className="p-3 font-medium">{w.prizeLabel}</td>
                      <td className="p-3">{w.name ?? "—"}</td>
                      <td className="p-3 font-mono">{w.phone}</td>
                      <td className="p-3">
                        {w.image ? (
                          <img
                            src={w.image}
                            className="w-20 rounded object-contain"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                  {!winners.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-neutral-500"
                      >
                        Chưa có người trúng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <PrizeTicker
          items={prizes.map((p) => ({
            label: p.label,
            count: p.count,
            image: p.image,
          }))}
        />
      </div>
    </div>
  );
}
