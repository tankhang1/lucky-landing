import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type DigitSelectsProps = {
  value: string;
  digitCount: number;
  onChangeDigitCount: (value: number) => void;
  onChange: (val: string) => void;
  confirmPerDigit?: boolean; // default true
  className?: string;
  labelClass?: string;
  triggerClass?: string;
};

export function DigitSelects({
  value,
  digitCount,
  onChange,
  onChangeDigitCount,
  confirmPerDigit = true,
  className,
  labelClass = "text-[11px] text-neutral-500",
}: DigitSelectsProps) {
  const digits = useMemo(
    () => Array.from({ length: digitCount }, (_, i) => value[i] ?? ""),
    [value, digitCount]
  );

  const handleChange = useCallback(
    (idx: number, v: string) => {
      const nextArr = [...digits];
      nextArr[idx] = v;
      const next = nextArr.join("");
      onChange(next);
    },
    [digits, onChange, confirmPerDigit]
  );

  return (
    <>
      <div className="space-y-3">
        <Label className="text-slate-600">Số lượng chữ số hiển thị</Label>
        <div className="flex gap-2 p-1 bg-slate-100/80 rounded-lg">
          {[3, 4, 5].map((count) => (
            <button
              key={count}
              onClick={() => {
                onChangeDigitCount(count);
                onChange("");
              }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200",
                digitCount === count
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {count} số
            </button>
          ))}
        </div>
      </div>

      <Separator />
      <div
        className={cn(
          "grid w-full gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 items-stretch",
          className
        )}
      >
        {digits.map((d, i) => (
          <div key={i} className="space-y-1 min-w-0">
            <Label className={labelClass}>Số {i + 1}</Label>

            <Input
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
