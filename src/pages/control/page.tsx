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
import { AlertCircle, Gift, Hash, Trophy, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { THEMES } from "@/lib/type";
import { useDrawStore } from "@/lib/store";
import { isSpecial } from "@/lib/utils";
import { ParticipantsTable } from "./components/participants-table";
import { DigitSelects } from "./components/digit-selects";
import {
  useGetListCustomerCampaign,
  useGetListGiftCampaign,
  useGetListLuckyHistory,
  useRequestLuckyManual,
  useRequestPublishEvent,
} from "@/react-query/queries/campaign/campaign";
import { Badge } from "@/components/ui/badge";
function CagePreview({
  value,
  count = 5,
  size = 40,
}: {
  value: string;
  count: number;
  size?: number;
}) {
  const digits = useMemo(
    () => Array.from({ length: count }, (_, i) => value[i] ?? "–"),
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
  const [digitCount, setDigitCount] = useState(3);
  const [selectedPrizeId, setSelectedPrizeId] = useState("");
  const programs = useDrawStore((s) => s.programs);
  const programId = useDrawStore((s) => s.programId);
  const program = programs?.find((p) => p.id === programId);
  const themeKey = program?.status as keyof typeof THEMES;
  const isCage = false;
  const { data: customers } = useGetListCustomerCampaign({
    campaignCode: program?.code || "",
  });
  const { data: gifts } = useGetListGiftCampaign({
    c: program?.code || "",
  });
  const { data: histories } = useGetListLuckyHistory({
    c: program?.code || "",
  });
  const { mutate: requestLucky, isPending: isLoadingRequest } =
    useRequestLuckyManual();
  const { mutate: requestPublishEvent } = useRequestPublishEvent();
  const prizes = useDrawStore((s) => s.prizes);
  const setPrize = useDrawStore((s) => s.setPrize);
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

  const getProgressColor = (percent: number, isFull: boolean) => {
    if (isFull) return "bg-neutral-400"; // Hết quà: Màu xám
    if (percent > 90) return "bg-red-500"; // Sắp hết: Màu đỏ
    if (percent > 75) return "bg-amber-500"; // Còn ít: Màu cam
    return "bg-emerald-500"; // Còn nhiều: Màu xanh ngọc
  };
  const handleShowCage = useCallback(() => {
    if (!cage || !program?.code || !selectedPrizeId) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    const normalized = cage
      .replace(/\D/g, "")
      .padStart(digitCount, "0")
      .slice(-digitCount);
    console.log({
      campaign_code: program.code,
      gift_code: selectedPrizeId,
      numb: +cage,
    });
    const [gift_code, award_name] = selectedPrizeId.split("_");
    requestLucky(
      {
        campaign_code: program.code,
        gift_code: gift_code,
        numb: +cage,
      },
      {
        onSuccess: (res) => {
          showCage(normalized);
          showHistoryCage(normalized);
          setCage("");
          requestPublishEvent({
            type: program.type,
            data: JSON.stringify({
              campaign_code: program.code,
              gift_code: gift_code,
              numb: +cage,
              award_name: award_name,
              type: program.type,
            }),
          });

          //@ts-expect-error no check
          alert(res?.message);
        },
        onError: () => {
          alert("Nhập số thất bại");
        },
      }
    );
  }, [cage, showCage]);
  useEffect(() => {
    if (prizes && prizes.length > 0) {
      setPrize(prizes);
    }
  }, [prizes]);
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
                  : "Control chọn số; Audience xem ticker và danh sách trúng."}
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
                          confirmPerDigit
                          digitCount={digitCount}
                          onChangeDigitCount={setDigitCount}
                          prizes={prizes}
                          selectedPrizeId={selectedPrizeId}
                          onPrizeChange={setSelectedPrizeId}
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
                          { length: digitCount },
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
                        {program?.name}
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
                  <TabsTrigger
                    value="gifts"
                    className="flex items-center gap-2"
                  >
                    <Gift className="h-4 w-4" />
                    Giải thưởng
                  </TabsTrigger>
                  <TabsTrigger value="stage">Màn chọn số</TabsTrigger>
                  <TabsTrigger value="winners">Danh sách trúng</TabsTrigger>
                </TabsList>

                <TabsContent value="participants" className="mt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <ParticipantsTable
                        participants={
                          customers?.map((item) => ({
                            name: item.consumer_name,
                            phone: item.consumer_phone,
                            id: item.campaign_code,
                            number_counter: item.number_counter,
                            number_get: item.number_get,
                          })) || []
                        }
                        code={program?.code || ""}
                      />
                    </div>
                    <div>
                      <Card className="bg-card/60">
                        <CardHeader>
                          <CardTitle className="text-base">Tóm tắt</CardTitle>
                          <CardDescription>{program?.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Người tham gia</span>
                            <span className="font-semibold">
                              {customers?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tổng giải</span>
                            <span className="font-semibold">
                              {gifts?.reduce(
                                (pre, cur) => pre + cur.limits,
                                0
                              ) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Đã trúng</span>
                            <span className="font-semibold">
                              {histories?.length || 0}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  value="gifts"
                  className="mt-4 animate-in fade-in zoom-in-95 duration-300"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {gifts?.map((item) => {
                      const percent =
                        item.limits > 0
                          ? (item.counter / item.limits) * 100
                          : 0;
                      const isFull = item.counter >= item.limits;
                      const progressColor = getProgressColor(percent, isFull);

                      return (
                        <Card
                          key={item.id}
                          className={`group relative flex flex-col h-full overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                            isFull ? "opacity-80 bg-neutral-50" : "bg-white"
                          }`}
                        >
                          {/* --- Phần Header Chứa Ảnh --- */}
                          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center border-b border-slate-100">
                            {/* Tên Giải Thưởng (Badge nổi) */}
                            <div className="absolute top-3 left-3 z-10">
                              <Badge
                                variant={isFull ? "secondary" : "default"}
                                className={`shadow-sm backdrop-blur-md ${
                                  isFull
                                    ? "bg-neutral-200 text-neutral-600"
                                    : "bg-primary/90 hover:bg-primary"
                                }`}
                              >
                                {isFull ? "Đã trao hết" : item.award_name}
                              </Badge>
                            </div>

                            {/* Hình ảnh sản phẩm */}
                            {item.gift_image ? (
                              <img
                                src={item.gift_image}
                                alt={item.gift_name}
                                className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm mix-blend-multiply ${
                                  isFull ? "grayscale-[0.8]" : ""
                                }`}
                              />
                            ) : (
                              <Gift
                                className="w-16 h-16 text-slate-300/50"
                                strokeWidth={1}
                              />
                            )}

                            {/* Icon Trophy trang trí mờ nền */}
                            <Trophy className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-200/20 -rotate-12" />
                          </div>

                          {/* --- Phần Nội Dung --- */}
                          <CardHeader className="p-4 pb-2 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              <Hash className="w-3 h-3" />
                              {item.gift_code}
                            </div>
                            <CardTitle
                              className={`text-base font-bold leading-tight line-clamp-2 ${
                                isFull
                                  ? "text-muted-foreground"
                                  : "text-slate-800"
                              }`}
                              title={item.gift_name}
                            >
                              {item.gift_name}
                            </CardTitle>
                          </CardHeader>

                          {/* --- Phần Footer Thống Kê --- */}
                          <CardFooter className="p-4 pt-2 bg-slate-50/50 mt-auto border-t border-slate-50">
                            <div className="w-full space-y-3">
                              {/* Thông số Counter / Limit */}
                              <div className="flex items-end justify-between">
                                <div className="text-xs text-muted-foreground font-medium">
                                  Tiến độ trao giải
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`text-sm font-bold tabular-nums ${
                                      isFull
                                        ? "text-neutral-500"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {item.counter}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    / {item.limits}
                                  </span>
                                </div>
                              </div>

                              {/* Thanh Progress Bar với hiệu ứng Gradient */}
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${progressColor}`}
                                  style={{
                                    width: `${Math.min(percent, 100)}%`,
                                  }}
                                />
                              </div>

                              {/* Cảnh báo nếu sắp hết quà */}
                              {!isFull && percent > 90 && (
                                <div className="flex items-center gap-1 text-[10px] text-red-600 font-medium animate-pulse">
                                  <AlertCircle className="w-3 h-3" />
                                  Sắp hết quà!
                                </div>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}

                    {/* Empty State đẹp hơn */}
                    {(!gifts || gifts.length === 0) && (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Gift className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Danh sách trống
                        </h3>
                        <p className="text-sm text-slate-500">
                          Chưa có giải thưởng nào được thiết lập cho chiến dịch
                          này.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="stage" className="mt-4">
                  <div className="grid xl:grid-cols-3 gap-5">
                    <Card className="xl:col-span-2">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Nhập số online
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Chọn số rồi bấm “Hiển thị”.
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4"
                            onClick={handleShowCage}
                            disabled={isLoadingRequest}
                          >
                            {isLoadingRequest ? "Đang xử lí..." : "Hiển thị"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <DigitSelects
                          value={cage}
                          onChange={setCage}
                          digitCount={digitCount}
                          onChangeDigitCount={setDigitCount}
                          selectedPrizeId={selectedPrizeId}
                          onPrizeChange={setSelectedPrizeId}
                          prizes={gifts || []}
                        />
                        <CagePreview value={cage} count={digitCount} />
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
                      title={program?.name}
                      display={cageDisplay}
                      history={cageHistory}
                    />
                  </div>
                  <div className="mt-6">
                    <WinnersTicker items={histories} dot={THEMES[1].dot} />
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
                          {histories?.map((w, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-3">{idx + 1}</td>
                              <td className="p-3 font-mono tabular-nums">
                                {w.number ?? "—"}
                              </td>
                              <td className="p-3">
                                {w.gift_image ? (
                                  <img
                                    src={w.gift_image}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="p-3 font-medium">
                                {w.award_name}
                              </td>
                              <td className="p-3">{w?.gift_name ?? "—"}</td>
                              <td className="p-3 font-mono">
                                {w.consumer_phone}
                              </td>
                              <td className="p-3">{w.consumer_name ?? "—"}</td>
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
                  {/* <Button>Phát trực tiếp</Button> */}
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </main>
    </Shell>
  );
}
