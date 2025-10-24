import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Participant } from "@/lib/store";
import { useMemo, useState } from "react";
type Winner = {
  id: string;
  time: number;
  prizeLabel: string;
  name?: string;
  phone: string;
  image?: string;
  luckyNumber?: string;
};
function prizeByNumber(winners: Winner[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const w of winners) {
    const num = w.luckyNumber?.toString().trim();
    if (!num) continue;
    if (!map.has(num)) map.set(num, []);
    map.get(num)!.push(w.prizeLabel);
  }
  return map;
}
export function ParticipantsTable({
  participants,
  winners,
}: {
  participants: Participant[];
  winners: Winner[];
}) {
  const [query, setQuery] = useState("");
  const winMap = useMemo(() => prizeByNumber(winners), [winners]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchPhone = p.phone.toLowerCase().includes(q);
      const matchLucky = p.luckies.some((n) => n.includes(q));
      return matchName || matchPhone || matchLucky;
    });
  }, [query, participants]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Participant | null>(null);
  const openFor = (p: Participant) => {
    setSelected(p);
    setOpen(true);
  };

  const preview = (luckies: string[], max = 3) => {
    const head = luckies.slice(0, max);
    const rest = luckies.length - head.length;
    return { head, rest };
  };

  return (
    <>
      {/* Search bar */}
      <div className="flex items-center justify-between mb-2">
        <Input
          placeholder="Tìm theo tên, SĐT, hoặc số may mắn..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          Tổng: {filtered.length}
        </div>
      </div>

      {/* Table */}
      <div className="mt-2 border rounded-xl overflow-hidden bg-card/50">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur">
              <tr>
                <th className="text-left p-3 w-12">#</th>
                <th className="text-left p-3">Họ tên</th>
                <th className="text-left p-3">SĐT</th>
                <th className="text-left p-3">Số may mắn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const { head, rest } = preview(p.luckies);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{p.name ?? "—"}</td>
                    <td className="p-3 font-mono">{p.phone}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {head.map((n) => {
                          const won = winMap.has(n);
                          return (
                            <Badge
                              key={n}
                              variant={won ? "secondary" : "outline"}
                              className={
                                won
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : ""
                              }
                            >
                              {n}
                              {won && ` • ${winMap.get(n)!.join(" + ")}`}
                            </Badge>
                          );
                        })}
                        {rest > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFor(p)}
                          >
                            +{rest}…
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Không tìm thấy kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal hiển thị đầy đủ danh sách số may mắn */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Danh sách số may mắn</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {selected?.name ?? "—"} • {selected?.phone}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(selected?.luckies ?? []).map((n) => {
                const prizes = winMap.get(n);
                const won = !!prizes?.length;
                return (
                  <div
                    key={n}
                    className={`rounded-lg border px-2 py-1.5 flex items-center justify-between ${
                      won ? "bg-amber-50 border-amber-200" : "bg-white"
                    }`}
                  >
                    <span className="font-mono text-sm">{n}</span>
                    {won ? (
                      <span className="text-xs font-medium text-amber-800">
                        {prizes!.join(" + ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
