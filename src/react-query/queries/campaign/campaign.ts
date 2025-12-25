import QUERY_KEY from "@/constants/key";
import {
  getCampaignDetailNumber,
  getCustomerDetails,
  getListCampaign,
  getListCampaignLuckyHistory,
  getListCustomerCampaign,
  getListGiftCampaign,
  requestLuckyManual,
  requestLuckyRandom,
  requestPublishEvent,
  type TGetCampaignDetailNumberReq,
  type TGetCampaignDetailNumberRes,
  type TGetCustomerDetailReq,
  type TGetCustomerDetailRes,
  type TGetListCampaignLuckyHistoryReq,
  type TGetListCampaignLuckyHistoryRes,
  type TGetListCampaignRes,
  type TGetListCustomerCampaignReq,
  type TGetListCustomerCampaignRes,
  type TGetListGiftCampaignReq,
  type TGetListGiftCampaignRes,
  type TPublishEventReq,
  type TRequestLuckyManualReq,
  type TRequestLuckyManualRes,
  type TRequestLuckyRandomReq,
  type TRequestLuckyRandomRes,
} from "@/react-query/services/campaign/campaign.service";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useGetListGiftCampaign = (params: TGetListGiftCampaignReq) => {
  return useQuery<TGetListGiftCampaignRes, AxiosError<null>>({
    queryKey: [QUERY_KEY.CAMPAGIN.LIST_GIFT, params],
    queryFn: () => getListGiftCampaign(params),
    enabled: !!params,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

export const useRequestLuckyManual = () => {
  return useMutation<
    TRequestLuckyManualRes,
    AxiosError<null>,
    TRequestLuckyManualReq
  >({
    mutationFn: requestLuckyManual,
  });
};
export const useRequestLuckyRandom = () => {
  return useMutation<
    TRequestLuckyRandomRes,
    AxiosError<null>,
    TRequestLuckyRandomReq
  >({
    mutationFn: requestLuckyRandom,
  });
};

export const useGetListLuckyHistory = (
  params: TGetListCampaignLuckyHistoryReq
) => {
  return useQuery<TGetListCampaignLuckyHistoryRes, AxiosError<null>>({
    queryKey: [QUERY_KEY.CAMPAGIN.LIST_LUCKY_HISTORY, params],
    queryFn: () => getListCampaignLuckyHistory(params),
    enabled: !!params,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
};

export const useRequestPublishEvent = () => {
  return useMutation<void, AxiosError<null>, TPublishEventReq>({
    mutationFn: requestPublishEvent,
  });
};

export const useGetCustomerDetail = () => {
  return useMutation<
    TGetCustomerDetailRes,
    AxiosError<null>,
    TGetCustomerDetailReq
  >({
    mutationFn: getCustomerDetails,
  });
};
