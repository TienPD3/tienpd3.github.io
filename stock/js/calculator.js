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
   * Tính chuỗi EMA cho toàn bộ mảng giá
   * @param {number[]} prices
   * @param {number} period
   * @returns {(number|null)[]}
   */
  calculateEMASeries: (values, period) => {
    if (!values || values.length < period) return [];
    const series = new Array(values.length).fill(null);
    let firstValid = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== null && values[i] !== undefined && !isNaN(values[i])) {
        firstValid = i;
        break;
      }
    }
    if (firstValid === -1 || values.length - firstValid < period) return series;

    const k = 2 / (period + 1);
    let ema = 0;
    for (let i = 0; i < period; i++) {
      ema += values[firstValid + i];
    }
    ema /= period;
    series[firstValid + period - 1] = ema;

    for (let i = firstValid + period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
      series[i] = ema;
    }
    return series;
  },

  calculateWMASeries: (values, period) => {
    if (!values || values.length < period) return [];
    const series = new Array(values.length).fill(null);
    let firstValid = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== null && values[i] !== undefined && !isNaN(values[i])) {
        firstValid = i;
        break;
      }
    }
    if (firstValid === -1 || values.length - firstValid < period) return series;

    const weightTotal = (period * (period + 1)) / 2;
    for (let i = firstValid + period - 1; i < values.length; i++) {
      let weightedSum = 0;
      for (let j = 0; j < period; j++) {
        weightedSum += values[i - period + 1 + j] * (j + 1);
      }
      series[i] = weightedSum / weightTotal;
    }
    return series;
  },

  /**
   * Tính chuỗi RSI (Relative Strength Index) chu kỳ 14
   * @param {number[]} prices - Mảng giá từ CŨ đến MỚI
   * @param {number} period - Chu kỳ (mặc định 14)
   * @returns {(number|null)[]} Giá trị RSI từ 0 đến 100
   */
  calculateRSISeries: (prices, period = 14) => {
    if (!prices || prices.length <= period) return [];
    const rsi = new Array(prices.length).fill(null);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    if (avgLoss === 0) rsi[period] = 100;
    else {
      const rs = avgGain / avgLoss;
      rsi[period] = 100 - (100 / (1 + rs));
    }

    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) rsi[i] = 100;
      else {
        const rs = avgGain / avgLoss;
        rsi[i] = 100 - (100 / (1 + rs));
      }
    }

    return rsi;
  },

  /**
   * Tính chuỗi SMA (Simple Moving Average) cho bất kỳ mảng số nào
   * Dùng cho RSI-based MA (SMA 14 của RSI giống TradingView)
   * @param {(number|null)[]} series
   * @param {number} period
   * @returns {(number|null)[]}
   */
  calculateSMASeries: (series, period = 14) => {
    if (!series || series.length < period) return [];
    const sma = new Array(series.length).fill(null);
    for (let i = period - 1; i < series.length; i++) {
      let sum = 0;
      let valid = true;
      for (let j = 0; j < period; j++) {
        const val = series[i - j];
        if (val === null || val === undefined || isNaN(val)) {
          valid = false;
          break;
        }
        sum += val;
      }
      if (valid) {
        sma[i] = sum / period;
      }
    }
    return sma;
  },

  /**
   * Đánh giá Thanh khoản cổ phiếu theo GTGD bình quân/ngày (TB 20 phiên)
   * @param {number} avgDailyValueTy - Giá trị giao dịch bình quân (Tỷ đồng)
   * @returns {Object} Chứa trạng thái đánh giá, nhãn hiển thị và pass/fail
   */
  evaluateLiquidity: (avgDailyValueTy) => {
    if (avgDailyValueTy === null || avgDailyValueTy === undefined || isNaN(avgDailyValueTy)) {
      return {
        status: "N/A",
        cssClass: "text-muted",
        bgClass: "",
        pass: null,
        desc: "Chưa có dữ liệu"
      };
    }

    if (avgDailyValueTy > 100) {
      return {
        status: "Rất tốt",
        cssClass: "text-success",
        bgClass: "bg-green-light",
        pass: true,
        desc: "> 100 tỷ/ngày (Rất tốt)"
      };
    } else if (avgDailyValueTy >= 50) {
      return {
        status: "Tốt",
        cssClass: "text-success",
        bgClass: "bg-green-light",
        pass: true,
        desc: "50 – 100 tỷ/ngày (Tốt)"
      };
    } else if (avgDailyValueTy >= 30) {
      return {
        status: "Khá tốt",
        cssClass: "text-success",
        bgClass: "bg-green-light",
        pass: true,
        desc: "30 – 50 tỷ/ngày (Khá tốt)"
      };
    } else if (avgDailyValueTy >= 10) {
      return {
        status: "Có thể xem xét",
        cssClass: "text-warning",
        bgClass: "bg-warning-light",
        pass: true,
        desc: "10 – 30 tỷ/ngày (Có thể xem xét)"
      };
    } else if (avgDailyValueTy >= 5) {
      return {
        status: "Thấp",
        cssClass: "text-danger",
        bgClass: "bg-pink-light",
        pass: false,
        desc: "5 – 10 tỷ/ngày (Thấp)"
      };
    } else {
      return {
        status: "Rất thấp",
        cssClass: "text-danger font-bold",
        bgClass: "bg-pink-light",
        pass: false,
        desc: "< 5 tỷ/ngày (Rất thấp → nên tránh)"
      };
    }
  },

  /**
   * Đánh giá Tiêu chí Sức khỏe (Checklist)
   * Trả về true/false cho từng tiêu chí để render ra YES/NO
   */
  evaluateChecklist: (data, sumLnstSau) => {
    // Đánh giá thanh khoản cổ phiếu
    const liquidity = Calculator.evaluateLiquidity(data.avgDailyValueTy);

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
      thanhKhoan: liquidity,
      bld: data.bldMuaBan === 1,
      hdkd: data.lnHdkd > 0,
      // Nợ DH / LNST 4 quý TTM (Trailing Twelve Months) – chắc hơn 1 quý đơn lẻ
      ndh_lnst: (sumLnstSau > 0) ? ((data.ndh / sumLnstSau) <= 5) : false
    };
  }
};
