import QUERY_KEY from "@/constants/key";
import {
  getCampaignDetailNumber,
  getListCampaign,
  getListCustomerCampaign,
  type TGetCampaignDetailNumberReq,
  type TGetCampaignDetailNumberRes,
  type TGetListCampaignRes,
  type TGetListCustomerCampaignReq,
  type TGetListCustomerCampaignRes,
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

export const useGetCampaignNumberDetail = (
  params: TGetCampaignDetailNumberReq
) => {
  return useQuery<TGetCampaignDetailNumberRes, AxiosError<null>>({
    queryKey: [QUERY_KEY.CAMPAGIN.DETAIL_NUMBER, params],
    queryFn: () => getCampaignDetailNumber(params),
    enabled: !!params,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

export const useGetListCustomerCampaign = (
  params: TGetListCustomerCampaignReq
) => {
  return useQuery<TGetListCustomerCampaignRes, AxiosError<null>>({
    queryKey: [QUERY_KEY.CAMPAGIN.LIST_CUSTOMER, params],
    queryFn: () => getListCustomerCampaign(params),
    enabled: !!params,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};
