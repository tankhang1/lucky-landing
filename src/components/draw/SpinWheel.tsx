"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import type { Prize } from "@/lib/type";

export default function SpinWheel({
  segments,
  onStop,
  size = 520,
}: {
  segments: Prize[];
  onStop: (i: number) => void;
  size?: number;
}) {
  const [angle, setAngle] = useState(0);
  const [spin, setSpin] = useState(false);
  const base = 360 / Math.max(1, segments.length);
  const handle = () => {
    if (!segments.length || spin) return;
    setSpin(true);
    const target = Math.floor(Math.random() * segments.length);
    const turns = 6 + Math.floor(Math.random() * 3);
    const finalAngle =
      turns * 360 + (segments.length - target) * base - base / 2;
    setAngle(finalAngle);
    setTimeout(() => {
      setSpin(false);
      onStop(target);
    }, 2400);
  };
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={spin ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <div className="absolute -inset-6 rounded-full blur-2xl bg-[conic-gradient(from_0deg,rgba(255,255,255,.2),transparent_30%)]" />
        <div
          className="absolute inset-0 rounded-full border shadow-2xl overflow-hidden"
          style={{
            background: `conic-gradient(${segments
              .map(
                (_, i) =>
                  `hsl(${(i * 360) / Math.max(1, segments.length)} 86% 55%) ${
                    i * base
                  }deg ${(i + 1) * base}deg`
              )
              .join(",")})`,
            transform: `rotate(${angle}deg)`,
            transition: "transform 2.3s cubic-bezier(.16,.85,.12,1)",
          }}
        />
        <div
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,255,255,.55) 0 1deg, transparent 1deg 4.5deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 54%, black 56%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 54%, black 56%)",
            transform: `rotate(${angle}deg)`,
            transition: "transform 2.3s cubic-bezier(.16,.85,.12,1)",
          }}
        />
        {segments.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-start justify-center"
            style={{ transform: `rotate(${i * base + base / 2}deg)` }}
          >
            {s.image ? (
              <img
                src={s.image}
                alt={s.label}
                className="w-14 h-14 object-contain drop-shadow"
              />
            ) : (
              <div
                className="translate-y-8 text-[10px] md:text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-black/35 text-white backdrop-blur border border-white/10"
                style={{ transform: "rotate(-90deg)" }}
              >
                {s.label}
              </div>
            )}
          </div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-background/90 backdrop-blur border shadow-xl ring-1 ring-primary/40 relative">
            <div className="absolute inset-0 flex items-center justify-center text-primary">
              <Crown className="w-9 h-9" />
            </div>
          </div>
        </div>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="w-[2px] h-4 bg-primary/70 mx-auto" />
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-primary rotate-180" />
        </div>
      </motion.div>
      <Button
        size="lg"
        data-spin
        onClick={handle}
        disabled={!segments.length || spin}
        className="px-10 h-12 text-base"
      >
        {spin ? "Đang chọn số" : "Chọn số"}
      </Button>
    </div>
  );
}
