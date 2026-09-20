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
   * Đánh giá Tiêu chí Sức khỏe (Checklist)
   * Trả về true/false cho từng tiêu chí để render ra YES/NO
   */


  evaluateChecklist: (data, sumLnstSau) => {
    return {
      // Tăng đều: kiểm tra cả 4 quý liên tiếp không giảm (không dùng year-over-year)
      dtt: data.isTangDeuDtt === true,
      lng: data.isTangDeuLng === true,
      vcsh: (function(){       let vcshTangDeu = true;
      if (data.vcshQuarters && data.vcshQuarters.length === 4) {
          for (let i = 1; i < 4; i++) {
              if (data.vcshQuarters[i] < data.vcshQuarters[i-1]) {
                  vcshTangDeu = false;
                  break;
              }
          }
      } else {
          vcshTangDeu = false;
      } return vcshTangDeu; })(),
      gos: data.tyLeLaiGop >= 15,
      npm: data.tyLeLaiRong >= 5,
      roa: data.roa >= 5,
      roe: data.roe >= 15,
      roic: data.roic >= 10,
      doe: (data.vcsh > 0) ? ((data.ndh / data.vcsh) <= 1) : false,
      pe: data.pe > 0 && data.pe <= 15,
      pb: data.pb > 0 && data.pb <= 2,
      mh: null,
      bld: data.bldMuaBan === 1,
      hdkd: data.lnHdkd > 0,
      // Nợ DH / LNST quý gần nhất (không phải tổng 4 quý)
      ndh_lnst: (data.lnstLatest && data.lnstLatest.value > 0) ? ((data.ndh / data.lnstLatest.value) <= 5) : false
    };
  }
};
