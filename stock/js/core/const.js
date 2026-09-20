/**
 * const.js - Khai báo hằng số, danh sách mã cổ phiếu
 */

const CONST = {
  RISK_FREE_RATE: 0.07,
  MARGIN_OF_SAFETY: 0.686,
  LOCAL_STORAGE_WHITELIST_KEY: "STOCK_WHITELIST",

  WATCHLISTS: [
    { id: "all", name: "Tất cả cổ phiếu" },
    { id: "vn30", name: "Rổ VN30" },
    { id: "bds", name: "Bất động sản" },
    { id: "bank", name: "Ngân hàng" },
    { id: "whitelist", name: "Whitelist của tôi" }
  ],

  STOCKS: [
    { symbol: "VHM", name: "Công ty cổ phần Vinhomes" },
    { symbol: "FPT", name: "Công ty cổ phần FPT" },
    { symbol: "HPG", name: "Tập đoàn Hòa Phát" },
    { symbol: "VCB", name: "Ngân hàng TMCP Ngoại thương" },
    { symbol: "TCB", name: "Ngân hàng TMCP Kỹ thương" },
    { symbol: "SSI", name: "Công ty CP Chứng khoán SSI" },
    { symbol: "MWG", name: "Công ty CP Đầu tư Thế Giới Di Động" }
  ]
};
