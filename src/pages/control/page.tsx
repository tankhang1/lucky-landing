"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Shell from "@/components/draw/Shell";
import ProgramInfo from "@/components/draw/ProgramInfo";
import WinnersTicker from "@/components/draw/WinnersTicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import confetti from "canvas-confetti";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";
import { useDrawStore } from "@/lib/store";
import { isSpecial } from "@/lib/utils";
import { ParticipantsTable } from "./components/participants-table";
import { DigitSelects } from "./components/digit-selects";

type Participant = { id: string; name?: string; phone: string; count: number };

function CagePreview({ value, size = 40 }: { value: string; size?: number }) {
  const digits = useMemo(
    () => Array.from({ length: 5 }, (_, i) => value[i] ?? "–"),
    [value]
  );
  return (
    <div className="rounded-xl border bg-neutral-50/60 p-3">
      <div className="text-[11px] text-neutral-500 mb-2">Xem trước</div>
      <div className="flex items-center gap-2">
        {digits.map((d, i) => (
          <div
            key={i}
            className="grid place-items-center rounded-lg border bg-white text-base font-semibold tabular-nums"
            style={{ width: size, height: size }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  display,
  history,
}: {
  title?: string;
  display: string;
  history: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tóm tắt</CardTitle>
        <CardDescription className="text-sm truncate">{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border p-3">
          <span className="text-sm text-neutral-600">Đang hiển thị</span>
          <span
            className={`text-lg tabular-nums font-extrabold ${
              isSpecial(display) ? "text-amber-600" : "text-neutral-900"
            }`}
          >
            {display || "—"}
          </span>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Lịch sử gần nhất</div>
          <div className="flex flex-wrap gap-1.5">
            {history.length ? (
              history.map((n, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-lg border text-xs tabular-nums ${
                    isSpecial(n)
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-700"
                  }`}
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Chưa có</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ControlPage() {
  const programId = useDrawStore((s) => s.programId);
  const program = DEMO_PROGRAMS.find((p) => p.id === programId);
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;
  const isCage = program?.type === "cage";

  const prizes = useDrawStore((s) => s.prizes);
  const participants = useDrawStore((s) => s.participants) as Participant[];
  const winners = useDrawStore((s) => s.winners);
  const drawByRandom = useDrawStore((s) => s.drawByRandom);
  const showCage = useDrawStore((s) => s.showCage);
  const showHistoryCage = useDrawStore((s) => s.showHistoryCage);
  const cageDisplay = useDrawStore((s) => s.cageDisplay);
  const cageHistory = useDrawStore((s) => s.cageHistory);
  const resetCage = useDrawStore((s) => s.resetCage);

  const [cage, setCage] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isCage) return;
      if (e.code === "Space") {
        e.preventDefault();
        const result = drawByRandom();
        if (result)
          confetti({ particleCount: 180, spread: 95, origin: { y: 0.28 } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCage, drawByRandom]);

  const handleShowCage = useCallback(() => {
    if (!cage) return;
    const normalized = cage.replace(/\D/g, "").padStart(5, "0").slice(-5);
    showCage(normalized);
    showHistoryCage(normalized);
    setCage("");
  }, [cage, showCage]);

  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProgramInfo program={program} themeKey={themeKey} />

        <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-gradient-to-b from-card to-background">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-3xl">
                {isCage ? "Lồng cầu" : "Chọn số Online"}
              </CardTitle>
              <CardDescription>
                {isCage
                  ? "Control nhập số, Audience hiển thị số lớn."
                  : "Control quay số; Audience xem ticker và danh sách trúng."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {isCage ? (
              <div className="grid xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                    <CardHeader className="py-6">
                      <CardTitle className="text-lg">
                        Nhập số lồng cầu
                      </CardTitle>
                      <CardDescription>
                        Nhập số và bấm “Hiển thị”.
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="space-y-6">
                    <div className="flex items-end gap-4">
                      <div className="w-full space-y-4">
                        <DigitSelects
                          value={cage}
                          onChange={setCage}
                          onConfirmDigit={(idx, val, next) => {
                            // hiển thị từng bước (Audience sẽ thấy dần)
                            showCage(next);
                          }}
                          onConfirmFull={(full) => {
                            // chỉ hiển thị khi đủ 5 số
                            showCage(full);
                          }}
                          confirmPerDigit // hoặc false nếu muốn chỉ confirm khi đủ 5 số
                        />
                        <div className="text-xs text-neutral-500">
                          Dùng Tab để chuyển nhanh giữa các ô.
                        </div>
                      </div>
                      <Button
                        onClick={handleShowCage}
                        className="h-11 px-6 rounded-xl shadow-sm text-white font-medium transition-all hover:shadow md:self-end"
                      >
                        Lưu
                      </Button>
                    </div>
                    <div className="rounded-xl border bg-gradient-to-br from-neutral-50 to-white p-3 md:p-4">
                      <div className="text-xs text-neutral-500 mb-2">
                        Xem trước
                      </div>
                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: 5 },
                          (_, i) => cage[i] ?? "–"
                        ).map((d, i) => {
                          const active = d !== "–";
                          return (
                            <div
                              key={i}
                              className={`h-10 w-10 md:h-12 md:w-12 grid place-items-center rounded-xl border text-lg md:text-xl font-semibold ${
                                active
                                  ? "bg-white shadow-sm"
                                  : "bg-neutral-50 text-neutral-400"
                              }`}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-neutral-50 to-white border-b">
                    <CardHeader className="py-6">
                      <CardTitle className="text-lg">Tóm tắt</CardTitle>
                      <CardDescription className="truncate">
                        {program?.title}
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between rounded-xl border bg-white p-3">
                      <span className="text-neutral-600">Đang hiển thị</span>
                      <span
                        className={`tabular-nums tracking-wider text-base md:text-lg font-extrabold ${
                          isSpecial(cageDisplay)
                            ? "text-amber-600"
                            : "text-neutral-900"
                        }`}
                      >
                        {cageDisplay || "—"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Lịch sử gần nhất</div>
                      <div className="flex flex-wrap gap-2">
                        {cageHistory.length ? (
                          cageHistory.map((n, i) => (
                            <span
                              key={i}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs md:text-sm tabular-nums ${
                                isSpecial(n)
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : "bg-neutral-50 border-neutral-200 text-neutral-700"
                              }`}
                            >
                              {n}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Chưa có</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="secondary"
                      onClick={resetCage}
                      className="rounded-xl"
                    >
                      Làm mới
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Tabs defaultValue="participants" className="w-full">
                <TabsList>
                  <TabsTrigger
                    value="participants"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Người tham gia
                  </TabsTrigger>
                  <TabsTrigger value="stage">Màn quay</TabsTrigger>
                  <TabsTrigger value="winners">Danh sách trúng</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <ParticipantsTable
                        participants={[
                          {
                            id: crypto.randomUUID(),
                            name: "Nguyễn An",
                            phone: "0912345678",
                            count: 3,
                            luckies: ["00001", "00045", "00078"],
                          },
                          {
                            id: crypto.randomUUID(),
                            name: "Trần Bình",
                            phone: "0988888888",
                            count: 2,
                            luckies: ["11111", "22222"],
                          },
                          {
                            id: crypto.randomUUID(),
                            name: "Lê Chi",
                            phone: "0909123456",
                            count: 4,
                            luckies: ["33333", "44444", "55555", "66666"],
                          },
                          {
                            id: crypto.randomUUID(),
                            name: "Phạm Dũng",
                            phone: "0977777777",
                            count: 1,
                            luckies: ["77777"],
                          },
                        ]}
                        winners={[
                          {
                            id: crypto.randomUUID(),
                            time: Date.now() - 1000 * 60 * 5,
                            prizeLabel: "Giải Nhất",
                            name: "Nguyễn An",
                            phone: "0912345678",
                            luckyNumber: "00045",
                          },
                          {
                            id: crypto.randomUUID(),
                            time: Date.now() - 1000 * 60 * 3,
                            prizeLabel: "Giải Nhì",
                            name: "Lê Chi",
                            phone: "0909123456",
                            luckyNumber: "44444",
                          },
                          {
                            id: crypto.randomUUID(),
                            time: Date.now() - 1000 * 60 * 1,
                            prizeLabel: "Giải Khuyến Khích",
                            name: "Phạm Dũng",
                            phone: "0977777777",
                            luckyNumber: "77777",
                          },
                        ]}
                      />
                    </div>
                    <div>
                      <Card className="bg-card/60">
                        <CardHeader>
                          <CardTitle className="text-base">Tóm tắt</CardTitle>
                          <CardDescription>{program?.title}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Người tham gia</span>
                            <span className="font-semibold">
                              {participants.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tổng giải</span>
                            <span className="font-semibold">
                              {prizes.reduce((a, b) => a + b.count, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Đã trúng</span>
                            <span className="font-semibold">
                              {winners.length}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stage" className="mt-4">
                  <div className="grid xl:grid-cols-3 gap-5">
                    <Card className="xl:col-span-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Nhập số lồng cầu
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Chọn số rồi bấm “Hiển thị”.
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4"
                            onClick={handleShowCage}
                          >
                            Hiển thị
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <DigitSelects value={cage} onChange={setCage} />
                        <CagePreview value={cage} />
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 rounded-lg"
                            onClick={() => setCage("")}
                          >
                            Xóa nhập
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-lg"
                            onClick={resetCage}
                          >
                            Làm mới lịch sử
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <SummaryCard
                      title={program?.title}
                      display={cageDisplay}
                      history={cageHistory}
                    />
                  </div>
                  <div className="mt-6">
                    <WinnersTicker items={winners} dot={THEMES[themeKey].dot} />
                  </div>
                </TabsContent>

                <TabsContent value="winners" className="mt-4">
                  <div className="border rounded-xl overflow-hidden bg-card/50">
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                          <tr>
                            <th className="text-left p-3 w-12">#</th>
                            <th className="text-left p-3">Số may mắn</th>
                            <th className="text-left p-3">Hình ảnh</th>
                            <th className="text-left p-3">Tên giải</th>
                            <th className="text-left p-3">Phần quà</th>
                            <th className="text-left p-3">SĐT</th>
                            <th className="text-left p-3">Tên KH</th>
                            <th className="text-left p-3">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {winners.map((w, idx) => (
                            <tr key={w.id} className="border-t">
                              <td className="p-3">{idx + 1}</td>
                              <td className="p-3 font-mono tabular-nums">
                                {w.luckyNumber ?? "—"}
                              </td>
                              <td className="p-3">
                                {w.image ? (
                                  <img
                                    src={w.image}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="p-3 font-medium">
                                {w.prizeLabel}
                              </td>
                              <td className="p-3">{w.prizeGift ?? "—"}</td>
                              <td className="p-3 font-mono">{w.phone}</td>
                              <td className="p-3">{w.name ?? "—"}</td>
                              <td className="p-3">
                                {new Date(w.time).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          {!winners.length && (
                            <tr>
                              <td
                                className="p-6 text-center text-muted-foreground"
                                colSpan={8}
                              >
                                Chưa có người trúng
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>

          {!isCage && (
            <>
              <Separator />
              <CardFooter className="justify-between">
                <div className="text-sm text-muted-foreground">
                  {/* Dot màu: {THEMES[themeKey].dot} */}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Xuất CSV</Button>
                  <Button>Phát trực tiếp</Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </main>
    </Shell>
  );
}
