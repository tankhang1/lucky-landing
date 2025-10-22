"use client";
import Shell from "@/components/draw/Shell";
import ProgramInfo from "@/components/draw/ProgramInfo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useMemo, useState } from "react";
import { useSyncAcrossTabs } from "@/lib/sync";
import { useDrawStore } from "@/lib/store";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";
import { isSpecial } from "@/lib/utils";

export default function CageControlPage() {
  useSyncAcrossTabs("control");
  const programId = useDrawStore((s) => s.programId);
  const program = useMemo(
    () => DEMO_PROGRAMS.find((p) => p.id === programId),
    [programId]
  );
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;

  const cageDisplay = useDrawStore((s) => s.cageDisplay);
  const cageHistory = useDrawStore((s) => s.cageHistory);
  const showCage = useDrawStore((s) => s.showCage);
  const resetCage = useDrawStore((s) => s.resetCage);

  const [input, setInput] = useState("");

  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProgramInfo program={program} themeKey={themeKey} />
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Nhập số lồng cầu</CardTitle>
              <CardDescription>
                Nhập số rồi Enter hoặc bấm “Hiển thị”.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label>Số</Label>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!input.trim()) return;
                        showCage(input.trim());
                        setInput("");
                      }
                    }}
                    placeholder="028736…"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => {
                      if (!input.trim()) return;
                      showCage(input.trim());
                      setInput("");
                    }}
                  >
                    Hiển thị
                  </Button>
                  <Button variant="secondary" onClick={() => showCage("")}>
                    Xóa Audience
                  </Button>
                </div>
              </div>
              <div className="text-sm">
                {isSpecial(input) ? (
                  <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 font-medium">
                    Số đặc biệt
                  </span>
                ) : (
                  <span className="text-muted-foreground">Nhập số hợp lệ.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
              <CardDescription>{program?.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Đang hiển thị</span>
                <span
                  className={`font-extrabold ${
                    isSpecial(cageDisplay) ? "text-amber-600" : ""
                  }`}
                >
                  {cageDisplay || "—"}
                </span>
              </div>
              <Separator />
              <div className="font-medium">Lịch sử gần nhất</div>
              <div className="flex flex-wrap gap-2">
                {cageHistory.length ? (
                  cageHistory.map((n, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded border ${
                        isSpecial(n)
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : "bg-muted/50"
                      }`}
                    >
                      {n}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Chưa có</span>
                )}
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button variant="secondary" onClick={resetCage}>
                Làm mới
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </Shell>
  );
}
