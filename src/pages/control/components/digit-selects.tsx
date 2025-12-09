import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TCampaignGift } from "@/react-query/services/campaign/campaign.service";

type DigitSelectsProps = {
  value: string;
  digitCount: number;
  onChangeDigitCount: (value: number) => void;
  onChange: (val: string) => void;
  confirmPerDigit?: boolean; // default true
  className?: string;
  labelClass?: string;
  triggerClass?: string;
  prizes: TCampaignGift[];
  selectedPrizeId: string;
  onPrizeChange: (id: string) => void;
};

export function DigitSelects({
  value,
  digitCount,
  onChange,
  onChangeDigitCount,
  confirmPerDigit = true,
  className,
  labelClass = "text-[11px] text-neutral-500",
  prizes,
  selectedPrizeId,
  onPrizeChange,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-600 font-semibold text-xs uppercase tracking-wider">
            Giải thưởng
          </Label>
          <Select value={selectedPrizeId} onValueChange={onPrizeChange}>
            <SelectTrigger className="w-full h-10 bg-white border-slate-200">
              <SelectValue placeholder="Chọn giải..." />
            </SelectTrigger>
            <SelectContent>
              {prizes.map((p) => (
                <SelectItem key={p.gift_code} value={p.gift_code.toString()}>
                  {p.gift_name} (SL: {p.counter}/{p.limits})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-semibold text-xs uppercase tracking-wider">
            Số ô hiển thị
          </Label>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            {[3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => {
                  onChangeDigitCount(count);
                  onChange(""); // Clear input on mode change
                }}
                className={cn(
                  "flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  digitCount === count
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {count}
              </button>
            ))}
          </div>
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
