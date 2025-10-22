import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberMask = (s: string) => s.replace(/[^0-9]/g, "");
export const isSpecial = (val: string) =>
  !!val &&
  (/^(\d)\1+$/.test(val) || /(1234|2345|3456|4567|5678|6789)$/.test(val));
