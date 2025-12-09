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
  type?: string;
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
