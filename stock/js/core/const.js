/**
 * const.js - Khai báo hằng số, danh sách mã cổ phiếu
 */

const CONST = {
  RISK_FREE_RATE: 0.07,
  MARGIN_OF_SAFETY: 0.686,
  LOCAL_STORAGE_WHITELIST_KEY: "STOCK_WHITELIST",

  // Phân tích kỹ thuật – khung tuần
  EMA_LENGTH: 9,
  WMA_LENGTH: 45,
  PRICE_FETCH_LIMIT: 350,

  // Dữ liệu fallback trống, sẽ được gán toàn bộ qua API thay vì hardcode
  WATCHLISTS: [],
  STOCKS: []
};
