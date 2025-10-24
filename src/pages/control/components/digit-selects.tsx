import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DigitSelectsProps = {
  value: string;
  onChange: (val: string) => void;
  onConfirmDigit?: (idx: number, val: string, next: string) => void; // e.g. showCage(next)
  onConfirmFull?: (val: string) => void; // e.g. showCage(val)
  confirmPerDigit?: boolean; // default true
  className?: string;
  labelClass?: string;
  triggerClass?: string;
};

export function DigitSelects({
  value,
  onChange,
  onConfirmDigit,
  onConfirmFull,
  confirmPerDigit = true,
  className,
  labelClass = "text-[11px] text-neutral-500",
  triggerClass = "h-14",
}: DigitSelectsProps) {
  const digits = useMemo(
    () => Array.from({ length: 5 }, (_, i) => value[i] ?? ""),
    [value]
  );

  const [open, setOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"digit" | "full">("digit");
  const [pending, setPending] = useState<{
    idx: number;
    val: string;
    next: string;
  } | null>(null);

  const handleChange = useCallback(
    (idx: number, v: string) => {
      const nextArr = [...digits];
      nextArr[idx] = v;
      const next = nextArr.join("");
      onChange(next);

      if (confirmPerDigit) {
        setPending({ idx, val: v, next });
        setConfirmType("digit");
        setOpen(true);
      } else if (nextArr.every((d) => d !== "")) {
        setPending({ idx, val: v, next });
        setConfirmType("full");
        setOpen(true);
      }
    },
    [digits, onChange, confirmPerDigit]
  );

  const confirm = () => {
    if (!pending) return;
    if (confirmType === "digit" && onConfirmDigit)
      onConfirmDigit(pending.idx, pending.val, pending.next);
    if (confirmType === "full" && onConfirmFull) onConfirmFull(pending.next);
    setOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "grid w-full gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 items-stretch",
          className
        )}
      >
        {digits.map((d, i) => (
          <div key={i} className="space-y-1 min-w-0">
            <Label className={labelClass}>Số {i + 1}</Label>
            <Select value={d} onValueChange={(v) => handleChange(i, v)}>
              <SelectTrigger
                className={cn(
                  "w-full rounded-lg text-center text-base font-medium tabular-nums",
                  triggerClass
                )}
              >
                <SelectValue placeholder="0" />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="rounded-lg w-[var(--radix-select-trigger-width)] min-w-0"
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <SelectItem key={n} value={String(n)} className="text-base">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmType === "digit"
                ? "Hiển thị số này?"
                : "Hiển thị toàn bộ 5 số?"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {confirmType === "digit"
              ? `Sẽ hiển thị chuỗi hiện tại: ${pending?.next || "—"}`
              : `Chuỗi đầy đủ: ${pending?.next || "—"}`}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirm}>Hiển thị</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
