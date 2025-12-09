import PATH from "@/constants/path";
import { api } from "@/lib/axios";

export type TCampaign = {
  id: number;
  uuid: string;
  code: string;
  name: string;
  time_create: string;
  time_create_number: number;
  time_start?: string;
  time_start_number: number;
  time_end?: string;
  time_end_number: number;
  time_deactive?: string;
  time_deactive_number: number;
  time_active?: string;
  time_active_number: number;
  status: number;
  image_thumbnail: string;
  image_banner: string;
  description: string;
  description_short: string;
  number_start: number;
  number_end: number;
  number_loop: number;
  number_extra?: string;
  pdf_link?: string;
  audio_link?: string;
  type: number; //0  (manual) , 1(random)
};

export type TGetListCampaignRes = TCampaign[];
export const getListCampaign = async (): Promise<TGetListCampaignRes> => {
  const { data } = await api.get(PATH.CAMPAIGN.GET_LIST);
  return data;
};

export type TCampaignDetailNumber = {
  number: number;
  award_name?: string;
  gift_image: string;
  gift_name: string;
  time: string;
  award_time: string;
};
export type TGetCampaignDetailNumberRes = TCampaignDetailNumber[];
export type TGetCampaignDetailNumberReq = {
  p: string;
  c: string;
};
export const getCampaignDetailNumber = async (
  params: TGetCampaignDetailNumberReq
): Promise<TGetCampaignDetailNumberRes> => {
  const { data } = await api.get(PATH.CAMPAIGN.GET_DETAIL_NUMBER, {
    params,
  });
  return data;
};

export type TCustomerCampaign = {
  id: number;
  campaign_item: number;
  campaign_code: string;
  consumer_code: string;
  consumer_name: string;
  consumer_phone: string;
  status: number;
  number_counter: number;
  number_get: number;
};
export type TGetListCustomerCampaignRes = TCustomerCampaign[];
export type TGetListCustomerCampaignReq = {
  campaignCode: string;
};
export const getListCustomerCampaign = async (
  params: TGetListCustomerCampaignReq
): Promise<TGetListCustomerCampaignRes> => {
  const { data } = await api.get(PATH.CAMPAIGN.GET_LIST_CUSTOMER, {
    params,
  });
  return data;
};

export type TCampaignGift = {
  id: number;
  campaign_item: number;
  campaign_code: string;
  award_name: string;
  gift_code: string;
  gift_name: string;
  gift_image: string;
  gift_image_thumb: any;
  counter: number;
  limits: number;
  type_extra: number;
  status: number;
  time_create: string;
  time_deactive: string;
};

export type TGetListGiftCampaignReq = {
  c: string;
};
export type TGetListGiftCampaignRes = TCampaignGift[];
export const getListGiftCampaign = async (
  params: TGetListGiftCampaignReq
): Promise<TGetListGiftCampaignRes> => {
  const { data } = await api.get(PATH.CAMPAIGN.GET_LIST_GIFT, {
    params,
  });
  return data;
};

export type TRequestLuckyManualReq = {
  campaign_code: string;
  numb: number;
  gift_code: string;
};

export type TRequestLuckyManualRes = {};
export const requestLuckyManual = async (
  body: TRequestLuckyManualReq
): Promise<TRequestLuckyManualRes> => {
  const { data } = await api.post(PATH.CAMPAIGN.REQUEST_LUCKY_MANUAL, body);
  return data;
};

export type TCampaignLuckyHistory = {
  number: number;
  consumer_name: string;
  award_name: string;
  gift_image: string;
  consumer_code: any;
  gift_name: string;
  consumer_phone: string;
  time: string;
  award_time: string;
};

export type TGetListCampaignLuckyHistoryReq = {
  c: string;
};
export type TGetListCampaignLuckyHistoryRes = TCampaignLuckyHistory[];
export const getListCampaignLuckyHistory = async (
  params: TGetListCampaignLuckyHistoryReq
): Promise<TGetListCampaignLuckyHistoryRes> => {
  const { data } = await api.get(PATH.CAMPAIGN.GET_LUCKY_HISTORY, {
    params,
  });
  return data;
};
