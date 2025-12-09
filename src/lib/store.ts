import { create } from "zustand";
import { type Winner } from "./type";
import type {
  TCampaign,
  TCampaignGift,
} from "@/react-query/services/campaign/campaign.service";

export type Participant = {
  id: string;
  name?: string;
  phone: string;
  number_counter: number;
  number_get: number;
};

export type DrawState = {
  programs: TCampaign[];
  programId: number;
  prizes: TCampaignGift[];
  participants: Participant[];
  winners: Winner[];
  running: boolean;
  cageDisplay: string;
  cageHistory: string[];
};

export type DrawActions = {
  setProgram: (programs: TCampaign[]) => void;
  setProgramId: (id: number) => void;
  setPrize: (prizes: TCampaignGift[]) => void;
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
  prizes: [],
  participants: [],
  winners: [],
  running: false,
  cageDisplay: "",
  cageHistory: [],
  setProgram: (programs) => set({ programs: programs }),
  setProgramId: (id) => set({ programId: id }),
  setPrize: (prizes) => set({ prizes: prizes }),
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
      prizeId: prize.id.toString(),
      prizeLabel: prize.gift_image,
      time: new Date().toISOString(),
      image: prize.gift_image,
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
      prizeId: prize.id.toString(),
      prizeLabel: prize.gift_name,
      time: new Date().toISOString(),
      image: prize.gift_image,
      luckyNumber: Math.floor(Math.random() * 10000),
    };
    const list = [...s.prizes];
    if (list[i].counter > 1)
      list[i] = { ...list[i], counter: list[i].counter - 1 };
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
