"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Crown, Maximize2, Minimize2, Trophy } from "lucide-react";
import FiveDigitJackpot from "@/components/five-digit-jackpot";
import WinnersTicker from "@/components/draw/WinnersTicker";
import { THEMES } from "@/lib/type";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetListGiftCampaign,
  useGetListLuckyHistory,
} from "@/react-query/queries/campaign/campaign";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type { TReceiveEvent } from "@/react-query/services/campaign/campaign.service";
import AudienceBg from "@/assets/audience-theme.png";
import CrownIcon from "@/assets/crown.png";
import Logo from "@/assets/audience-logo.png";
export default function AudienceDeluxe() {
  const { campaign_code, type } = useParams();
  const stompClientRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [receivedEvent, setReceivedEvent] = useState<TReceiveEvent | null>(
    null
  );

  const { data: gifts } = useGetListGiftCampaign({
    c: campaign_code || "",
  });
  const { data: winners } = useGetListLuckyHistory({
    c: campaign_code || "",
  });
  const prevCount = useRef(winners?.length || 0);
  const [flash, setFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const firstRowRef = useRef<HTMLTableRowElement | null>(null);
  const last = winners?.[0];
  const [isFull, setIsFull] = useState(false);
  const toggleFullScreen = async () => {
    const el = containerRef.current;
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
    if (winners && winners.length > prevCount.current) {
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.28 } });
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2200);
      tableWrapRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      firstRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      prevCount.current = winners.length;
      return () => clearTimeout(t);
    }
    prevCount.current = winners?.length || 0;
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

      client.connect(
        {},
        () => {
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
                setReceivedEvent(JSON.parse(message.body) as TReceiveEvent);
              } catch (e) {
                console.error("Error parsing JSON", e);
              }
            }
          });
        },
        (error) => {
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
  }, [type]);

  console.log("receive", receivedEvent);
  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
        style={{ backgroundImage: `url(${AudienceBg})` }}
      />
      {type == "1" ? (
        <div className="relative h-full px-6 md:px-10 py-8 flex gap-8 items-stretch">
          <img src={Logo} className="w-96 absolute top-0" />

          <div className="w-full lg:w-[60%] flex flex-col items-center justify-center gap-0 ">
            <div className="flex items-center text-3xl lg:text-5xl font-extrabold text-[#0F392B] tracking-widest uppercase">
              QUAY SỐ MAY MẮN
            </div>
            {receivedEvent?.award_name && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="DB"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <div className="text-5xl md:text-6xl lg:text-7xl font-black text-[#0F392B] drop-shadow-sm leading-tight p-2 uppercase">
                    {receivedEvent?.award_name}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className="relative">
              <FiveDigitJackpot
                number={
                  receivedEvent?.numb?.toString()?.padStart(5, "0") || "00000"
                }
                type={type || ""}
              />
            </div>
            {/* <div className="text-center text-[#0F392B] text-xl mt-[-10px] font-medium">
            Đang chờ khảo sát trên
          </div> */}
          </div>

          <div className="w-full lg:w-[40%] flex flex-col gap-6">
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
                "relative rounded-2xl border bg-white/70 backdrop-blur p-6",
                "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
              )}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
              {last ? (
                <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                  <div>
                    {last.gift_image ? (
                      <img
                        src={last.gift_image}
                        className="w-44 object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 rounded-xl bg-neutral-100" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
                    <div className="text-neutral-500">Giải</div>
                    <div className="font-semibold">{last.award_name}</div>
                    <div className="text-neutral-500">Tên</div>
                    <div className="font-semibold">
                      {last.consumer_name ?? "—"}
                    </div>
                    <div className="text-neutral-500">SĐT</div>
                    <div className="font-mono">{last.consumer_phone}</div>
                    <div className="text-neutral-500">Thời gian</div>
                    <div>{new Date(last.time).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500">Chưa có kết quả</div>
              )}
            </motion.div>

            <WinnersTicker items={winners} dot={THEMES[1].dot} />

            <div className="rounded-2xl border overflow-hidden bg-white backdrop-blur shadow-md shadow-[#1E4D36]/40">
              <div ref={tableWrapRef} className="max-h-[50vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#428C57]">
                    <tr className="text-lg text-white">
                      {/* <th className="text-center p-3 w-12">STT</th> */}
                      <th className="text-center p-3">Số may mắn</th>
                      <th className="text-center p-3">Giải</th>
                      <th className="text-center p-3">Quà tặng</th>
                      <th className="text-center p-3">Tên</th>
                      <th className="text-center p-3">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {winners?.map((w, idx) => (
                      <tr
                        key={idx}
                        ref={idx === 0 ? firstRowRef : undefined}
                        className="border-t"
                      >
                        {/* <td className="p-3 text-center">{idx + 1}</td>*/}
                        <td className="p-3 text-center">{w.number}</td>
                        <td className="p-3 font-medium text-center">
                          {w.award_name}
                        </td>
                        <td className="p-3 text-center">{w.gift_name}</td>
                        <td className="p-3 text-center">
                          {w.consumer_name ?? "—"}
                        </td>
                        <td className="p-3 text-center">{w.consumer_phone}</td>
                      </tr>
                    ))}
                    {!winners?.length && (
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
              {last ? (
                <div className="grid grid-cols-[300px_1fr] gap-4 items-center">
                  <div>
                    {last.gift_image ? (
                      <img
                        src={last.gift_image}
                        className="w-64 object-contain"
                      />
                    ) : (
                      <div className="h-44 w-44 rounded-xl bg-neutral-100" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
                    <div className="text-neutral-500">Giải</div>
                    <div className="font-semibold">{last.award_name}</div>
                    <div className="text-neutral-500">Tên</div>
                    <div className="font-semibold">
                      {last.consumer_name ?? "—"}
                    </div>
                    <div className="text-neutral-500">SĐT</div>
                    <div className="font-mono">{last.consumer_phone}</div>
                    <div className="text-neutral-500">Thời gian</div>
                    <div>{new Date(last.time).toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500">Chưa có kết quả</div>
              )}
            </motion.div>
          </div>

          <div className="w-full lg:w-[50%] flex flex-col gap-6">
            <WinnersTicker items={winners} dot={THEMES[1].dot} />

            <div className="rounded-2xl border overflow-hidden bg-white backdrop-blur shadow-md shadow-[#1E4D36]/40">
              <div ref={tableWrapRef} className="max-h-[50vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#428C57]">
                    <tr className="text-lg text-white">
                      {/* <th className="text-center p-3 w-12">STT</th> */}
                      <th className="text-center p-3">Số may mắn</th>
                      <th className="text-center p-3">Giải</th>
                      <th className="text-center p-3">Quà tặng</th>
                      <th className="text-center p-3">Tên</th>
                      <th className="text-center p-3">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg">
                    {winners?.map((w, idx) => (
                      <tr
                        key={idx}
                        ref={idx === 0 ? firstRowRef : undefined}
                        className="border-t"
                      >
                        {/* <td className="p-3 text-center">{idx + 1}</td>*/}
                        <td className="p-3 text-center">{w.number}</td>
                        <td className="p-3 font-medium text-center">
                          {w.award_name}
                        </td>
                        <td className="p-3 text-center">{w.gift_name}</td>
                        <td className="p-3 text-center">
                          {w.consumer_name ?? "—"}
                        </td>
                        <td className="p-3 text-center">{w.consumer_phone}</td>
                      </tr>
                    ))}
                    {!winners?.length && (
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
    </div>
  );
}
