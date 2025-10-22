// File: app/control/page.tsx
("use client");
import { useEffect, useState } from "react";
import Shell from "@/components/draw/Shell";
import ProgramInfo from "@/components/draw/ProgramInfo";
import WinnersTicker from "@/components/draw/WinnersTicker";
import SpinWheel from "@/components/draw/SpinWheel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Keyboard, Settings, Shuffle, Users } from "lucide-react";
import FlipNumbers from "react-flip-numbers";
import confetti from "canvas-confetti";
import { DEMO_PROGRAMS, THEMES, tierBadge } from "@/lib/type";
import { useDrawStore } from "@/lib/store";
import { isSpecial, numberMask } from "@/lib/utils";

export default function ControlPage() {
  const programId = useDrawStore((s) => s.programId);
  const program = DEMO_PROGRAMS.find((p) => p.id === programId);
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;
  const isCage = program?.type === "cage";

  const prizes = useDrawStore((s) => s.prizes);
  const participants = useDrawStore((s) => s.participants);
  const winners = useDrawStore((s) => s.winners);
  const addPrize = useDrawStore((s) => s.addPrize);
  const removePrize = useDrawStore((s) => s.removePrize);
  const addParticipant = useDrawStore((s) => s.addParticipant);
  const drawByRandom = useDrawStore((s) => s.drawByRandom);
  const wheelStopAt = useDrawStore((s) => s.wheelStopAt);
  const cageDisplay = useDrawStore((s) => s.cageDisplay);
  const cageHistory = useDrawStore((s) => s.cageHistory);
  const showCage = useDrawStore((s) => s.showCage);
  const resetCage = useDrawStore((s) => s.resetCage);

  const [newPrize, setNewPrize] = useState({
    label: "",
    count: 1,
    tier: "C" as const,
    image: "",
  });
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isCage) {
        if (e.code === "Space") {
          e.preventDefault();
          const result = drawByRandom();
          if (result)
            confetti({ particleCount: 180, spread: 95, origin: { y: 0.28 } });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCage, drawByRandom]);

  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProgramInfo program={program} themeKey={themeKey} />

        <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-gradient-to-b from-card to-background">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-3xl">
                {isCage ? "Lồng cầu" : "Quay online"}
              </CardTitle>
              <CardDescription>
                {isCage
                  ? "Control nhập số, Audience hiển thị số lớn."
                  : "Control quay số; Audience xem ticker và danh sách trúng."}
              </CardDescription>
            </div>

            {!isCage && (
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Cấu hình giải
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[760px]">
                    <DialogHeader>
                      <DialogTitle>Giải thưởng</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        <div className="md:col-span-3">
                          <Label>Tên giải</Label>
                          <Input
                            value={newPrize.label}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                label: e.target.value,
                              }))
                            }
                            placeholder="VD: Giải Nhất"
                          />
                        </div>
                        <div>
                          <Label>Số lượng</Label>
                          <Input
                            type="number"
                            min={1}
                            value={newPrize.count}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                count: Number(e.target.value || 1),
                              }))
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Ảnh (URL)</Label>
                          <Input
                            value={newPrize.image}
                            onChange={(e) =>
                              setNewPrize((p) => ({
                                ...p,
                                image: e.target.value,
                              }))
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Cấp</Label>
                          <Select
                            value={newPrize.tier}
                            onValueChange={(v) =>
                              setNewPrize((p) => ({ ...p, tier: v as any }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S">S</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => {
                              if (!newPrize.label.trim() || newPrize.count <= 0)
                                return;
                              addPrize({
                                label: newPrize.label.trim(),
                                count: Math.floor(newPrize.count),
                                tier: newPrize.tier,
                                image: newPrize.image || undefined,
                              });
                              setNewPrize({
                                label: "",
                                count: 1,
                                tier: "C",
                                image: "",
                              });
                            }}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prizes.map((pr) => (
                          <Card
                            key={pr.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {pr.label}
                                </CardTitle>
                                <Badge className={tierBadge[pr.tier ?? "C"]}>
                                  x{pr.count}
                                </Badge>
                              </div>
                            </CardHeader>
                            {pr.image && (
                              <CardContent className="pt-0">
                                <img
                                  src={pr.image}
                                  alt={pr.label}
                                  className="h-28 w-full object-cover rounded-md"
                                />
                              </CardContent>
                            )}
                            <CardFooter>
                              <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => removePrize(pr.id)}
                              >
                                Xóa
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="secondary">Lưu</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => {
                    const res = drawByRandom();
                    if (res)
                      confetti({
                        particleCount: 180,
                        spread: 95,
                        origin: { y: 0.28 },
                      });
                  }}
                  disabled={!participants.length || !prizes.length}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Quay số
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {isCage ? (
              <div className="grid xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Nhập số lồng cầu</CardTitle>
                    <CardDescription>
                      Nhập số và bấm “Hiển thị”.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <Label>Số</Label>
                        <Input
                          onKeyDown={(e) => {}}
                          value={cageDisplay}
                          readOnly
                          placeholder="Đang hiển thị"
                        />
                      </div>
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
                  <CardFooter className="gap-2">
                    <Button variant="secondary" onClick={resetCage}>
                      Làm mới
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Họ tên</Label>
                            <Input
                              value={pName}
                              onChange={(e) => setPName(e.target.value)}
                              placeholder="Tuỳ chọn"
                            />
                          </div>
                          <div>
                            <Label>Số điện thoại</Label>
                            <Input
                              value={pPhone}
                              onChange={(e) => setPPhone(e.target.value)}
                              placeholder="09xxxxxxxx"
                            />
                          </div>
                          <div>
                            <Label>Số lượt quay</Label>
                            <Input type="number" defaultValue={1} min={1} />
                          </div>
                          <div className="flex items-end">
                            <Button
                              className="w-full"
                              onClick={() => {
                                const phone = numberMask(pPhone);
                                if (!phone) return;
                                addParticipant({
                                  name: pName || undefined,
                                  phone,
                                  count: 1,
                                });
                                setPName("");
                                setPPhone("");
                              }}
                            >
                              Thêm
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 border rounded-xl overflow-hidden bg-card/50">
                          <div className="max-h-80 overflow-auto">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                                <tr>
                                  <th className="text-left p-3 w-12">#</th>
                                  <th className="text-left p-3">Họ tên</th>
                                  <th className="text-left p-3">SĐT</th>
                                  <th className="text-left p-3">
                                    Số lượt quay
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants.map((p, idx) => (
                                  <tr key={p.id} className="border-t">
                                    <td className="p-3">{idx + 1}</td>
                                    <td className="p-3">{p.name ?? "—"}</td>
                                    <td className="p-3 font-mono">{p.phone}</td>
                                    <td className="p-3">{p.count}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
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
                    <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>Spin Wheel</CardTitle>
                          <CardDescription>
                            Vòng quay theo số lượng giải
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <SpinWheel
                            segments={prizes}
                            onStop={(i) => {
                              const res = wheelStopAt(i);
                              if (res)
                                confetti({
                                  particleCount: 160,
                                  spread: 80,
                                  origin: { y: 0.28 },
                                });
                            }}
                          />
                        </CardContent>
                      </Card>
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>Random số</CardTitle>
                          <CardDescription>
                            Chọn ngẫu nhiên từ người tham gia
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center gap-6">
                            <FlipNumbers
                              height={40}
                              width={40}
                              color="black"
                              background="white"
                              play
                              perspective={700}
                              duration={30}
                              numbers={"0"}
                              numberClassName="mt-1 text-5xl font-extrabold tracking-tight"
                            />
                            <Button
                              onClick={() => {
                                const res = drawByRandom();
                                if (res)
                                  confetti({
                                    particleCount: 180,
                                    spread: 95,
                                    origin: { y: 0.28 },
                                  });
                              }}
                              disabled={!participants.length || !prizes.length}
                              className="px-10 h-12 text-base"
                            >
                              <Shuffle className="w-4 h-4 mr-2" />
                              Quay số
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="mt-6">
                      <WinnersTicker
                        items={winners}
                        dot={THEMES[themeKey].dot}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="winners" className="mt-4">
                    <div className="border rounded-xl overflow-hidden bg-card/50">
                      <div className="max-h-96 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                            <tr>
                              <th className="text-left p-3 w-12">#</th>
                              <th className="text-left p-3">Thời gian</th>
                              <th className="text-left p-3">Giải</th>
                              <th className="text-left p-3">Tên</th>
                              <th className="text-left p-3">SĐT</th>
                              <th className="text-left p-3">Ảnh</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winners.map((w, idx) => (
                              <tr key={w.id} className="border-t">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                  {new Date(w.time).toLocaleString()}
                                </td>
                                <td className="p-3 font-medium">
                                  {w.prizeLabel}
                                </td>
                                <td className="p-3">{w.name ?? "—"}</td>
                                <td className="p-3 font-mono">{w.phone}</td>
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
                              </tr>
                            ))}
                            {!winners.length && (
                              <tr>
                                <td
                                  className="p-6 text-center text-muted-foreground"
                                  colSpan={6}
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
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </Shell>
  );
}
