import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown,
  Keyboard,
  Maximize2,
  Minimize2,
  PartyPopper,
  Settings,
  Shuffle,
  Sparkles,
  Users,
} from "lucide-react";
import FlipNumbers from "react-flip-numbers";
import confetti from "canvas-confetti";

type Prize = {
  id: string;
  label: string;
  count: number;
  image?: string;
  tier?: "S" | "A" | "B" | "C";
};
type ProgramType = "cage" | "online";
type Program = {
  id: string;
  code: string;
  title: string;
  type: ProgramType;
  status: "open" | "upcoming" | "closed";
  banner?: string;
  description?: string;
  rules?: string[];
  theme?: keyof typeof THEMES;
};
type Winner = {
  id: string;
  name?: string;
  phone: string;
  prizeId: string;
  prizeLabel: string;
  time: string;
  image?: string;
};

const THEMES = {
  tet: {
    pageBg:
      "bg-[radial-gradient(85%_70%_at_50%_-10%,rgba(244,63,94,.18),transparent_60%)]",
    header: "from-rose-50 via-amber-50 to-yellow-50",
    title:
      "bg-[conic-gradient(at_50%_50%,#ef4444_0%,#f59e0b_35%,#facc15_70%,#ef4444_100%)]",
    dot: "bg-amber-500",
  },
  showroom: {
    pageBg:
      "bg-[radial-gradient(85%_70%_at_50%_-10%,rgba(251,146,60,.18),transparent_60%)]",
    header: "from-amber-50 via-orange-50 to-rose-50",
    title:
      "bg-[conic-gradient(at_50%_50%,#fb923c_0%,#f97316_35%,#ef4444_70%,#fb923c_100%)]",
    dot: "bg-orange-500",
  },
  ocean: {
    pageBg:
      "bg-[radial-gradient(85%_70%_at_50%_-10%,rgba(56,189,248,.18),transparent_60%)]",
    header: "from-sky-50 via-cyan-50 to-emerald-50",
    title:
      "bg-[conic-gradient(at_50%_50%,#06b6d4_0%,#0ea5e9_35%,#10b981_70%,#06b6d4_100%)]",
    dot: "bg-sky-500",
  },
} as const;

const DEMO_PROGRAMS: Program[] = [
  {
    id: "p1",
    code: "TET2025",
    title: "Tết 2025 – Lì xì vui vẻ",
    type: "online",
    status: "open",
    banner:
      "https://inhoalong.vn/wp-content/uploads/2024/12/mau-li-xi-tet-con-ran-2025.jpg",
    description:
      "Tri ân khách hàng dịp Tết 2025. Quay số nhận e-voucher và quà Tết.",
    rules: ["Mỗi SĐT có số lượt quay được cấp", "Giải không quy đổi tiền mặt"],
    theme: "tet",
  },
  {
    id: "p2",
    code: "SHOWROOM",
    title: "Khai trương Showroom – Lồng cầu",
    type: "cage",
    status: "open",
    banner:
      "https://thietbivesinhcotto.vn/wp-content/uploads/2025/08/hai-linh-ha-dong.jpg",
    description:
      "Sự kiện tại điểm bán. MC quay lồng cầu, nhập số hiển thị màn hình lớn.",
    rules: ["Kết quả công bố tại sân khấu là cuối cùng"],
    theme: "showroom",
  },
  {
    id: "p3",
    code: "SUMMER2025",
    title: "Summer Splash 2025",
    type: "online",
    status: "upcoming",
    banner:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDZy_7jtXoBNsBFewPAvaus0KLDYs-j7k5Q&s",
    description: "Quay online xuyên hè cùng quà công nghệ.",
    theme: "ocean",
  },
];

const numberMask = (s: string) => s.replace(/[^0-9]/g, "");
const tierBadge: Record<NonNullable<Prize["tier"]>, string> = {
  S: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black",
  A: "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white",
  B: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white",
  C: "bg-slate-200 text-slate-900",
};

function SpinWheel({
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
        {spin ? "Đang quay…" : "Quay vòng"}
      </Button>
    </div>
  );
}

