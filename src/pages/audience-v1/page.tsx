"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  InfoIcon,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  TriangleIcon,
  Trophy,
  User,
} from "lucide-react";
import FiveDigitJackpot from "@/components/five-digit-jackpot";
import WinnersTicker from "@/components/draw/WinnersTicker";
import { THEMES } from "@/lib/type";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import {
  useGetListGiftCampaign,
  useGetListLuckyHistory,
  useRequestLuckyRandom,
} from "@/react-query/queries/campaign/campaign";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type {
  TGetListCampaignLuckyHistoryRes,
  TLucky,
  TReceiveEvent,
  TRequestLuckyRandomRes,
} from "@/react-query/services/campaign/campaign.service";
import AudienceBg from "@/assets/audience-theme.png";
import CrownIcon from "@/assets/crown.png";
import Logo from "@/assets/audience-logo.png";
import queryClient from "@/react-query";
import QUERY_KEY from "@/constants/key";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckTokenExpire } from "@/react-query/queries/auth/auth";
import dayjs from "dayjs";
type SpinResult = {
  round: number;
  winningNumber: string; // Số trúng giải (VD: Mã dự thưởng)
  winners: TLucky[]; // Danh sách người trúng của mã này (nếu 1 mã có nhiều người)
};
export default function AudienceDeluxeV1() {
  const { campaign_code, type } = useParams();
  const stompClientRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [receivedEvent, setReceivedEvent] = useState<TReceiveEvent | null>(
    null
  );
  const [isConnectingSocket, setIsConnectingSocket] = useState(false);

  const { data: gifts } = useGetListGiftCampaign({
    c: campaign_code || "",
  });
  const { data: winners } = useGetListLuckyHistory({
    c: campaign_code || "",
  });
  const { mutate: requestLuckyRandom, isPending: isLoadingRequestRandom } =
    useRequestLuckyRandom();
  const { mutate: checkToken } = useCheckTokenExpire();

  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [listWinners, setListWinner] =
    useState<TGetListCampaignLuckyHistoryRes>([]);
  const [giftCode, setGiftCode] = useState("-1");
  const [loop, setLoop] = useState(0);
  const [displayNumber, setDisplayNumber] = useState("00000");
  const [isSpinning, setIsSpinning] = useState(false);
  const [sessionResults, setSessionResults] = useState<SpinResult[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<TLucky | null>(null);
  const [selectedNumberResult, setSelectedNumberResult] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const prevCount = useRef(listWinners?.length || 0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLTableRowElement | null>(null);

  const [isFull, setIsFull] = useState(false);
  const toggleFullScreen = async () => {
    const el = document.documentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFull(true);
    } else {
      await document.exitFullscreen();
      setIsFull(false);
    }
  };
  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (listWinners && listWinners.length > prevCount.current) {
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.28 } });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2200);
      tableWrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      firstRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      prevCount.current = listWinners.length;
      return () => clearTimeout(t);
    }
    prevCount.current = listWinners?.length || 0;
  }, [listWinners]);
  useEffect(() => {
    setListWinner(winners || []);
  }, [winners]);
  useEffect(() => {
    const connect = () => {
      // Clean up existing client before creating a new one
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect();
      }

      const socket = new SockJS("https://mps-api.vmarketing.vn/socket");
      const client = Stomp.over(socket);

      // Optional: Disable debug logs if they are too noisy
      // client.debug = () => {};
      setIsConnectingSocket(true);
      client.connect(
        {},
        () => {
          setIsConnectingSocket(false);
          console.log("Connected Successfully");
          stompClientRef.current = client;

          // Subscribe based on type
          const topic =
            type === "0"
              ? "/landingpage/manual/update-award"
              : "/landingpage/random/update-award";

          client.subscribe(topic, (message) => {
            console.log("Received message", message);
            if (message?.body) {
              try {
                const parsedData = JSON.parse(message.body) as TReceiveEvent;
                if (type === "0") {
                  queryClient.invalidateQueries({
                    queryKey: [QUERY_KEY.CAMPAGIN.LIST_LUCKY_HISTORY],
                  });
                }
                setReceivedEvent(parsedData);
              } catch (e) {
                console.error("Error parsing JSON", e);
              }
            }
          });
        },
        (error) => {
          setIsConnectingSocket(true);
          console.error("Connection lost or failed:", error);

          // Retry after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connect();
          }, 5000);
        }
      );
    };

    connect();

    // Cleanup function
    return () => {
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Disconnect cleanly
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => console.log("Disconnected"));
      }
    };
  }, [type, setIsConnectingSocket]);

  const onStartSpinning = () => {
    if (giftCode === "-1" || loop === 0) {
      setAlertMessage("Vui lòng chọn quà tặng và số lượt quay");
      return;
    }
    setSelectedNumberResult("");
    setSessionResults([]);
    setCurrentLoopIndex(0);
    setPendingWinner(null);
    setDisplayNumber("00000");
    // 3. Mở Modal kết quả
    setShowResultModal(true);
    // Bắt đầu lượt đầu tiên
    executeSpinCode();
  };
  const executeSpinCode = () => {
    setIsSpinning(true);

    requestLuckyRandom(
      { campaign_code: campaign_code || "", gift_code: giftCode },
      {
        onSuccess: (data: TRequestLuckyRandomRes) => {
          if (data && data.data && data.data.length > 0) {
            const winner = data.data[0];
            setPendingWinner(winner);

            setSessionResults((pre) => [
              {
                round: currentLoopIndex,
                winners: data.data || [],
                winningNumber: winner?.numb?.toString()?.padStart(5, "0"),
              },
              ...pre,
            ]);
            setDisplayNumber(winner.numb.toString().padStart(5, "0"));
          } else {
            // Xử lý nếu không có ai trúng (API trả rỗng)
            setIsSpinning(false);
            setShowResultModal(false);
            setEmptyMessage("Không tìm thấy người trúng thưởng!");
          }
        },
        onError: () => {
          setIsSpinning(false);
          setAlertMessage("Lỗi hệ thống, vui lòng thử lại");
        },
      }
    );
  };
  const onJackpotAnimationComplete = () => {
    // Chỉ xử lý khi đang trong trạng thái quay thật (tránh trigger lúc init)
    if (!isSpinning || !pendingWinner) return;

    // 2. Bắn pháo hoa
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    }, 1000);

    // 4. Kết thúc trạng thái quay của lượt này
    setIsSpinning(false);
    handleNextLoop();
  };
  const handleNextLoop = () => {
    // Đóng modal để nhìn thấy màn hình chính quay tiếp

    setPendingWinner(null);

    if (currentLoopIndex + 1 < loop) {
      setCurrentLoopIndex((prev) => prev + 1);
      setTimeout(() => {
        executeSpinCode();
      }, 500);
    }
  };

  const handleFinishSession = () => {
    setShowResultModal(false);
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY.CAMPAGIN.LIST_LUCKY_HISTORY],
    });
  };
  const selectTriggerClass =
    "h-[45px]! bg-[#2e6b47] hover:bg-[#255739] text-white rounded-full border-none ring-0 focus:ring-0 shadow-sm px-5 flex items-center justify-between [&>svg]:hidden";
  console.log("receive", receivedEvent, receivedEvent, isConnectingSocket);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkToken(
        {
          token: token,
        },
        {
          onSuccess: (isExpire) => {
            if (isExpire) {
              localStorage.clear();
              location.replace("/");
              alert("Đã hết phiên đăng nhập, vui lòng đăng nhập lại");
            }
          },
        }
      );
    } else {
      localStorage.clear();
      location.replace("/");
      alert("Đã hết phiên đăng nhập, vui lòng đăng nhập lại");
    }
  }, [location.pathname]);
  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
        style={{ backgroundImage: `url(${AudienceBg})` }}
      />
      <div className="absolute top-2 right-16 z-50 p-2">
        {isConnectingSocket && (
          <div className="flex items-center gap-2 text-black">
            <Loader2 className="animate-spin" />
            Socket Connecting...
          </div>
        )}
      </div>
      {type == "1" ? (
        <div className="relative h-full px-6 md:px-10 py-8 flex gap-8 items-stretch">
          <img src={Logo} className="w-96 absolute top-0" />

          <div className="w-full lg:w-[55%] flex flex-col items-center justify-center gap-0 ">
            <div className="flex items-center text-3xl lg:text-5xl font-extrabold text-[#0F392B] tracking-widest uppercase">
              QUAY SỐ MAY MẮN
            </div>

            <div className="relative">
              <FiveDigitJackpot
                number={displayNumber}
                type={"0"}
                onComplete={onJackpotAnimationComplete}
              />
            </div>
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex justify-center items-center gap-2">
                <Select value={giftCode} onValueChange={setGiftCode}>
                  <SelectTrigger
                    className={`${selectTriggerClass} w-auto max-w-[420px]`}
                  >
                    <div className="flex-1 min-w-0 flex justify-center items-center px-1 gap-2">
                      <span className="truncate text-lg flex-1">
                        <SelectValue placeholder="Chọn giải quay"></SelectValue>
                      </span>
                      <ChevronDown color="white" size={24} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="overflow-auto max-h-[150px]">
                    <SelectItem disabled key={"-1"} value={"-1"}>
                      Chọn giải quay
                    </SelectItem>
                    {gifts?.map((p) => (
                      <SelectItem key={p.gift_code} value={p.gift_code}>
                        {p.award_name} - {p.gift_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={loop.toString()}
                  onValueChange={(value) => setLoop(+value)}
                >
                  <SelectTrigger className={`${selectTriggerClass} w-auto`}>
                    <div className="flex-1 min-w-0 flex justify-center items-center px-1 gap-2">
                      <span className="truncate text-lg flex-1">
                        <SelectValue placeholder="Chọn lượt quay" />
                      </span>
                      <ChevronDown color="white" size={24} />
                    </div>
                    <TriangleIcon />
                  </SelectTrigger>
                  <SelectContent className="overflow-auto max-h-[150px]">
                    <SelectItem key={"0"} value={"0"} disabled>
                      Chọn lượt quay
                    </SelectItem>
                    {Array.from({ length: 20 })?.map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                disabled={isSpinning || isLoadingRequestRandom}
                className="bg-[#ed6c36] hover:bg-[#d95e2b] text-white text-xl rounded-[2rem] px-10 py-3 h-auto min-w-[160px] font-normal shadow-md transition-all active:scale-95"
                onClick={onStartSpinning}
              >
                {isSpinning ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Play className="mr-2 h-5 w-5 fill-current" />
                )}
                {isSpinning ? "Đang quay..." : "Quay số"}
              </Button>
            </div>
            {/* <div className="text-center text-[#0F392B] text-xl mt-[-10px] font-medium">
            Đang chờ khảo sát trên
          </div> */}
          </div>

          <div className="w-full lg:w-[45%] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={CrownIcon} className="w-14" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#0F392B]">
                Người trúng giải gần nhất
              </div>
              <button
                onClick={toggleFullScreen}
                className="absolute top-4 right-4 z-50 p-2"
                title={isFull ? "Exit Full Screen" : "Full Screen"}
              >
                {isFull ? (
                  <Minimize2 className="h-5 w-5 text-neutral-700" />
                ) : (
                  <Maximize2 className="h-5 w-5 text-neutral-700" />
                )}
              </button>
            </div>

            <div className="rounded-2xl border overflow-hidden bg-white backdrop-blur shadow-md shadow-[#1E4D36]/40">
              <div ref={tableWrapRef} className="max-h-[68vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#428C57]">
                    <tr className="text-lg text-white">
                      <th className="text-center p-3 w-12">STT</th>
                      <th className="text-center p-3">Số may mắn</th>
                      <th className="text-center p-3">Giải</th>
                      {/* <th className="text-center p-3">Quà tặng</th> */}
                      <th className="text-center p-3">Tên</th>
                      <th className="text-center p-3">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {listWinners?.map((w, idx) => (
                      <tr
                        key={idx}
                        ref={idx === 0 ? firstRowRef : undefined}
                        className="border-t"
                      >
                        <td className="p-3 text-center">{idx + 1}</td>
                        <td className="p-3 text-center">{w.number}</td>
                        <td className="p-3 font-medium text-center">
                          {w.award_name}
                        </td>
                        {/* <td className="p-3 text-center">{w.gift_name}</td> */}
                        <td className="p-3 text-center">
                          {w.consumer_name ?? "—"}
                        </td>
                        <td className="p-3 text-center">{w.consumer_phone}</td>
                      </tr>
                    ))}
                    {!listWinners?.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-6 text-center text-neutral-500"
                        >
                          Chưa có người trúng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-full px-6 md:px-10 py-8 flex gap-8 items-center ">
          <img src={Logo} className="w-96 absolute top-0" />

          <div className="w-full lg:w-[50%] flex flex-col items-center justify-center gap-0 ">
            <div className="flex items-center gap-3 w-full">
              <div className="relative">
                <img src={CrownIcon} className="w-14" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#0F392B]">
                Người trúng giải gần nhất
              </div>
              <button
                onClick={toggleFullScreen}
                className="absolute top-4 right-4 z-50 p-2"
                title={isFull ? "Exit Full Screen" : "Full Screen"}
              >
                {isFull ? (
                  <Minimize2 className="h-5 w-5 text-neutral-700" />
                ) : (
                  <Maximize2 className="h-5 w-5 text-neutral-700" />
                )}
              </button>

              {/* <button
              onClick={() => navigate("/control")}
              className="absolute top-4 left-4 z-50 p-2"
              title={isFull ? "Exit Full Screen" : "Full Screen"}
            >
              <ArrowLeft />
            </button> */}
            </div>
            <motion.div
              animate={
                flash
                  ? { scale: 1.02, boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)" }
                  : { scale: 1 }
              }
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className={cn(
                "w-full relative rounded-2xl border bg-white/70 backdrop-blur p-6",
                "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
              )}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
              {listWinners?.[0] ? (
                <div className="grid grid-cols-[300px_1fr] gap-4 items-center">
                  <div>
                    {listWinners?.[0]?.gift_image ? (
                      <img
                        src={`${
                          listWinners?.[0]?.gift_image
                        }?t=${new Date().getTime()}`}
                        className="w-64 object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 rounded-xl bg-neutral-100" />
                    )}
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-3 text-sm md:text-base">
                    <div className="text-neutral-500">Giải</div>
                    <div className="font-semibold">
                      {listWinners?.[0]?.award_name}
                    </div>
                    <div className="text-neutral-500">Tên</div>
                    <div className="font-semibold">
                      {listWinners?.[0]?.consumer_name ?? "—"}
                    </div>
                    <div className="text-neutral-500">SĐT</div>
                    <div className="font-mono">
                      {listWinners?.[0]?.consumer_phone}
                    </div>
                    <div className="text-neutral-500">Thời gian</div>
                    <div>
                      {listWinners?.[0]?.time
                        ? dayjs(new Date(listWinners[0].time)).format(
                            "DD/MM/YYYY"
                          )
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500">Chưa có kết quả</div>
              )}
            </motion.div>
          </div>

          <div className="w-full lg:w-[50%] flex flex-col gap-6">
            <WinnersTicker items={listWinners} dot={THEMES[1].dot} />

            <div className="rounded-2xl border overflow-hidden bg-white backdrop-blur shadow-md shadow-[#1E4D36]/40">
              <div ref={tableWrapRef} className="max-h-[53vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#428C57]">
                    <tr className="text-lg text-white">
                      <th className="text-center p-3 w-12">STT</th>
                      <th className="text-center p-3">Số may mắn</th>
                      <th className="text-center p-3">Giải</th>
                      {/* <th className="text-center p-3">Quà tặng</th> */}
                      <th className="text-center p-3">Tên</th>
                      <th className="text-center p-3">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {listWinners?.map((w, idx) => (
                      <tr
                        key={idx}
                        ref={idx === 0 ? firstRowRef : undefined}
                        className="border-t"
                      >
                        <td className="p-3 text-center">{idx + 1}</td>
                        <td className="p-3 text-center">{w.number}</td>
                        <td className="p-3 font-medium text-center">
                          {w.award_name}
                        </td>
                        {/* <td className="p-3 text-center">{w.gift_name}</td> */}
                        <td className="p-3 text-center">
                          {w.consumer_name ?? "—"}
                        </td>
                        <td className="p-3 text-center">{w.consumer_phone}</td>
                      </tr>
                    ))}
                    {!listWinners?.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-6 text-center text-neutral-500"
                        >
                          Chưa có người trúng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL KẾT QUẢ (CHỈ HIỆN KHI QUAY XONG) --- */}
      <Dialog
        open={showResultModal}
        onOpenChange={(open) => {
          // Ngăn người dùng đóng modal bằng cách click ra ngoài nếu chưa hết vòng lặp (hoặc tùy ý bạn)
          if (!open) handleFinishSession();
        }}
      >
        <DialogContent className="max-w-4xl bg-white p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-2 border-[#2e6b47]">
          {/* Header Modal */}
          <DialogHeader className="bg-[#2e6b47] p-5 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Trophy size={64} />
            </div>
            <DialogTitle className="text-2xl font-bold text-center uppercase flex flex-col gap-1">
              <span>Kết quả lượt quay</span>
              <span className="text-sm font-normal opacity-90 badge bg-white/20 w-fit mx-auto px-3 py-0.5 rounded-full">
                Lượt thứ {currentLoopIndex + 1} / {loop}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
            {/* PHẦN 1: CHÚC MỪNG SỐ VỪA TRÚNG (pendingWinner) */}
            <div className="bg-white p-8 border-b shadow-sm flex flex-col items-center justify-center shrink-0 z-10">
              {sessionResults?.length > 0 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <h2 className="text-2xl text-[#0F392B]">
                    Chúc mừng số may mắn
                  </h2>
                  <div className="flex flex-row flex-wrap items-center justify-center gap-4">
                    {sessionResults?.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "transition-all delay-1000 cursor-pointer",
                          isSpinning && index === 0
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                        )}
                        onClick={() =>
                          setSelectedNumberResult(item.winningNumber)
                        }
                      >
                        <div
                          className={cn(
                            // Giảm size chữ xuống 3xl/4xl để vừa Grid
                            "text-5xl font-mono font-bold text-[#ed6c36] drop-shadow-sm tracking-wider",
                            isSpinning &&
                              index === 0 &&
                              "opacity-0 transition-all duration-150"
                          )}
                        >
                          {item.winningNumber.padStart(5, "0")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-xl text-[#0F392B]">
                      {sessionResults?.[0]?.winners?.[0]?.award_name || ""}
                    </span>
                    <span className="text-gray-500">
                      {sessionResults?.[0]?.winners?.[0]?.gift_name || ""}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-gray-500 italic">
                  Đang cập nhật kết quả...
                </div>
              )}
            </div>

            {/* PHẦN 2: DANH SÁCH TÍCH LŨY (sessionWinners) */}
            <div className="flex-1 p-4 md:p-6 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4 text-[#2e6b47] font-bold text-lg uppercase border-b pb-2">
                <Trophy size={20} /> Danh sách trúng thưởng phiên này
              </div>

              <div className="space-y-3">
                {sessionResults
                  ?.flatMap((item) => item.winners)
                  .filter(
                    (item) =>
                      item.numb.toString().padStart(5, "0") ==
                      selectedNumberResult
                  )
                  .map((winner, idx) => (
                    <motion.div
                      key={`${winner}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border shadow-sm ${
                        idx === 0
                          ? "bg-orange-50 border-orange-200 ring-1 ring-orange-100"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex-1 items-center flex gap-4">
                        <div className="font-mono text-xl font-bold text-[#ed6c36]">
                          {winner.numb.toString().padStart(5, "0")}
                        </div>
                        <div className="truncate flex flex-col flex-1  text-left">
                          <div className="font-semibold text-sm text-gray-900">
                            {winner.award_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {winner.gift_name}
                          </div>
                        </div>
                        <div className="justify-center items-center flex flex-col">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User size={14} className="text-gray-400" />
                            <span className="font-medium truncate">
                              {winner.consumer_name || "—"}
                            </span>
                          </div>
                          <span className="font-medium truncate">
                            {winner.consumer_phone || "—"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>

          {/* Footer Control */}
          <div className="p-4 bg-white border-t flex justify-center shrink-0 gap-4">
            <Button
              onClick={handleFinishSession}
              className="bg-[#ed6c36] hover:bg-[#d95e2b] text-white text-xl h-14 px-10 rounded-full shadow-lg flex items-center gap-2"
              disabled={currentLoopIndex + 1 < loop}
            >
              Hoàn tất <CheckCircle2 className="ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!alertMessage}
        onOpenChange={(open) => !open && setAlertMessage(null)}
      >
        <DialogContent className="z-[100000] max-w-sm bg-white p-6 rounded-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Icon */}
            <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
              <CircleAlert color="red" size={48} />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-neutral-900">Thông báo</h3>
              <p className="text-neutral-600 text-2xl">{alertMessage}</p>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setAlertMessage(null)}
              className="w-full text-xl py-2 bg-[#2e6b47] hover:bg-[#255739]"
            >
              Đã hiểu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!emptyMessage}
        onOpenChange={(open) => !open && setEmptyMessage(null)}
      >
        <DialogContent className="z-[100000] max-w-sm bg-white p-6 rounded-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Icon */}
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
              <InfoIcon color="green" size={48} />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-neutral-900">Thông báo</h3>
              <p className="text-neutral-600 text-2xl">{emptyMessage}</p>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setEmptyMessage(null)}
              className="w-full text-xl py-2 bg-[#2e6b47] hover:bg-[#255739]"
            >
              Đã hiểu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
