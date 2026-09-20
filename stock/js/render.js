/**
 * render.js - Chuyên trách đổ dữ liệu (DOM Manipulation)
 */

const Render = {
  setText: (id, text, isHtml = false) => {
    const el = document.getElementById(id);
    if (el) {
      if (isHtml) el.innerHTML = text;
      else el.innerText = text;
    }
  },

  setColorClass: (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('text-success', 'text-danger');
    if (value > 0) el.classList.add('text-success');
    else if (value < 0) el.classList.add('text-danger');
  },

  renderInputData: (data) => {
    Render.setText('val-symbol', `${data.symbol}: ${data.name}`);
    Render.setText('val-gia', Utils.formatNumber(data.marketPrice, 0));
    Render.setText('val-vcsh', Utils.formatNumber(data.vcsh));
    Render.setText('val-tlct', data.dividendRate + "%");
    Render.setText('val-slcp', Utils.formatNumber(data.slcp));
    // Old layout uses simple text mapping for the most part

    const isYearly = data.lnstLatest.quarter === 0;
    
    Render.setText('val-lnst-header', isYearly ? 'LNST 5 năm gần nhất' : 'LNST 5 quý gần nhất');
    
    let sumLnstTruoc = 0;
    data.lnst4Quarters.forEach((q, index) => {
      const uiIndex = 4 - index; 
      Render.setText(`val-q${uiIndex}-lbl`, Utils.getQuarterYear(q.year, q.quarter));
      Render.setText(`val-q${uiIndex}-val`, Utils.formatNumber(q.value));
      // Nếu là báo cáo Quý, cộng dồn 4 quý cũ. Nếu báo cáo Năm, chỉ lấy năm liền kề (index 3)
      if (!isYearly || index === 3) {
          sumLnstTruoc += q.value;
      }
    });

    Render.setText('val-q0-lbl', Utils.getQuarterYear(data.lnstLatest.year, data.lnstLatest.quarter));
    Render.setText('val-q0-val', Utils.formatNumber(data.lnstLatest.value));

    const qOldest = data.lnst4Quarters[0];
    const qNewest_truoc = data.lnst4Quarters[3];
    const qOldest_sau = data.lnst4Quarters[1];
    
    if (isYearly) {
        Render.setText('val-lnst-truoc-lbl', `LNST ${Utils.getQuarterYear(qNewest_truoc.year, qNewest_truoc.quarter)} (tỷ đồng) Trước`);
        Render.setText('val-lnst-sau-lbl', `LNST ${Utils.getQuarterYear(data.lnstLatest.year, data.lnstLatest.quarter)} (tỷ đồng) Sau`);
    } else {
        Render.setText('val-lnst-truoc-lbl', `LNST ${Utils.getQuarterYear(qOldest.year, qOldest.quarter)} ~ ${Utils.getQuarterYear(qNewest_truoc.year, qNewest_truoc.quarter)} (tỷ đồng) Trước`);
        Render.setText('val-lnst-sau-lbl', `LNST ${Utils.getQuarterYear(qOldest_sau.year, qOldest_sau.quarter)} ~ ${Utils.getQuarterYear(data.lnstLatest.year, data.lnstLatest.quarter)} (tỷ đồng) Sau`);
    }

    Render.setText('val-vcsh-lbl', `VỐN CHỦ SỞ HỮU HIỆN TẠI [${Utils.getQuarterYear(data.lnstLatest.year, data.lnstLatest.quarter)}] (tỷ đồng)`);

    Render.setText('val-lnst-truoc', Utils.formatNumber(sumLnstTruoc));
    const sumLnstSau = isYearly ? data.lnstLatest.value : (sumLnstTruoc - data.lnst4Quarters[0].value + data.lnstLatest.value);
    Render.setText('val-lnst-sau', Utils.formatNumber(sumLnstSau));

    return { sumLnstTruoc, sumLnstSau };
  },

  renderValuation: (data, sumLnstTruoc, sumLnstSau) => {
    const gttTruoc = Calculator.calculateIntrinsicValue(sumLnstTruoc, data.vcsh, data.slcp);
    const gttSau = Calculator.calculateIntrinsicValue(sumLnstSau, data.vcsh, data.slcp);

    Render.setText('val-gtt-truoc', Utils.formatNumber(gttTruoc, 0));
    Render.setText('val-gtt-sau', Utils.formatNumber(gttSau, 0));
    Render.setText('val-simplize', Utils.formatNumber(data.simplizeValue, 0));

    const pillarsTruoc = Calculator.calculatePillars(gttTruoc, data.marketPrice, data.dividendRate, sumLnstTruoc, data.vcsh);
    Render.setText('val-laivon-truoc', Utils.formatPercent(pillarsTruoc.laiVon));
    Render.setColorClass('val-laivon-truoc', pillarsTruoc.laiVon);
    Render.setText('val-dongtien-truoc', Utils.formatPercent(pillarsTruoc.dongTien));
    Render.setText('val-tanggiatri-truoc', Utils.formatPercent(pillarsTruoc.tangGiaTri));
    Render.setColorClass('val-tanggiatri-truoc', pillarsTruoc.tangGiaTri);
    Render.setText('val-tongloiich-truoc', Utils.formatPercent(pillarsTruoc.tong));
    Render.setColorClass('val-tongloiich-truoc', pillarsTruoc.tong);

    const pillarsSau = Calculator.calculatePillars(gttSau, data.marketPrice, data.dividendRate, sumLnstSau, data.vcsh);
    Render.setText('val-laivon-sau-box', Utils.formatPercent(pillarsSau.laiVon));
    Render.setColorClass('val-laivon-sau-box', pillarsSau.laiVon);
    Render.setText('val-dongtien-sau-box', Utils.formatPercent(pillarsSau.dongTien));
    Render.setText('val-tanggiatri-sau-box', Utils.formatPercent(pillarsSau.tangGiaTri));
    Render.setColorClass('val-tanggiatri-sau-box', pillarsSau.tangGiaTri);
    Render.setText('val-tongloiich-sau-box', Utils.formatPercent(pillarsSau.tong));
    Render.setColorClass('val-tongloiich-sau-box', pillarsSau.tong);

    const lblLaiVon = document.getElementById('lbl-laivon');
    if (lblLaiVon) {
        if (pillarsSau.laiVon > 50) {
            lblLaiVon.innerHTML = `LÃI VỐN (Mua rẻ tài sản) 
              <span class="custom-tooltip">⚠️
                <span class="tooltip-text"><strong>Lưu ý:</strong><br>Lãi Vốn > 50% cần xem xét kỹ. Không loại trừ khả năng đó là 1 doanh nghiệp nhỏ & tiềm ẩn nhiều rủi ro.</span>
              </span>`;
        } else {
            lblLaiVon.innerHTML = `LÃI VỐN (Mua rẻ tài sản)`;
        }
    }

    // THÀNH CÔNG
    const tcTruoc = document.getElementById('chk-thanhcong-truoc');
    if (tcTruoc) {
        tcTruoc.innerText = pillarsTruoc.tong >= 20 ? "YES" : "NO";
        tcTruoc.className = pillarsTruoc.tong >= 20 ? "text-center text-success font-bold" : "text-center text-danger font-bold";
    }
    const tcSau = document.getElementById('chk-thanhcong-sau');
    if (tcSau) {
        tcSau.innerText = pillarsSau.tong >= 20 ? "YES" : "NO";
        tcSau.className = pillarsSau.tong >= 20 ? "text-center text-success font-bold" : "text-center text-danger font-bold";
    }
  },

  renderChecklist: (data, sumLnstSau) => {
    const checks = Calculator.evaluateChecklist(data, sumLnstSau);

    const updateRow = (idPrefix, valueText, isPass) => {
      Render.setText(`${idPrefix}-val`, valueText);
      const ynEl = document.getElementById(`${idPrefix}-yn`);
      if (ynEl) {
        if (isPass === null) {
          ynEl.innerText = "N/A";
        } else {
          ynEl.innerText = isPass ? "YES" : "NO";
          const parentTd = ynEl.tagName === 'TD' ? ynEl : ynEl.closest('td');
          if(parentTd) {
             parentTd.className = isPass ? "bg-green-light text-center font-bold text-success" : "bg-pink-light text-center font-bold text-danger";
          }
        }
      }
    };

    updateRow('chk-dtt', data.isTangDeuDtt ? "1" : "0", checks.dtt);
    const dttDescEl = document.getElementById('chk-dtt-desc');
    if (dttDescEl) dttDescEl.innerHTML = data.dttDesc;
    
    updateRow('chk-lng', data.isTangDeuLng ? "1" : "0", checks.lng);
    const lngDescEl = document.getElementById('chk-lng-desc');
    if (lngDescEl) lngDescEl.innerHTML = data.lngDesc;
    
    let vcshText = "N/A";
    if (data.vcshQuarters && data.vcshQuarters.length === 4) {
        const fmt = (val, prev) => val < prev ? `<span class="text-danger font-bold">${Utils.formatNumber(val, 0)}</span>` : Utils.formatNumber(val, 0);
        vcshText = `${Utils.formatNumber(data.vcshQuarters[0], 0)} ➔ ${fmt(data.vcshQuarters[1], data.vcshQuarters[0])} ➔ ${fmt(data.vcshQuarters[2], data.vcshQuarters[1])} ➔ ${fmt(data.vcshQuarters[3], data.vcshQuarters[2])}`;
    }
    
    updateRow('chk-vcsh', checks.vcsh ? "1" : "0", checks.vcsh);
    const vcshDescEl = document.getElementById('chk-vcsh-desc');
    if (vcshDescEl) vcshDescEl.innerHTML = vcshText;
    updateRow('chk-gos', Utils.formatPercent(data.tyLeLaiGop), checks.gos);
    updateRow('chk-npm', Utils.formatPercent(data.tyLeLaiRong), checks.npm);
    updateRow('chk-roa', Utils.formatPercent(data.roa), checks.roa);
    updateRow('chk-roe', Utils.formatPercent(data.roe), checks.roe);
    updateRow('chk-roic', Utils.formatPercent(data.roic), checks.roic);
    updateRow('chk-doe', data.vcsh > 0 ? Utils.formatNumber(data.ndh / data.vcsh) : "N/A", checks.doe);
    updateRow('chk-pe', Utils.formatNumber(data.pe), checks.pe);
    updateRow('chk-pb', Utils.formatNumber(data.pb), checks.pb);
    updateRow('chk-mh', data.moHinh !== null ? data.moHinh : "N/A", data.moHinh !== null ? checks.mh : null);
    updateRow('chk-bld', data.bldMuaBan !== null ? data.bldMuaBan : "N/A", data.bldMuaBan !== null ? checks.bld : null);
    const bldDescEl = document.getElementById('chk-bld-desc');
    if (bldDescEl) bldDescEl.innerHTML = data.bldDesc.replace(/\n/g, '<br>');
    updateRow('chk-hdkd', data.lnHdkd > 0 ? "1" : "0", checks.hdkd);
    // Chi tiết HĐKD: hiển thị giá trị LN từ HĐKD
    const hdkdDescEl = document.getElementById('chk-hdkd-desc');
    if (hdkdDescEl) hdkdDescEl.innerText = `LN từ HĐKD: ${Utils.formatNumber(data.lnHdkd)} tỷ đồng`;
    
    // Nợ DH / LNST TTM 4 quý (Trailing Twelve Months)
    let ndh_lnst_val = "N/A";
    if (sumLnstSau > 0) {
      const rawVal = data.ndh / sumLnstSau;
      if (data.ndh === 0) {
        ndh_lnst_val = "0 (Không có nợ)";
      } else {
        let y = Math.floor(rawVal);
        let m = Math.round((rawVal - y) * 12);
        if (m === 12) { y += 1; m = 0; }
        let timeStr = "";
        if (y > 0 && m > 0) timeStr = `${y} năm ${m} tháng`;
        else if (y > 0 && m === 0) timeStr = `${y} năm`;
        else timeStr = `${m} tháng`;
        ndh_lnst_val = `${timeStr} (${Utils.formatNumber(rawVal)})`;
      }
    }
    updateRow('chk-ndh', ndh_lnst_val, checks.ndh_lnst);
    // Chi tiết NDH: hiển thị công thức TTM
    const ndhDetailEl = document.getElementById('chk-ndh-detail');
    if (ndhDetailEl) {
      ndhDetailEl.innerText = `Nợ DH (${Utils.formatNumber(data.ndh)}) / LNST TTM 4Q (${Utils.formatNumber(sumLnstSau)})`;
    }
  }
};
