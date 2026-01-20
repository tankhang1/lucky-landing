const PATH = {
  AUTH: {
    SIGNIN: "/login",
    CHECK_TOKEN: "/check-token-expired",
  },
  CAMPAIGN: {
    GET_LIST: "/collect/campaign/luckydraw-available/list",
    GET_LIST_CUSTOMER: "/collect/consumer/list",
    GET_LIST_GIFT: "/zalo/campaign/gift/list",
    GET_DETAIL_NUMBER: "/zalo/campaign/detail/number",
    GET_LUCKY_HISTORY: "/zalo/campaign/lucky/history",
    REQUEST_LUCKY_MANUAL: "/program/congrat-manual",
    REQUEST_LUCKY_RANDOM: "/program/congrat-random",
    PUBLISH_EVENT: "/collect/data-socket",
    GET_CUSTOMER_DETAIL: "/collect/campaign/number-get",
  },
};
export default PATH;
