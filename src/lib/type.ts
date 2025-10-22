// File: lib/draw/types.ts
export type Prize = {
  id: string;
  label: string;
  count: number;
  image?: string;
  tier?: "S" | "A" | "B" | "C";
};
export type ProgramType = "cage" | "online";
export type Program = {
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
export type Winner = {
  id: string;
  name?: string;
  phone: string;
  prizeId: string;
  prizeLabel: string;
  time: string;
  image?: string;
};

export const THEMES = {
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

export const tierBadge: Record<NonNullable<Prize["tier"]>, string> = {
  S: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black",
  A: "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white",
  B: "bg-gradient-to-r from-sky-500 to-indigo-500 text-white",
  C: "bg-slate-200 text-slate-900",
};

export const DEMO_PROGRAMS: Program[] = [
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
