// useInfiniteScrollNumberSafe.ts
import { useEffect, useRef, useState } from "react";

type Opts = {
  from?: number;
  to?: number;
  interval?: number; // desired step interval (ms)
  active: boolean;
  animMs?: number; // digit scroll animation duration (ms)
};

export function useInfiniteScrollNumberSafe({
  from = 0,
  to = 9,
  interval = 120,
  active,
  animMs = 400, // match DigitScroll duration (0.4s)
}: Opts) {
  const [value, setValue] = useState(from);

  const timerRef = useRef<number | null>(null);
  const busyRef = useRef(false); // true while animating one step
  const lastTickRef = useRef<number | null>(null);
  const range = to - from + 1;

  const clear = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!active) {
      clear();
      busyRef.current = false;
      lastTickRef.current = null;
      return;
    }

    const tick = () => {
      const now = performance.now();
      if (lastTickRef.current == null) lastTickRef.current = now;

      // How many logical steps should have happened since last tick?
      const elapsed = now - lastTickRef.current;
      const steps = Math.max(1, Math.floor(elapsed / Math.max(1, interval)));

      if (!busyRef.current) {
        // Advance by the coalesced step count in one visual step
        setValue((p) => {
          const next = from + ((((p - from + steps) % range) + range) % range);
          return next;
        });

        busyRef.current = true;
        // Mark logical time consumed
        lastTickRef.current += steps * interval;

        // When the animation completes, allow next visual step
        window.setTimeout(() => {
          busyRef.current = false;
        }, animMs);
      } else {
        // Still animating; do nothing—time accumulates and will be coalesced next time
      }

      // Schedule next check soon (don’t spam too hard)
      timerRef.current = window.setTimeout(tick, Math.min(interval, 50));
    };

    tick();
    return () => {
      clear();
      busyRef.current = false;
      lastTickRef.current = null;
    };
  }, [active, from, to, interval, animMs, range]);

  return value;
}
