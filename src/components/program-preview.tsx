// src/components/program/ProgramPreview.tsx
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type Program = {
  id: string;
  title: string;
  code?: string;
  status: "open" | "upcoming" | "closed";
  banner?: string;
  desc?: string;
  start?: string;
  end?: string;
  location?: string;
  rules?: string[];
  greeting?: string;
};

export function ProgramStatusBadge({ status }: { status: Program["status"] }) {
  return (
    <Badge
      variant={
        status === "open"
          ? "default"
          : status === "upcoming"
          ? "secondary"
          : "outline"
      }
    >
      {status === "open"
        ? "Đang bật"
        : status === "upcoming"
        ? "Sắp diễn ra"
        : "Đã kết thúc"}
    </Badge>
  );
}

export default function ProgramPreview({
  open,
  onOpenChange,
  program,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  program: Program | null;
}) {
  const duration = useMemo(() => {
    if (!program) return "";
    const s = program.start
      ? new Date(program.start).toLocaleDateString()
      : "—";
    const e = program.end ? new Date(program.end).toLocaleDateString() : "—";
    return `${s} → ${e}`;
  }, [program]);

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[760px]">
        {program.banner ? (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
            <img
              src={program.banner}
              alt={program.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <ProgramStatusBadge status={program.status} />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <ProgramStatusBadge status={program.status} />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-xl sm:text-2xl">
              {program.title}
            </DialogTitle>
            {program.code ? (
              <div className="text-xs text-muted-foreground mt-1">
                Mã: {program.code}
              </div>
            ) : null}
          </DialogHeader>

          {program.greeting ? (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs">
                {program.greeting}
              </span>
            </div>
          ) : null}

          {program.desc ? (
            <p className="mt-3 text-sm leading-relaxed">{program.desc}</p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="opacity-70">Thời gian</div>
            <div className="font-medium">{duration}</div>
            <div className="opacity-70">Địa điểm</div>
            <div className="font-medium">{program.location ?? "—"}</div>
          </div>

          {program.rules?.length ? (
            <>
              <Separator className="my-4" />
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {program.rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2 justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Xem chi tiết
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Mở Control
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Mở Audience
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
