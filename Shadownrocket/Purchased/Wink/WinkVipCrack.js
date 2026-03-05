/******************************
[rewrite_local]
# > Wink Mở khóa tư cách thành viên vĩnh viễn
^https?:\/\/api-sub\.meitu\.com\/v2\/user\/vip_info_by_group\.json url script-response-body
[mitm] 
hostname = api-sub.meitu.com
*******************************/

var lienHe = "t.me/duyvinh09";
var _a = {};
(function (options) {
    options._decode = "http://www.sojson.com/javascriptobfuscator.html";
})(_a);
var body = $response.body;
var obj = JSON.parse(body);
obj.data = {
    active_sub_type: 2,
    account_type: 1,
    sub_type_name: "续期",
    active_sub_order_id: "7069961436604422668",
    trial_period_invalid_time: "",
    current_order_invalid_time: "32662173600000",
    active_order_id: "7069961436340181123",
    limit_type: 0,
    active_sub_type_name: "续期",
    use_vip: true,
    have_valid_contract: true,
    derive_type_name: "普通会员",
    derive_type: 1,
    in_trial_period: false,
    is_vip: true,
    membership: {
        id: "4",
        display_name: "Wink会员",
        level: 1,
        level_name: "普通会员"
    },
    active_promotion_status_list: [2],
    sub_type: 2,
    account_id: "1230010086",
    invalid_time: "32662195199000",
    valid_time: "1546992000000",
    active_product_id: "0",
    active_promotion_status: 2,
    show_renew_flag: true
};
$done({
    body: JSON.stringify(obj)
});
;
;
(function (_0xcbd8x3, _0xcbd8x4, _0xcbd8x5, _0xcbd8x6, _0xcbd8x7, _0xcbd8x8) {
    _0xcbd8x8 = "undefined";
    _0xcbd8x6 = function (_0xcbd8x9) {
        if (typeof alert !== _0xcbd8x8) {
        alert(_0xcbd8x9);
        }
        ;
        if (typeof console !== _0xcbd8x8) {
        console.log(_0xcbd8x9);
        }
    };
    _0xcbd8x5 = function (_0xcbd8xa, _0xcbd8x3) {
        return _0xcbd8xa + _0xcbd8x3;
    };
    _0xcbd8x7 = _0xcbd8x5("删除", _0xcbd8x5(_0xcbd8x5("版本号，js会定", "期弹窗，"), "还请支持我们的工作"));
    try {
        _0xcbd8x3 = lienHe;
        if (typeof _0xcbd8x3 === _0xcbd8x8 || _0xcbd8x3 !== _0xcbd8x5("jsjia", "mi.com")) {
        _0xcbd8x6(_0xcbd8x7);
        }
    } catch (e) {
        _0xcbd8x6(_0xcbd8x7);
    }
})({});