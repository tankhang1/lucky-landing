import QUERY_KEY from "@/constants/key";
import {
  getListCampaign,
  type TGetListCampaignRes,
} from "@/react-query/services/campaign/campaign.service";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useGetListCampaign = () => {
  return useQuery<TGetListCampaignRes, AxiosError<null>>({
    queryKey: [QUERY_KEY.CAMPAGIN.LIST],
    queryFn: getListCampaign,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};
