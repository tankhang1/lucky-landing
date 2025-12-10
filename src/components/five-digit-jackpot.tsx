// components/draw/FiveDigitJackpot.tsx
"use client";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import useSound from "use-sound";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion"; // Make sure to install framer-motion
import { useDrawStore } from "@/lib/store";
import DigitReel from "./digit-flip";
import { useFullscreenContainer } from "@/components/draw/Fullscreen";
import { Button } from "./ui/button";
import { Trophy, Gift, X } from "lucide-react";

export default function FiveDigitJackpot({
  size = 160,
  isControl = false,
  number,
  type,
}: {
  size?: number;
  isControl?: boolean;
  number: string;
  type: string;
}) {
  const prizes = useDrawStore((s) => s.prizes);
  const winners = useDrawStore((s) => s.winners);
  const addWinnerFromJackpot = useDrawStore((s) => s.wheelStopAt);

  const [active, setActive] = useState<boolean[]>(Array(5).fill(true));
  const [stopNumbers, setStopNumbers] = useState<number[]>([0, 0, 0, 0, 0]);

  // Sounds
  const [playSpin, { stop: stopSpin }] = useSound(
    "/sound/running-jackpot.mp3",
    { volume: 1, loop: true }
  );
  const [playDing] = useSound("/sound/ding.mp3", { volume: 0.8 });
  const [playWin] = useSound("/sound/win.mp3", { volume: 0.6 }); // Optional: Add a win sound

  const allStopped = active.every((a) => !a);
  const numberStr = stopNumbers.join("");

  // --- Logic: Start/Stop ---
  const startAll = () => {
    playSpin();
    setActive(Array(number.length).fill(true));
  };

  const stopAll = () => {
    stopSpin();
    Array.from({ length: number.length }).forEach((_, i) => {
      setTimeout(() => {
        setActive((prev) => prev.map((v, idx) => (idx === i ? false : v)));
        setStopNumbers((prev) =>
          prev.map((v, idx) => (idx === i ? Math.floor(Math.random() * 10) : v))
        );
      }, i * 450);
    });
  };

  // Sync props
  useEffect(() => {
    playSpin();
    setActive(Array(number.length).fill(true));
    setStopNumbers(number?.split("")?.map((item) => +item));
  }, [number]);

  // Handle Auto-Stop based on Type
  useEffect(() => {
    if (!type) return;
    if (type === "0") {
      setTimeout(() => stopAll(), 2000);
    }
  }, [type]);

  // --- Logic: Win Condition ---
  useEffect(() => {
    if (allStopped && !allStopped) {
      stopSpin();
      playDing();

      const prizeIdx = prizes.length ? 0 : -1;
      if (prizeIdx >= 0) {
        addWinnerFromJackpot(prizeIdx);
        setTimeout(() => {
          playWin();
          triggerConfetti();
        }, 500);
      }
    }
  }, [allStopped, prizes.length, addWinnerFromJackpot]);

  // --- Helper: Confetti ---
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        zIndex: 99999, // Ensure it's above the dialog
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        zIndex: 99999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="w-full">
      {/* --- REELS --- */}
      <div className="relative overflow-hidden p-6">
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
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
            <div className="flex items-center gap-2 mt-4">
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

      {/* --- DIALOG (RESULT) --- */}
      <Dialog.Root
        open={allStopped}
        onOpenChange={() => setActive(Array(number.length).fill(true))}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            forceMount
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1001] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />

          <Dialog.Content
            forceMount
            className="fixed left-1/2 top-1/2 w-[95vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 outline-none z-[1002]"
          >
            <AnimatePresence>
              {allStopped && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                  {/* Close Button */}
                  <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10">
                    <X className="w-6 h-6 text-slate-400" />
                  </Dialog.Close>

                  <div className="flex flex-col items-center p-8 pb-12">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-sm mb-6">
                      <Trophy className="w-5 h-5" />
                      <div>Chúc mừng chiến thắng</div>
                      <Trophy className="w-5 h-5" />
                    </div>

                    {/* BIG WINNING NUMBER */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: 0.2,
                      }}
                      className="relative z-10"
                    >
                      {/* Glow Effect behind number */}
                      <div className="absolute inset-0 bg-amber-400/30 blur-[60px] rounded-full" />

                      <motion.h2
                        // The Heartbeat / Zoom In-Out Effect
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                          delay: 1,
                        }}
                        className="relative text-[120px] sm:text-[150px] font-black leading-none bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {numberStr}
                      </motion.h2>
                    </motion.div>

                    {/* WINNER DETAILS CARD */}
                    {winners[0] ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="relative shrink-0">
                          {winners[0].image ? (
                            <img
                              src={winners[0].image}
                              className="h-20 w-20 rounded-xl object-cover shadow-sm ring-2 ring-white"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-xl bg-slate-200 flex items-center justify-center">
                              <Gift className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 uppercase font-semibold mb-1">
                            Người trúng giải
                          </div>
                          <div className="text-xl font-bold truncate text-slate-800 dark:text-slate-100">
                            {winners[0].name || "Khách hàng"}
                          </div>
                          <div className="text-slate-500 font-mono text-sm">
                            {winners[0].phone}
                          </div>
                          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {winners[0].prizeLabel}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="mt-8 text-slate-400 italic">
                        Đang cập nhật người trúng...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