function Fullscreen({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fs, setFs] = useState(false);
  const toggle = async () => {
    if (!document.fullscreenElement) {
      await ref.current?.requestFullscreen();
      setFs(true);
    } else {
      await document.exitFullscreen();
      setFs(false);
    }
  };
  return (
    <div ref={ref} className="relative h-screen">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute right-3 top-3 z-10"
      >
        {fs ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </Button>
      {children}
    </div>
  );
}

function WinnersTicker({ items, dot }: { items: Winner[]; dot: string }) {
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

function ProgramInfo({
  program,
  themeKey,
}: {
  program?: Program;
  themeKey: keyof typeof THEMES;
}) {
  if (!program) return null;
  return (
    <Card className="overflow-hidden border-0 shadow-lg ring-2 ring-primary/20">
      <div className="grid lg:grid-cols-[380px_1fr]">
        <div className="relative">
          {program.banner ? (
            <img
              src={program.banner}
              alt={program.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant={
                program.status === "open"
                  ? "default"
                  : program.status === "upcoming"
                  ? "secondary"
                  : "outline"
              }
            >
              {program.status}
            </Badge>
            <Badge variant="outline">{program.code}</Badge>
            <Badge>{program.type === "cage" ? "Lồng cầu" : "Online"}</Badge>
          </div>
          <div
            className={`text-2xl font-extrabold bg-clip-text text-transparent ${THEMES[themeKey].title}`}
          >
            {program.title}
          </div>
          {program.description ? (
            <CardDescription className="mt-1">
              {program.description}
            </CardDescription>
          ) : null}
          {program.rules?.length ? (
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {program.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function LandingPage() {
  const [programId, setProgramId] = useState(DEMO_PROGRAMS[0].id);
  const [view, setView] = useState<"control" | "audience">("control");
  const [signedIn, setSignedIn] = useState(false);

  const samplePrizes: Prize[] = [
    {
      id: crypto.randomUUID(),
      label: "Xe máy Honda SH",
      count: 1,
      image:
        "https://cdn.honda.com.vn/motorbikes/November2024/sYTCNfgI5E0JUJ8BCTQ3.png",
      tier: "S",
    },
    {
      id: crypto.randomUUID(),
      label: "iPhone 16 Pro Max",
      count: 1,
      image:
        "https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-6.png",
      tier: "S",
    },
    {
      id: crypto.randomUUID(),
      label: "TV Samsung 65”",
      count: 2,
      image:
        "https://cdnv2.tgdd.vn/mwg-static/dmx/Products/Images/1942/322686/smart-tivi-samsung-4k-55-inch-ua55du8000-1-638696219955356962-700x467.jpg",
      tier: "A",
    },
    {
      id: crypto.randomUUID(),
      label: "MacBook Air M3",
      count: 2,
      image:
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90",
      tier: "A",
    },
    {
      id: crypto.randomUUID(),
      label: "Apple Watch S10",
      count: 3,
      image:
        "https://cdn.tgdd.vn/Products/Images/7077/329155/s16/apple-watch-s10-den-tb-650x650.png",
      tier: "B",
    },
    {
      id: crypto.randomUUID(),
      label: "AirPods 4",
      count: 5,
      image:
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/og-airpods-4-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1724144134014",
      tier: "B",
    },
    {
      id: crypto.randomUUID(),
      label: "Voucher du lịch 5.000.000đ",
      count: 6,
      tier: "B",
    },
    {
      id: crypto.randomUUID(),
      label: "Thẻ quà tặng 1.000.000đ",
      count: 10,
      tier: "C",
    },
    { id: crypto.randomUUID(), label: "Bình giữ nhiệt", count: 20, tier: "C" },
    { id: crypto.randomUUID(), label: "Áo thun kỷ niệm", count: 30, tier: "C" },
  ];

  const sampleParticipants = Array.from({ length: 80 }).map((_, i) => {
    const names = [
      "Nguyễn An",
      "Trần Bình",
      "Lê Chi",
      "Phạm Dũng",
      "Võ Em",
      "Bùi Gia",
      "Đoàn Hà",
      "Hồ Khang",
      "Phan Linh",
      "Đặng Minh",
      "Đỗ Ngân",
      "Huỳnh Phúc",
      "Lý Quân",
      "Trịnh Sơn",
      "Tạ Trâm",
      "Phùng Uyên",
      "Cao Vy",
      "Đinh Yến",
    ];
    const name = names[i % names.length] + " " + (i + 1);
    const phone = "09" + String(10000000 + i * 317).slice(0, 8);
    const count = Math.floor(Math.random() * 5) + 1;
    return { id: crypto.randomUUID(), name, phone, count };
  });

  const [prizes, setPrizes] = useState<Prize[]>(samplePrizes);
  const [participants, setParticipants] = useState(sampleParticipants);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [running, setRunning] = useState(false);

  const [newPrize, setNewPrize] = useState<Prize>({
    id: "_new",
    label: "",
    count: 1,
    tier: "C",
    image: "",
  });
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");

  const [cageInput, setCageInput] = useState("");
  const [cageDisplay, setCageDisplay] = useState("");
  const [cageHistory, setCageHistory] = useState<string[]>([]);

  const currentProgram = useMemo(
    () => DEMO_PROGRAMS.find((p) => p.id === programId),
    [programId]
  );
  const themeKey = currentProgram?.theme ?? "tet";
  const isCage = currentProgram?.type === "cage";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        const btn = document.querySelector<HTMLButtonElement>(
          "button:has(svg[class*='maximize']),button:has(svg[class*='minimize'])"
        );
        btn?.click();
      }
      if (!isCage) {
        if (e.code === "Space") {
          e.preventDefault();
          drawByRandom();
        }
        if (e.key.toLowerCase() === "w") {
          e.preventDefault();
          document
            .querySelector<HTMLButtonElement>("button[data-spin]")
            ?.click();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCage, prizes, participants, winners, running]);

  const addPrize = () => {
    if (!newPrize.label.trim() || newPrize.count <= 0) return;
    setPrizes((v) => [
      ...v,
      {
        id: crypto.randomUUID(),
        label: newPrize.label.trim(),
        count: Math.floor(newPrize.count),
        tier: newPrize.tier ?? "C",
        image: newPrize.image || undefined,
      },
    ]);
    setNewPrize({ id: "_new", label: "", count: 1, tier: "C", image: "" });
  };
  const removePrize = (id: string) =>
    setPrizes((v) => v.filter((p) => p.id !== id));
  const addParticipant = () => {
    const phone = numberMask(pPhone);
    if (!phone) return;
    setParticipants((v) => [
      { id: crypto.randomUUID(), name: pName.trim() || undefined, phone },
      ...v,
    ]);
    setPName("");
    setPPhone("");
  };

  const drawByRandom = () => {
    if (running) return;
    const pool = participants.filter(
      (p) => !winners.some((w) => w.phone === p.phone)
    );
    if (!pool.length || !prizes.length) return;
    setRunning(true);
    setTimeout(() => {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const prize = prizes[0];
      const record: Winner = {
        id: crypto.randomUUID(),
        name: pick.name,
        phone: pick.phone,
        prizeId: prize.id,
        prizeLabel: prize.label,
        time: new Date().toISOString(),
        image: prize.image,
      };
      setWinners((v) => [record, ...v]);
      confetti({ particleCount: 180, spread: 95, origin: { y: 0.28 } });
      setPrizes((v) => v.slice(1));
      setRunning(false);
    }, 850);
  };

  const onWheelStop = (i: number) => {
    const prize = prizes[i];
    const pool = participants.filter(
      (p) => !winners.some((w) => w.phone === p.phone)
    );
    if (!prize || !pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const record: Winner = {
      id: crypto.randomUUID(),
      name: pick.name,
      phone: pick.phone,
      prizeId: prize.id,
      prizeLabel: prize.label,
      time: new Date().toISOString(),
      image: prize.image,
    };
    setWinners((v) => [record, ...v]);
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.28 } });
    setPrizes((v) => {
      const list = [...v];
      if (list[i].count > 1) list[i] = { ...list[i], count: list[i].count - 1 };
      else list.splice(i, 1);
      return list;
    });
  };

  const isSpecial = (val: string) =>
    !!val &&
    (/^(\d)\1+$/.test(val) || /(1234|2345|3456|4567|5678|6789)$/.test(val));

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`min-h-screen ${THEMES[themeKey].pageBg}`}>
      <header className="sticky top-0 z-20 border-b bg-gradient-to-r from-white/70 to-white/70 backdrop-blur">
        <div
          className={`h-0.5 w-full bg-gradient-to-r ${THEMES[themeKey].header}`}
        />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
            <Sparkles className="h-5 w-5" />
            Lucky Draw
          </div>
          <div className="flex items-center gap-3">
            <Select value={programId} onValueChange={setProgramId}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Chọn chương trình" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_PROGRAMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          p.status === "open"
                            ? "default"
                            : p.status === "upcoming"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                      <span>{p.title}</span>
                      <Badge variant="outline">
                        {p.type === "cage" ? "Lồng cầu" : "Online"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={view} onValueChange={(v) => setView(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="control">Control</SelectItem>
                <SelectItem value="audience">Audience</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <Keyboard className="w-4 h-4" />
                  Hotkeys
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                {!isCage && (
                  <DropdownMenuItem>Space – Quay Random</DropdownMenuItem>
                )}
                {!isCage && <DropdownMenuItem>W – Quay Wheel</DropdownMenuItem>}
                <DropdownMenuItem>F – Fullscreen (Audience)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setSignedIn((v) => !v)}>
              {signedIn ? "Đăng xuất" : "Đăng nhập"}
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lucky Draw
      </footer>
    </div>
  );

  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProgramInfo program={currentProgram} themeKey={themeKey as any} />

        <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-gradient-to-b from-card to-background">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-3xl">
                {isCage ? "Lồng cầu" : "Quay online"}
              </CardTitle>
              <CardDescription>
                {isCage
                  ? "Control nhập số, Audience hiển thị số lớn."
                  : "Control quay số; Audience xem ticker và danh sách trúng."}
              </CardDescription>
            </div>

            {!isCage && (
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Cấu hình giải
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[760px]">
                    <DialogHeader>
                      <DialogTitle>Giải thưởng</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        <div className="md:col-span-3">
                          <Label>Tên giải</Label>
                          <Input
                            value={newPrize.label}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                label: e.target.value,
                              }))
                            }
                            placeholder="VD: Giải Nhất"
                          />
                        </div>
                        <div>
                          <Label>Số lượng</Label>
                          <Input
                            type="number"
                            min={1}
                            value={newPrize.count}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                count: Number(e.target.value || 1),
                              }))
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Ảnh (URL)</Label>
                          <Input
                            value={newPrize.image ?? ""}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                image: e.target.value,
                              }))
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Cấp</Label>
                          <Select
                            value={newPrize.tier ?? "C"}
                            onValueChange={(v) =>
                              setNewPrize((p) => ({
                                ...p,
                                tier: v as Prize["tier"],
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addPrize}>Thêm</Button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prizes.map((pr) => (
                          <Card
                            key={pr.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {pr.label}
                                </CardTitle>
                                <Badge className={tierBadge[pr.tier ?? "C"]}>
                                  x{pr.count}
                                </Badge>
                              </div>
                            </CardHeader>
                            {pr.image && (
                              <CardContent className="pt-0">
                                <img
                                  src={pr.image}
                                  alt={pr.label}
                                  className="h-28 w-full object-cover rounded-md"
                                />
                              </CardContent>
                            )}
                            <CardFooter>
                              <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => removePrize(pr.id)}
                              >
                                Xóa
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary">Lưu</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={drawByRandom}
                  disabled={!participants.length || !prizes.length || running}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Quay số
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {view === "control" ? (
              <Tabs
                defaultValue={isCage ? "stage" : "participants"}
                className="w-full"
              >
                {!isCage && (
                  <TabsList>
                    <TabsTrigger
                      value="participants"
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Người tham gia
                    </TabsTrigger>
                    <TabsTrigger value="winners">Danh sách trúng</TabsTrigger>
                  </TabsList>
                )}

                {isCage ? (
                  <TabsContent value="stage" className="mt-0">
                    <div className="grid xl:grid-cols-3 gap-6">
                      <Card className="xl:col-span-2">
                        <CardHeader>
                          <CardTitle>Nhập số lồng cầu</CardTitle>
                          <CardDescription>
                            Nhập số và bấm “Hiển thị”.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <Label>Số</Label>
                              <Input
                                value={cageInput}
                                onChange={(e) =>
                                  setCageInput(
                                    numberMask(e.target.value).slice(0, 12)
                                  )
                                }
                                placeholder="028736…"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                onClick={() => {
                                  setCageDisplay(cageInput);
                                  setCageHistory((h) =>
                                    [cageInput, ...h].slice(0, 10)
                                  );
                                }}
                                disabled={!cageInput}
                              >
                                Hiển thị
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setCageDisplay("")}
                              >
                                Xóa Audience
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm">
                            {isSpecial(cageInput) ? (
                              <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 font-medium">
                                Số đặc biệt
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Nhập số hợp lệ.
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Tóm tắt</CardTitle>
                          <CardDescription>
                            {currentProgram?.title}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Đang hiển thị</span>
                            <span
                              className={`font-extrabold ${
                                isSpecial(cageDisplay) ? "text-amber-600" : ""
                              }`}
                            >
                              {cageDisplay || "—"}
                            </span>
                          </div>
                          <Separator />
                          <div className="font-medium">Lịch sử gần nhất</div>
                          <div className="flex flex-wrap gap-2">
                            {cageHistory.length ? (
                              cageHistory.map((n, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded border ${
                                    isSpecial(n)
                                      ? "bg-amber-50 border-amber-300 text-amber-800"
                                      : "bg-muted/50"
                                  }`}
                                >
                                  {n}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                Chưa có
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setWinners([]);
                              setCageDisplay("");
                              setCageHistory([]);
                            }}
                          >
                            Làm mới
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                ) : (
                  <>
                    <TabsContent value="participants" className="mt-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label>Họ tên</Label>
                              <Input
                                defaultValue={pName}
                                placeholder="Tuỳ chọn"
                              />
                            </div>
                            <div>
                              <Label>Số điện thoại</Label>
                              <Input
                                defaultValue={pPhone}
                                placeholder="09xxxxxxxx"
                              />
                            </div>
                            <div>
                              <Label>Số lượt quay</Label>
                              <Input
                                defaultValue={pName}
                                type="number"
                                placeholder="Tuỳ chọn"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                onClick={addParticipant}
                                className="w-full"
                              >
                                Thêm
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 border rounded-xl overflow-hidden bg-card/50">
                            <div className="max-h-80 overflow-auto">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                                  <tr>
                                    <th className="text-left p-3 w-12">#</th>
                                    <th className="text-left p-3">Họ tên</th>
                                    <th className="text-left p-3">SĐT</th>
                                    <th className="text-left p-3">
                                      Số lượt quay
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {participants.map((p, idx) => (
                                    <tr key={p.id} className="border-t">
                                      <td className="p-3">{idx + 1}</td>
                                      <td className="p-3">{p.name ?? "—"}</td>
                                      <td className="p-3 font-mono">
                                        {p.phone}
                                      </td>
                                      <td className="p-3">{p.count}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Card className="bg-card/60">
                            <CardHeader>
                              <CardTitle className="text-base">
                                Tóm tắt
                              </CardTitle>
                              <CardDescription>
                                {currentProgram?.title}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Người tham gia</span>
                                <span className="font-semibold">
                                  {participants.length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tổng giải</span>
                                <span className="font-semibold">
                                  {prizes.reduce((a, b) => a + b.count, 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Đã trúng</span>
                                <span className="font-semibold">
                                  {winners.length}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="stage" className="mt-4">
                      <div className="grid lg:grid-cols-2 gap-6">
                        <Card className="overflow-hidden">
                          <CardHeader>
                            <CardTitle>Spin Wheel</CardTitle>
                            <CardDescription>
                              Vòng quay theo số lượng giải
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <SpinWheel segments={prizes} onStop={onWheelStop} />
                          </CardContent>
                        </Card>
                        <Card className="overflow-hidden">
                          <CardHeader>
                            <CardTitle>Random số</CardTitle>
                            <CardDescription>
                              Chọn ngẫu nhiên từ người tham gia
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-col items-center gap-6">
                              <FlipNumbers
                                height={40}
                                width={40}
                                color="black"
                                background="white"
                                play
                                perspective={700}
                                duration={30}
                                numbers={"100000"}
                                numberClassName="mt-1 text-5xl font-extrabold tracking-tight"
                              />
                              <Button
                                onClick={drawByRandom}
                                disabled={
                                  !participants.length ||
                                  !prizes.length ||
                                  running
                                }
                                className="px-10 h-12 text-base"
                              >
                                <Shuffle className="w-4 h-4 mr-2" />
                                Quay số
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="mt-6">
                        <WinnersTicker
                          items={winners}
                          dot={THEMES[themeKey].dot}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="winners" className="mt-4">
                      <div className="border rounded-xl overflow-hidden bg-card/50">
                        <div className="max-h-96 overflow-auto">
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
                                <tr key={w.id} className="border-t">
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
                              {!winners.length && (
                                <tr>
                                  <td
                                    className="p-6 text-center text-muted-foreground"
                                    colSpan={6}
                                  >
                                    Chưa có người trúng
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            ) : (
              <Fullscreen>
                <div className="h-screen flex justify-center flex-col relative bg-white">
                  <div className="relative p-6 md:p-10 grid lg:grid-cols-2 gap-8 items-start">
                    {isCage ? (
                      <div className="col-span-2 flex flex-col items-center gap-6">
                        <FlipNumbers
                          height={70}
                          width={56}
                          color="black"
                          background="white"
                          play
                          perspective={700}
                          duration={30}
                          numbers={cageDisplay || "------"}
                          numberClassName="font-black"
                        />
                        <div className="text-center text-muted-foreground">
                          Đang chờ số từ màn Control…
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-6">
                          <div className="pointer-events-none">
                            <SpinWheel segments={prizes} onStop={() => {}} />
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
                          <div className="rounded-2xl border p-6 bg-card/60">
                            {winners[0] ? (
                              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                                <div>
                                  {winners[0].image ? (
                                    <img
                                      src={winners[0].image}
                                      className="h-24 w-24 rounded-xl object-cover ring-2 ring-primary/40"
                                    />
                                  ) : (
                                    <div className="h-24 w-24 rounded-xl bg-muted" />
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-lg">
                                  <div className="opacity-70">Giải</div>
                                  <div className="font-semibold">
                                    {winners[0].prizeLabel}
                                  </div>
                                  <div className="opacity-70">Tên</div>
                                  <div className="font-semibold">
                                    {winners[0].name ?? "—"}
                                  </div>
                                  <div className="opacity-70">SĐT</div>
                                  <div className="font-mono">
                                    {winners[0].phone}
                                  </div>
                                  <div className="opacity-70">Thời gian</div>
                                  <div>
                                    {new Date(winners[0].time).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                Chưa có kết quả
                              </div>
                            )}
                          </div>
                          <WinnersTicker
                            items={winners}
                            dot={THEMES[themeKey].dot}
                          />
                          <div className="border rounded-xl overflow-hidden bg-card/50">
                            <div className="max-h-[44vh] overflow-auto">
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
                                    <tr key={w.id} className="border-t">
                                      <td className="p-3">{idx + 1}</td>
                                      <td className="p-3">
                                        {new Date(w.time).toLocaleString()}
                                      </td>
                                      <td className="p-3 font-medium">
                                        {w.prizeLabel}
                                      </td>
                                      <td className="p-3">{w.name ?? "—"}</td>
                                      <td className="p-3 font-mono">
                                        {w.phone}
                                      </td>
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
                      </>
                    )}
                  </div>
                </div>
              </Fullscreen>
            )}
          </CardContent>
        </Card>
      </main>
    </Shell>
  );
}
