import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react"; // Assuming you have lucide-react or similar
import { cn } from "@/lib/utils"; // Assuming you have a class merger

function PrizeTicker({
  items,
}: {
  items: { label: string; count: number; image?: string }[];
}) {
  // 1. Flatten the list
  const list = items.flatMap((p) =>
    Array.from({ length: p.count }, () => ({ label: p.label, image: p.image }))
  );

  if (!list.length) return null;

  // 2. Duplicate list enough times to ensure smooth loop (x4 is safer for wide screens)
  const infiniteList = [...list, ...list, ...list, ...list];

  return (
    <div className="absolute bottom-3 w-full h-24 overflow-hidden py-4">
      {/* Background decoration (optional ambient glow) */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Fade masks for the edges */}
      <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(90deg,black,transparent_0%,transparent_95%,black)] bg-gradient-to-r from-white via-transparent to-white" />

      {/* Scrolling Container */}
      <div className="flex items-center h-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
        <motion.div
          className="flex gap-4 pr-4"
          // We move -50% of the list. Adjust logic based on how many duplications you use.
          // Since we quad-uplicated, moving -25% might be smoother, or stick to standard loop logic.
          // Here is a linear infinite scroll:
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: Math.max(100, list.length * 2), // Dynamic speed based on item count
            ease: "linear",
          }}
          style={{ width: "max-content" }}
          whileHover={{ animationPlayState: "paused" }} // Optional: Pause purely via CSS class if preferred
        >
          {infiniteList.map((p, i) => (
            <PrizeCard key={`${i}-${p.label}`} data={p} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Extracted Card Component for cleaner code
const PrizeCard = ({ data }: { data: { label: string; image?: string } }) => (
  <div
    className={cn(
      "group relative flex items-center gap-3 pl-2 pr-6 py-2 h-14",
      "rounded-xl border border-white/40",
      "bg-white/60 ",
      "hover:scale-105 hover:bg-white/80 hover:border-white/80 shadow",
      "transition-all duration-300 ease-out cursor-default"
    )}
  >
    {/* Icon / Image Container */}
    <div className="relative h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center overflow-hidden border border-white/50">
      {data.image ? (
        <img
          src={data.image}
          alt={data.label}
          className="h-full w-full object-cover"
        />
      ) : (
        <Gift className="h-5 w-5 text-amber-500" />
      )}
    </div>

    {/* Text */}
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-indigo-600 transition-colors">
          {data.label}
        </span>
        {/* Optional 'New' or 'Win' badge logic could go here */}
        {!data.image && (
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
        )}
      </div>
    </div>

    {/* Shine Effect on Hover */}
    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
    </div>
  </div>
);

export default PrizeTicker;
