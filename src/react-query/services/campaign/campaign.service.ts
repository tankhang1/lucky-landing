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
