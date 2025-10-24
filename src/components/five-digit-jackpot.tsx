// components/draw/FiveDigitJackpot.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import useSound from "use-sound";
import confetti from "canvas-confetti";
import { useDrawStore } from "@/lib/store";
import DigitReel from "./digit-flip";
import { useFullscreenContainer } from "@/components/draw/Fullscreen";
import { Button } from "./ui/button";

export default function FiveDigitJackpot({
  size = 160,
  isControl = false,
}: {
  size?: number;
  isControl?: boolean;
}) {
  const prizes = useDrawStore((s) => s.prizes);
  const winners = useDrawStore((s) => s.winners);
  const addWinnerFromJackpot = useDrawStore((s) => s.wheelStopAt);

  const [active, setActive] = useState<boolean[]>(Array(5).fill(true));
  const [stopNumbers, setStopNumbers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [open, setOpen] = useState(false);

  const [playSpin, { stop: stopSpin }] = useSound(
    "/sound/running-jackpot.mp3",
    { volume: 1, loop: true }
  );
  const [playDing] = useSound("/sound/ding.mp3", { volume: 0.8 });

  const allStopped = active.every((a) => !a);
  const numberStr = stopNumbers.join("");

  // === fullscreen container & confetti instance inside it ===
  const fsRef = useFullscreenContainer();
  const confettiApi = useRef<ReturnType<typeof confetti.create> | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fsRef?.current) return;

    if (open) {
      const cnv = document.createElement("canvas");
      confettiCanvasRef.current = cnv;

      Object.assign(cnv.style, {
        position: "fixed", // sits in the fullscreen top layer
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // Higher than your Dialog.Content/Overlay (which are typically ~1000–1002)
        zIndex: "10050",
      });

      // Append AFTER Dialog.Portal renders so the canvas is on top
      fsRef.current.appendChild(cnv);
      confettiApi.current = confetti.create(cnv, {
        resize: true,
        useWorker: true,
      });

      return () => {
        confettiApi.current = null;
        cnv.remove();
        confettiCanvasRef.current = null;
      };
    } else {
      // if the dialog closes, tear down
      if (confettiCanvasRef.current) {
        confettiCanvasRef.current.remove();
        confettiCanvasRef.current = null;
        confettiApi.current = null;
      }
    }
  }, [open, fsRef]);

  const startAll = () => {
    playSpin();
    setActive(Array(5).fill(true));
  };
  const stopAll = () => {
    stopSpin();
    Array.from({ length: 5 }).forEach((_, i) => {
      setTimeout(() => {
        setActive((prev) => prev.map((v, idx) => (idx === i ? false : v)));
        setStopNumbers((prev) =>
          prev.map((v, idx) => (idx === i ? Math.floor(Math.random() * 10) : v))
        );
      }, i * 450);
    });
  };

  useEffect(() => {
    if (allStopped) {
      stopSpin();
      playDing();

      const prizeIdx = prizes.length ? 0 : -1;
      if (prizeIdx >= 0) addWinnerFromJackpot(prizeIdx);
      setOpen(true);
      requestAnimationFrame(() => {
        confettiApi.current?.({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.28 },
        });
      });
    }
  }, [allStopped, playDing, stopSpin, prizes.length, addWinnerFromJackpot]);
  return (
    <div className="w-full">
      <div className="relative overflow-hidden-6">
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex gap-3 md:gap-4">
            {active.map((isActive, i) => (
              <DigitReel
                key={i}
                active={isActive}
                stopNumber={stopNumbers[i]}
                size={size}
                speed={700 + i * 60}
                extraTurns={2}
                onClick={() =>
                  setActive((prev) =>
                    prev.map((v, idx) => (idx === i ? !v : v))
                  )
                }
              />
            ))}
          </div>
          {isControl && (
            <div className="flex items-center gap-2">
              <Button onClick={startAll} disabled={active.every(Boolean)}>
                Bắt đầu
              </Button>
              <Button
                variant="secondary"
                onClick={stopAll}
                disabled={active.every((a) => !a)}
              >
                Kết thúc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog rendered INTO fullscreen container */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal container={fsRef?.current ?? undefined}>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out z-[1001]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-lg outline-none z-[1002] data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Dialog.Title className="text-lg font-semibold">
              Kết quả – Số: {numberStr}
            </Dialog.Title>

            {winners[0] ? (
              <div className="mt-4 grid grid-cols-[120px_1fr] gap-4 items-center">
                <div>
                  {winners[0].image ? (
                    <img src={winners[0].image} className="h-24 w-24" />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-muted" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-base">
                  <div className="opacity-70">Giải</div>
                  <div className="font-semibold">{winners[0].prizeLabel}</div>
                  <div className="opacity-70">Tên</div>
                  <div className="font-semibold">{winners[0].name ?? "—"}</div>
                  <div className="opacity-70">SĐT</div>
                  <div className="font-mono">{winners[0].phone}</div>
                  <div className="opacity-70">Thời gian</div>
                  <div>{new Date(winners[0].time).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-muted-foreground">
                Không có người trúng hoặc hết giải.
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">
                Danh sách giải còn lại
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {prizes.map((pr) => (
                  <div
                    key={pr.id}
                    className="rounded-xl border p-3 bg-card/50 flex items-center gap-3"
                  >
                    {pr.image ? (
                      <img
                        src={pr.image}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium leading-tight">
                        {pr.label}
                      </div>
                      <div className="text-xs opacity-70">x{pr.count}</div>
                    </div>
                  </div>
                ))}
                {!prizes.length && (
                  <div className="text-sm text-muted-foreground">Hết giải.</div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
