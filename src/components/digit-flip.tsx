import {
  motion,
  useMotionValue,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

export default function DigitReel({
  active,
  stopNumber = 0,
  size = 30,
  speed = 700,
  extraTurns = 2,
  onClick,
}: {
  active: boolean;
  stopNumber?: number;
  size?: number;
  speed?: number;
  extraTurns?: number;
  onClick?: () => void;
}) {
  const h = size;
  const list = useMemo(() => [...DIGITS, ...DIGITS, ...DIGITS], []);
  const cycle = 10 * h;
  const middleStart = -cycle;
  const bottomStart = -2 * cycle;

  const y = useMotionValue(middleStart);
  const spinAnim = useRef<AnimationPlaybackControls | null>(null);

  const stopSpin = () => {
    if (spinAnim.current) {
      spinAnim.current.stop();
      spinAnim.current = null;
    }
  };

  useEffect(() => {
    const normCycle = (v: number) => ((v % cycle) + cycle) % cycle;

    if (active) {
      stopSpin();
      y.set(middleStart);
      spinAnim.current = animate(y, bottomStart, {
        duration: cycle / speed,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      });
    } else {
      stopSpin();

      // constants
      const targetOffset = (((stopNumber % 10) + 10) % 10) * h; // 0..9 * h
      const targetMiddle = middleStart - targetOffset; // exact row in middle strip

      const current = y.get();
      // We want finalY = targetMiddle - k*cycle (k integer) and finalY <= current - eps,
      // with at least `extraTurns` cycles traveled downward.
      const eps = 0.001;
      const kMinFromCurrent = Math.ceil((current - targetMiddle + eps) / cycle);
      const k = Math.max(kMinFromCurrent, extraTurns);

      let finalY = targetMiddle - k * cycle;

      // Keep within visible middle copy range [-2*cycle, -cycle]
      while (finalY < -2 * cycle) finalY += cycle;
      while (finalY > -cycle) finalY -= cycle;

      animate(y, finalY, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    }

    return () => stopSpin();
  }, [
    active,
    stopNumber,
    h,
    speed,
    extraTurns,
    y,
    cycle,
    middleStart,
    bottomStart,
  ]);

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-sm border bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 cursor-pointer"
      style={{ height: h, width: h * 0.7 }}
    >
      <motion.div style={{ y, willChange: "transform" }}>
        {list.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="flex items-center justify-center font-mono font-bold"
            style={{ height: h, fontSize: `${h * 0.44}px` }}
          >
            {d}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
