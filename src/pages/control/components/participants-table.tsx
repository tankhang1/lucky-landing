import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import type { Participant } from "@/lib/store";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import CustomerLuckyModal from "./customer-lucky-modal";

export function ParticipantsTable({
  participants,
  code,
}: {
  participants: Participant[];
  code: string;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Participant | null>(
    null
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchPhone = p.phone.toLowerCase().includes(q);
      return matchName || matchPhone;
    });
  }, [query, participants]);

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
                <th className="text-left p-3">Đã chọn số</th>
                <th className="text-left p-3">Số lượt tham gia</th>
                <th className="text-left p-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{p.name ?? "—"}</td>
                    <td className="p-3 font-mono">{p.phone}</td>
                    <td className="p-3 text-center">
                      {p.number_counter ?? "—"}
                    </td>
                    <td className="p-3 text-center">{p.number_get ?? "—"}</td>
                    <td className="p-3 text-center">
                      <Button
                        variant={"outline"}
                        onClick={() => setSelectedCustomer(p)}
                      >
                        <Eye />
                      </Button>
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
      <CustomerLuckyModal
        code={code}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
}
