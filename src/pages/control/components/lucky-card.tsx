import type { TLucky } from "@/react-query/services/campaign/campaign.service";
import { Clock, Ticket, Trophy } from "lucide-react"; // Assuming you have lucide-react installed
import dayjs from "dayjs";
const formatCurrency = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// --- OPTION 1: Horizontal Ticket Style (Recommended for Lists) ---
const LuckyTicketCard = ({ item }: { item: TLucky }) => {
  return (
    <div className="group relative flex w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98]">
      {/* Decorative Gradient Bar on Left */}
      <div className="w-1.5 shrink-0 bg-gradient-to-b from-amber-400 to-orange-500" />

      <div className="flex flex-1 items-center p-3 gap-3">
        {/* Image Section */}
        <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
          <img
            src={item.gift_image || "https://placehold.co/100"} // Fallback image
            alt={item.gift_name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold text-gray-900">
              {item.gift_name || item.award_name}
            </h3>
            {/* Price Tag (Optional) */}
            {item.gift_price > 0 && (
              <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                {formatCurrency(item.gift_price)}
              </span>
            )}
          </div>

          <p className="line-clamp-1 text-xs text-gray-500 flex items-center gap-1">
            <Trophy size={12} className="text-gray-400" />
            {item.campaign_name}
          </p>

          <div className="mt-1 flex items-end justify-between">
            {/* Lucky Number Badge */}
            <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              <Ticket size={14} className="text-indigo-500" />
              Số: {item.numb}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              {dayjs(item.time_get).format("DD/MM/YYYY HH:mm")}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              Khách hàng: {item.consumer_name} - {item.consumer_phone}
            </div>
          </div>
        </div>
      </div>

      {/* Dashed Circle decoration (Ticket punch hole look) */}
      <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-gray-50 ring-1 ring-gray-100" />
    </div>
  );
};

export default LuckyTicketCard;
