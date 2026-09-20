/**
 * calculator.js - Xử lý logic toán học và định giá DCF
 * Không chứa code thao tác DOM ở đây.
 */

const Calculator = {
  /**
   * Tính toán Giá trị thực (Intrinsic Value)
   * @param {number} lnst4q - Lợi nhuận sau thuế 4 quý gần nhất (Tỷ đồng)
   * @param {number} vcsh - Vốn chủ sở hữu (Tỷ đồng)
   * @param {number} slcp - Số lượng cổ phiếu (Triệu CP)
   * @returns {number} Giá trị thực của 1 cổ phiếu (VNĐ)
   */
  calculateIntrinsicValue: (lnst4q, vcsh, slcp) => {
    if (!lnst4q || !vcsh || !slcp || slcp === 0) return 0;

    // 1. Tính DCF (10 năm, tăng trưởng 0%, chiết khấu 7%)
    let dcf = 0;
    const r = CONST.RISK_FREE_RATE; // 0.07
    for (let i = 1; i <= 10; i++) {
      dcf += lnst4q / Math.pow(1 + r, i);
    }
    // dcf tương đương lnst4q * 7.02358

    // 2. Tính EV (Enterprise Value) với Margin of Safety 0.686
    const ev = (dcf + vcsh) * CONST.MARGIN_OF_SAFETY;

    // 3. Tính giá trị 1 cổ phiếu (VNĐ)
    // ev (Tỷ đồng) / slcp (Triệu CP) * 1000 = VNĐ/CP
    const intrinsicValue = (ev * 1000) / slcp;
    
    return intrinsicValue;
  },

  /**
   * Đánh giá 3 Trụ cột (Lãi vốn, Dòng tiền thực, Tăng giá trị)
   * @param {number} intrinsicValue - Giá trị thực (VNĐ)
   * @param {number} marketPrice - Thị giá hiện tại (VNĐ)
   * @param {number} dividendRate - Tỷ lệ cổ tức (% mệnh giá)
   * @param {number} lnst4q - Lợi nhuận sau thuế 4 quý
   * @param {number} vcsh - Vốn chủ sở hữu
   * @returns {Object} Chứa các % của 3 trụ cột và tổng lợi ích
   */
  calculatePillars: (intrinsicValue, marketPrice, dividendRate, lnst4q, vcsh) => {
    if (!marketPrice || marketPrice === 0) return { laiVon: 0, dongTien: 0, tangGiaTri: 0, tong: 0 };
    // 1. Lãi vốn (Capital Gain)
    const laiVon = ((intrinsicValue - marketPrice) / marketPrice) * 100;

    // 2. Dòng tiền thực (Cashflow Yield)
    // Cổ tức bằng tiền = Tỷ lệ cổ tức * Mệnh giá (10,000 VNĐ)
    const dividendPerShare = (dividendRate / 100) * 10000;
    const dongTien = (dividendPerShare / marketPrice) * 100;

    // 3. Tăng giá trị (ROE = LNST / VCSH)
    let tangGiaTri = 0;
    if (vcsh > 0) {
      tangGiaTri = (lnst4q / vcsh) * 100;
    }

    // Tổng lợi ích
    const tong = laiVon + dongTien + tangGiaTri;

    return {
      laiVon,
      dongTien,
      tangGiaTri,
      tong
    };
  },

  /**
   * Tính EMA (Exponential Moving Average)
   * @param {number[]} prices - Mảng giá từ CŨ đến MỚI
   * @param {number} period
   * @returns {number} Giá trị EMA tại nến cuối cùng (mới nhất)
   */
  calculateEMA: (prices, period) => {
    if (!prices || prices.length < period) return null;
    const k = 2 / (period + 1);
    // Khởi tạo EMA đầu tiên = SMA của `period` nến đầu tiên
    let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  },

  /**
   * Tính WMA (Weighted Moving Average)
   * @param {number[]} prices - Mảng giá từ CŨ đến MỚI
   * @param {number} period
   * @returns {number} Giá trị WMA tại nến cuối cùng (mới nhất)
   */
  calculateWMA: (prices, period) => {
    if (!prices || prices.length < period) return null;
    const slice = prices.slice(prices.length - period);
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < period; i++) {
      const weight = i + 1; // Trọng số tăng dần: 1, 2, 3, ... period
      weightedSum += slice[i] * weight;
      weightTotal += weight;
    }
    return weightedSum / weightTotal;
  },

  /**
   * Đánh giá Tiêu chí Sức khỏe (Checklist)
   * Trả về true/false cho từng tiêu chí để render ra YES/NO
   */
  evaluateChecklist: (data, sumLnstSau) => {
    // Tính EMA9 & WMA45 trên khung tuần
    const weeklyPrices = data.weeklyPrices || [];
    const ema9 = Calculator.calculateEMA(weeklyPrices, CONST.EMA_LENGTH);
    const wma45 = Calculator.calculateWMA(weeklyPrices, CONST.WMA_LENGTH);

    let moHinhPass = null;
    let moHinhGap = null; // % khoảng cách EMA9 so với WMA45
    if (ema9 !== null && wma45 !== null && wma45 !== 0) {
      moHinhGap = ((ema9 - wma45) / wma45) * 100;
      moHinhPass = ema9 > wma45 ? 1 : 0;
    }

    return {
      // Tăng đều: kiểm tra cả 4 quý liên tiếp không giảm (không dùng year-over-year)
      dtt: data.isTangDeuDtt === true,
      lng: data.isTangDeuLng === true,
      vcsh: (function() {
        let vcshTangDeu = true;
        if (data.vcshQuarters && data.vcshQuarters.length === 4) {
          for (let i = 1; i < 4; i++) {
            if (data.vcshQuarters[i] < data.vcshQuarters[i - 1]) {
              vcshTangDeu = false;
              break;
            }
          }
        } else {
          vcshTangDeu = false;
        }
        return vcshTangDeu;
      })(),
      gos: data.tyLeLaiGop >= 15,
      npm: data.tyLeLaiRong >= 5,
      roa: data.roa >= 5,
      roe: data.roe >= 15,
      roic: data.roic >= 10,
      doe: (data.vcsh > 0) ? ((data.ndh / data.vcsh) <= 1) : false,
      pe: data.pe > 0 && data.pe <= 15,
      pb: data.pb > 0 && data.pb <= 2,
      mh: moHinhPass,
      mhGap: moHinhGap,
      ema9: ema9,
      wma45: wma45,
      bld: data.bldMuaBan === 1,
      hdkd: data.lnHdkd > 0,
      // Nợ DH / LNST 4 quý TTM (Trailing Twelve Months) – chắc hơn 1 quý đơn lẻ
      ndh_lnst: (sumLnstSau > 0) ? ((data.ndh / sumLnstSau) <= 5) : false
    };
  }
};
