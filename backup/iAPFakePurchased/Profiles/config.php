# + Update 01.06.2021
# -- Cập nhật chứng chỉ mới
#
#
# Phiên bản cấu hình này thuộc bản quyền của Fake iAP Server Team. Mọi hành vi sao chép trái phép đều bị cấm.
# This configuration version is owned by Fake iAP Server. All copying and editing without consent is prohibited.
#

[general]
udp_whitelist=53, 1024-65535
profile_img_url=https://raw.githubusercontent.com/tinycarrot/tinycarrot.github.io/master/images/Board_02_endframevip1.png

[dns]
server=1.1.1.1
server=8.8.8.8
server=45.90.28.0

[policy]
static=Chỉ Dành cho VIP, direct, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Static.png
available=Tự Động, Fake iAP Server 01, Fake iAP Server 02, Fake iAP Server 03, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Auto.png
static=Tuỳ Chọn, Fake iAP Server 01, Fake iAP Server 02, Fake iAP Server 03, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Static.png
static=BẬT, reject, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/Direct.png
static=TẮT, direct, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/Reject.png
static=Chặn OTA, TẮT, BẬT, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/Apple_Update.png
static=Chặn Ads, BẬT, TẮT, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/Advertising.png
static=Chặn Theo Dõi FB, TẮT, BẬT, img-url=https://github.com/Koolson/Qure/raw/master/IconSet/Facebook.png
static=Fake iAP Policy, Tự Động, Tuỳ Chọn, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Quantumult_X.png
static=Fake PXX Policy, Chỉ Dành cho VIP, img-url=https://raw.githubusercontent.com/crossutility/Quantumult-X/master/icon-samples/apple.PNG

[server_remote]
http://conf.iapserver.com/remote.php?i=aeg5bfekiko3a30qh5949gabg87o9f721711833496551475, tag=TÀI KHOẢN ĐÃ BỊ CẤM, enabled=true

[filter_remote]
http://conf.iapserver.com/filter.php?i=aeg5bfekiko3a30qh5949gabg87o9f721711833496551475, tag=Fake iAP Filter, enabled=true
https://raw.githubusercontent.com/bigdargon/hostsVN/master/option/hostsVN-quantumult-exceptions-rule.conf, tag=🇻🇳hostsVN, force-policy=direct, enabled=true
https://raw.githubusercontent.com/bigdargon/hostsVN/master/option/hostsVN-quantumult-rule.conf, tag=🇻🇳hostsVN, force-policy=Chặn Ads, enabled=true
https://raw.githubusercontent.com/bigdargon/hostsVN/master/option/hostsVN-quantumult-OTA.conf, tag=🇻🇳hostsVN-OTA, force-policy=Chặn OTA, enabled=true
https://raw.githubusercontent.com/bigdargon/hostsVN/master/option/hostsVN-quantumult-FB.conf, tag=🇻🇳hostsVN-FB, force-policy=Chặn Theo Dõi FB, enabled=true

[rewrite_remote]
https://raw.githubusercontent.com/bigdargon/hostsVN/master/option/hostsVN-quantumultX-rewrite.conf, tag=🇻🇳hostsVN, enabled=true

[server_local]
shadowsocks=example.com:80, method=chacha20, password=721711833496551475, obfs=http, obfs-host=bing.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, server_check_url=http://www.apple.com/generate_204, tag=VER 3 - 01.06.2021
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, server_check_url=http://www.apple.com/generate_204, tag=TK ĐÃ BỊ CẤM
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, server_check_url=http://www.apple.com/generate_204, tag=Fake iAP Server TEAM
shadowsocks=example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, server_check_url=http://www.apple.com/generate_204, tag=LUÔN CHỌN ICON 3 MÀU ĐỂ FAKE APP
[filter_local]
final, direct

[rewrite_local]

[mitm]
hostname = testapps.videostarapp.com
passphrase = IAPSERVER2021
p12 = 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
