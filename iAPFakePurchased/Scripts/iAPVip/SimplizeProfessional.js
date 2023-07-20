let obj = JSON.parse($response.body);

obj["data"]["membership"]["type"] = "PROFESSIONAL";

// obj["data"]["features"]["QUY_DAU_TU_QUY_NUOC_NGOAI"] = "1";
// obj["data"]["features"]["LOC_CO_PHIEU_GIAO_DICH_NOI_BO"] = "1";
// obj["data"]["features"]["LOC_CO_PHIEU_NANG_CAO"] = "1";
// obj["data"]["features"]["REWARD_STOCK"] = "1";
// obj["data"]["features"]["LOC_CO_PHIEU_BIEN_AN_TOAN"] = "1";
// obj["data"]["features"]["PHAN_TICH_GIA_HANG_HOA"] = "1";
// obj["data"]["features"]["STOCK_RELATIVE_STRENGTH"] = "1";
// obj["data"]["features"]["LIMIT_VIEW_COMPANY"] = "1";

obj["data"]["hasMembership"] = true;
obj["data"]["membershipStatus"] = true;

obj["data"]["systemMessage"]["visible"] = true;

$done({body: JSON.stringify(obj)});