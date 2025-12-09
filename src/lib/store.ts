import { create } from "zustand";
import { type Prize, type Winner } from "./type";
import type { TCampaign } from "@/react-query/services/campaign/campaign.service";

export type Participant = {
  id: string;
  name?: string;
  phone: string;
  number_counter: number;
  number_get: number;
};

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

export type DrawState = {
  programs: TCampaign[];
  programId: number;
  prizes: Prize[];
  participants: Participant[];
  winners: Winner[];
  running: boolean;
  cageDisplay: string;
  cageHistory: string[];
};

export type DrawActions = {
  setProgram: (programs: TCampaign[]) => void;
  setProgramId: (id: number) => void;
  addPrize: (p: Omit<Prize, "id">) => void;
  removePrize: (id: string) => void;
  addParticipant: (p: Omit<Participant, "id">) => void;
  drawByRandom: () => Winner | null;
  wheelStopAt: (i: number) => Winner | null;
  resetCage: () => void;
  showCage: (n: string) => void;
  showHistoryCage: (n: string) => void;
};

export const useDrawStore = create<DrawState & DrawActions>((set, get) => ({
  programs: [],
  programId: -1,
  prizes: samplePrizes,
  participants: [],
  winners: [],
  running: false,
  cageDisplay: "",
  cageHistory: [],
  setProgram: (programs) => set({ programs: programs }),
  setProgramId: (id) => set({ programId: id }),
  addPrize: (p) =>
    set((s) => ({ prizes: [...s.prizes, { ...p, id: crypto.randomUUID() }] })),
  removePrize: (id) =>
    set((s) => ({ prizes: s.prizes.filter((x) => x.id !== id) })),
  addParticipant: (p) =>
    set((s) => ({
      participants: [...s.participants, { ...p, id: crypto.randomUUID() }],
    })),

  drawByRandom: () => {
    const s = get();
    if (s.running || !s.prizes.length) return null;
    const pool = s.participants.filter(
      (p) => !s.winners.some((w) => w.phone === p.phone)
    );
    if (!pool.length) return null;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const prize = s.prizes[0];
    const record: Winner = {
      id: crypto.randomUUID(),
      name: pick.name,
      phone: pick.phone,
      prizeId: prize.id,
      prizeLabel: prize.label,
      time: new Date().toISOString(),
      image: prize.image,
      luckyNumber: Math.floor(Math.random() * 10000),
    };
    set({ winners: [record, ...s.winners], prizes: s.prizes.slice(1) });
    return record;
  },

  wheelStopAt: (i) => {
    const s = get();
    const prize = s.prizes[i];
    const pool = s.participants.filter(
      (p) => !s.winners.some((w) => w.phone === p.phone)
    );
    if (!prize || !pool.length) return null;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const record: Winner = {
      id: crypto.randomUUID(),
      name: pick.name,
      phone: pick.phone,
      prizeId: prize.id,
      prizeLabel: prize.label,
      time: new Date().toISOString(),
      image: prize.image,
      luckyNumber: Math.floor(Math.random() * 10000),
    };
    const list = [...s.prizes];
    if (list[i].count > 1) list[i] = { ...list[i], count: list[i].count - 1 };
    else list.splice(i, 1);
    set({ winners: [record, ...s.winners], prizes: list });
    return record;
  },

  resetCage: () => set({ cageDisplay: "", cageHistory: [] }),
  showCage: (n: string) =>
    set(() => ({
      cageDisplay: n,
    })),
  showHistoryCage: (n: string) =>
    set((pre) => ({
      cageHistory: [...pre.cageHistory, n],
    })),
}));
