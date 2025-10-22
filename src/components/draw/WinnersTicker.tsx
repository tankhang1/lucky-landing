"use client";
import type { Winner } from "@/lib/type";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";

export default function WinnersTicker({
  items,
  dot,
}: {
  items: Winner[];
  dot: string;
}) {
  if (!items.length) return null;
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/60">
      <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        className="flex gap-6 whitespace-nowrap p-3 pr-10"
      >
        {[...items, ...items].map((w, i) => (
          <div key={w.id + i} className="text-sm flex items-center gap-3">
            <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
            {w.image ? (
              <img
                src={w.image}
                alt=""
                className="h-5 w-5 rounded object-cover"
              />
            ) : (
              <PartyPopper className="w-4 h-4" />
            )}
            <span className="font-medium">{w.prizeLabel}</span> –{" "}
            {w.name ?? "—"} ({w.phone})
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
