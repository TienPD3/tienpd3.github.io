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

    // Render biểu đồ giá tuần & Giá trị thực
    Render.renderWeeklyChart(data, gttSau);
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
    // Thanh khoản cổ phiếu (TB 20 phiên)
    const tk = checks.thanhKhoan;
    let tkValText = "N/A";
    if (data.avgDailyValueTy !== null && data.avgDailyValueTy !== undefined) {
      tkValText = `${Utils.formatNumber(data.avgDailyValueTy, 2)} tỷ`;
    }
    Render.setText('chk-tk-val', tkValText);

    const tkYnEl = document.getElementById('chk-tk-yn');
    if (tkYnEl) {
      tkYnEl.innerText = tk.status;
      const parentTd = tkYnEl.tagName === 'TD' ? tkYnEl : tkYnEl.closest('td');
      if (parentTd) {
        parentTd.className = `text-center font-bold ${tk.cssClass} ${tk.bgClass}`;
      }
    }

    const tkDescEl = document.getElementById('chk-tk-desc');
    if (tkDescEl) {
      const volText = data.avgDailyVolume > 0 ? `KLGD TB: ${Utils.formatNumber(data.avgDailyVolume, 0)} cp/ngày • ` : '';
      tkDescEl.innerText = `${volText}${tk.desc}`;
    }
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
  },

  renderWeeklyChart: (data, gttSau) => {
    const canvasPrice = document.getElementById('val-chart-price');
    const tooltipPrice = document.getElementById('val-tooltip-price');
    const canvasTech = document.getElementById('val-chart-tech');
    const tooltipTech = document.getElementById('val-tooltip-tech');
    if (!canvasPrice || !canvasTech) return;

    let weeklyBars = data?.weeklyBars || [];
    if (weeklyBars.length === 0 && data?.weeklyPrices && data.weeklyPrices.length > 0) {
      weeklyBars = data.weeklyPrices.map(p => ({ close: p, date: '' }));
    }
    if (weeklyBars.length === 0 && data?.marketPrice && data.marketPrice > 0) {
      weeklyBars = [{ close: data.marketPrice, date: '' }];
    }

    // 1. Tính toán toàn bộ lịch sử
    const allPrices = weeklyBars.map(b => b.close);
    const fullRsi = Calculator.calculateRSISeries(allPrices, 14);
    // EMA9 và WMA45 áp dụng trực tiếp lên RSI (thang 0 ~ 100%)
    const fullEma = Calculator.calculateEMASeries(fullRsi, CONST.EMA_LENGTH);
    const fullWma = Calculator.calculateWMASeries(fullRsi, CONST.WMA_LENGTH);

    // 2. Lấy khoảng ~65 nến tuần gần nhất (khoảng 1.3 năm giống TradingView) để hiển thị chi tiết, rõ ràng
    const VIEW_BARS = Math.min(weeklyBars.length, 65);
    const offset = weeklyBars.length - VIEW_BARS;
    const displayBars = weeklyBars.slice(offset);
    const prices = allPrices.slice(offset);
    const rsiSeries = fullRsi.slice(offset);
    const emaSeries = fullEma.slice(offset);
    const wmaSeries = fullWma.slice(offset);

    const dpr = window.devicePixelRatio || 1;

    // Helper: Vẽ biểu đồ Giá & GTT (Bên trái)
    const drawPriceChart = (hoverIdx = null) => {
      const ctx = canvasPrice.getContext('2d');
      const rect = canvasPrice.getBoundingClientRect();
      const w = Math.max(100, rect.width || canvasPrice.clientWidth || 250);
      const h = Math.max(80, rect.height || canvasPrice.clientHeight || 185);
      canvasPrice.width = w * dpr;
      canvasPrice.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      if (prices.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data ? 'Chưa có dữ liệu biểu đồ' : 'Đang tải biểu đồ...', w / 2, h / 2);
        return;
      }

      const padLeft = 6;
      const padRight = 42;
      const padTop = 14;
      const padBottom = 20;
      const plotW = Math.max(10, w - padLeft - padRight);
      const plotH = Math.max(10, h - padTop - padBottom);

      let minVal = Math.min(...prices);
      let maxVal = Math.max(...prices);
      if (gttSau && gttSau > 0) {
        minVal = Math.min(minVal, gttSau);
        maxVal = Math.max(maxVal, gttSau);
      }
      const range = (maxVal - minVal) || 1;
      minVal -= range * 0.05;
      maxVal += range * 0.05;

      const getX = (i) => padLeft + (i / Math.max(1, prices.length - 1)) * plotW;
      const getY = (val) => padTop + plotH - ((val - minVal) / (maxVal - minVal)) * plotH;

      // Đường lưới & Nhãn trục Y
      const gridCount = 4;
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';

      for (let i = 0; i <= gridCount; i++) {
        const yVal = minVal + (i / gridCount) * (maxVal - minVal);
        const yPos = getY(yVal);
        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(padLeft + plotW, yPos);
        ctx.stroke();

        const label = yVal >= 1000 ? `${(yVal / 1000).toFixed(1)}k` : yVal.toFixed(0);
        ctx.fillText(label, padLeft + plotW + 4, yPos + 3);
      }

      // Đường Giá trị thực (GTT)
      if (gttSau && gttSau > 0) {
        const gttY = getY(gttSau);
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padLeft, gttY);
        ctx.lineTo(padLeft + plotW, gttY);
        ctx.stroke();

        ctx.fillStyle = '#16a34a';
        ctx.fillRect(padLeft + plotW + 2, gttY - 6, 38, 13);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${(gttSau / 1000).toFixed(1)}k`, padLeft + plotW + 21, gttY + 3.5);
        ctx.restore();
      }

      // Vùng diện tích & Đường giá tuần
      ctx.save();
      const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      grad.addColorStop(0, 'rgba(79, 70, 229, 0.18)');
      grad.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

      ctx.beginPath();
      ctx.moveTo(getX(0), padTop + plotH);
      for (let i = 0; i < prices.length; i++) {
        ctx.lineTo(getX(i), getY(prices[i]));
      }
      ctx.lineTo(getX(prices.length - 1), padTop + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < prices.length; i++) {
        if (i === 0) ctx.moveTo(getX(i), getY(prices[i]));
        else ctx.lineTo(getX(i), getY(prices[i]));
      }
      ctx.stroke();
      ctx.restore();

      // Nhãn trục X (Ngày/Tuần)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      const xStep = Math.max(1, Math.floor(prices.length / 4));
      for (let i = 0; i < prices.length; i += xStep) {
        const dStr = displayBars[i]?.date || '';
        const label = dStr.length >= 7 ? dStr.substring(2, 7).replace('-', '/') : '';
        ctx.fillText(label, getX(i), h - 5);
      }

      // Đường gióng hover
      if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < prices.length) {
        const cx = getX(hoverIdx);
        const cy = getY(prices[hoverIdx]);
        ctx.save();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, padTop + plotH);
        ctx.stroke();

        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // Helper: Vẽ biểu đồ RSI14, EMA9 & WMA45 theo 0 ~ 100% (Bên phải)
    const drawTechChart = (hoverIdx = null) => {
      const ctx = canvasTech.getContext('2d');
      const rect = canvasTech.getBoundingClientRect();
      const w = Math.max(100, rect.width || canvasTech.clientWidth || 250);
      const h = Math.max(80, rect.height || canvasTech.clientHeight || 185);
      canvasTech.width = w * dpr;
      canvasTech.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      if (prices.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data ? 'Chưa có dữ liệu biểu đồ' : 'Đang tải biểu đồ...', w / 2, h / 2);
        return;
      }

      const padLeft = 6;
      const padRight = 36;
      const padTop = 14;
      const padBottom = 20;
      const plotW = Math.max(10, w - padLeft - padRight);
      const plotH = Math.max(10, h - padTop - padBottom);

      // Trục Y cố định 0 ~ 100%
      const minY = 0;
      const maxY = 100;

      const getX = (i) => padLeft + (i / Math.max(1, prices.length - 1)) * plotW;
      const getY = (val) => padTop + plotH - ((val - minY) / (maxY - minY)) * plotH;

      // Vùng dao động trung tính 30% - 70% (Tím mờ như TradingView)
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      const y70 = getY(70);
      const y30 = getY(30);
      ctx.fillRect(padLeft, y70, plotW, y30 - y70);

      // Đường lưới tại các mốc 30, 50, 70, 100
      ctx.lineWidth = 1;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';

      const gridLevels = [0, 30, 50, 70, 100];
      for (const lvl of gridLevels) {
        const yPos = getY(lvl);
        ctx.save();
        if (lvl === 30 || lvl === 70) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        } else if (lvl === 50) {
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        } else {
          ctx.strokeStyle = '#e2e8f0';
        }
        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(padLeft + plotW, yPos);
        ctx.stroke();
        ctx.restore();

        ctx.fillText(`${lvl}`, padLeft + plotW + 4, yPos + 3);
      }

      // 1. Vẽ WMA45 của RSI (màu xanh dương #38bdf8)
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let startedWma = false;
      for (let i = 0; i < wmaSeries.length; i++) {
        if (wmaSeries[i] !== null) {
          const y = getY(wmaSeries[i]);
          if (!startedWma) { ctx.moveTo(getX(i), y); startedWma = true; }
          else ctx.lineTo(getX(i), y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ EMA9 của RSI (màu xanh lá #22c55e)
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let startedEma = false;
      for (let i = 0; i < emaSeries.length; i++) {
        if (emaSeries[i] !== null) {
          const y = getY(emaSeries[i]);
          if (!startedEma) { ctx.moveTo(getX(i), y); startedEma = true; }
          else ctx.lineTo(getX(i), y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // 3. Vẽ đường RSI14 (màu tím #a855f7)
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let startedRsi = false;
      for (let i = 0; i < rsiSeries.length; i++) {
        if (rsiSeries[i] !== null) {
          const y = getY(rsiSeries[i]);
          if (!startedRsi) { ctx.moveTo(getX(i), y); startedRsi = true; }
          else ctx.lineTo(getX(i), y);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Nhãn trục X (Ngày/Tuần)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      const xStep = Math.max(1, Math.floor(prices.length / 4));
      for (let i = 0; i < prices.length; i += xStep) {
        const dStr = displayBars[i]?.date || '';
        const label = dStr.length >= 7 ? dStr.substring(2, 7).replace('-', '/') : '';
        ctx.fillText(label, getX(i), h - 5);
      }

      // Đường gióng hover
      if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < prices.length) {
        const cx = getX(hoverIdx);
        ctx.save();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, padTop + plotH);
        ctx.stroke();

        // Chấm tròn nổi bật cho RSI
        if (rsiSeries[hoverIdx] !== null) {
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(cx, getY(rsiSeries[hoverIdx]), 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    // Vẽ cả 2 biểu đồ ban đầu
    drawPriceChart(null);
    drawTechChart(null);

    // Đồng bộ tương tác hover giữa 2 biểu đồ
    const syncHover = (canvasElem, isLeft) => {
      if (canvasElem._hasSyncListener) return;
      canvasElem._hasSyncListener = true;

      const padLeft = 6;
      const padRight = isLeft ? 42 : 36;

      canvasElem.addEventListener('mousemove', (e) => {
        const rect = canvasElem.getBoundingClientRect();
        const plotW = Math.max(10, rect.width - padLeft - padRight);
        const mouseX = e.clientX - rect.left;

        if (mouseX < padLeft || mouseX > padLeft + plotW || prices.length === 0) {
          if (tooltipPrice) tooltipPrice.style.display = 'none';
          if (tooltipTech) tooltipTech.style.display = 'none';
          drawPriceChart(null);
          drawTechChart(null);
          return;
        }

        const idx = Math.min(
          prices.length - 1,
          Math.max(0, Math.round(((mouseX - padLeft) / plotW) * (prices.length - 1)))
        );

        // Vẽ lại cả 2 biểu đồ với cùng đường gióng idx
        drawPriceChart(idx);
        drawTechChart(idx);

        const curBar = displayBars[idx];
        const curPrice = prices[idx];
        const curEma = emaSeries[idx];
        const curWma = wmaSeries[idx];
        const curRsi = rsiSeries[idx];
        const dateStr = curBar?.date ? curBar.date.substring(0, 10).replace(/-/g, '/') : '';
        const fmt = (v) => v !== null && v !== undefined ? Utils.formatNumber(v, 0) + ' đ' : '--';

        // Tooltip bên Giá & GTT (Chỉ giá và GTT)
        if (tooltipPrice) {
          let gttLine = '';
          if (gttSau && gttSau > 0) {
            const diff = ((curPrice - gttSau) / gttSau) * 100;
            const sign = diff >= 0 ? '+' : '';
            const cls = diff <= 0 ? 'tooltip-gtt-cheaper' : 'tooltip-gtt-higher';
            gttLine = `<div class="${cls}">So với GTT: ${sign}${diff.toFixed(1)}%</div>`;
          }

          tooltipPrice.innerHTML = `
            <div class="tooltip-title">Tuần: ${dateStr}</div>
            <div class="tooltip-price">Giá: <strong>${fmt(curPrice)}</strong></div>
            ${gttLine}
          `;
          tooltipPrice.style.display = 'block';

          const cxPrice = padLeft + (idx / Math.max(1, prices.length - 1)) * (canvasPrice.clientWidth - 48);
          let tipX = cxPrice + 10;
          if (tipX + 130 > canvasPrice.clientWidth) tipX = cxPrice - 135;
          tooltipPrice.style.left = `${Math.max(4, tipX)}px`;
          tooltipPrice.style.top = `10px`;
        }

        // Tooltip bên RSI14 + EMA9 + WMA45
        if (tooltipTech) {
          let rsiDesc = '';
          if (curRsi !== null) {
            if (curRsi >= 70) rsiDesc = ' (Quá mua)';
            else if (curRsi <= 30) rsiDesc = ' (Quá bán)';
          }

          tooltipTech.innerHTML = `
            <div class="tooltip-title">Tuần: ${dateStr}</div>
            <div class="tooltip-rsi">RSI (14): <strong>${curRsi !== null ? curRsi.toFixed(1) : '--'}${rsiDesc}</strong></div>
            <div class="tooltip-ema">EMA9: <strong>${curEma !== null ? curEma.toFixed(1) : '--'}</strong></div>
            <div class="tooltip-wma">WMA45: <strong>${curWma !== null ? curWma.toFixed(1) : '--'}</strong></div>
          `;
          tooltipTech.style.display = 'block';

          const cxTech = padLeft + (idx / Math.max(1, prices.length - 1)) * (canvasTech.clientWidth - 42);
          let tipX = cxTech + 10;
          if (tipX + 130 > canvasTech.clientWidth) tipX = cxTech - 135;
          tooltipTech.style.left = `${Math.max(4, tipX)}px`;
          tooltipTech.style.top = `10px`;
        }
      });

      canvasElem.addEventListener('mouseleave', () => {
        if (tooltipPrice) tooltipPrice.style.display = 'none';
        if (tooltipTech) tooltipTech.style.display = 'none';
        drawPriceChart(null);
        drawTechChart(null);
      });
    };

    syncHover(canvasPrice, true);
    syncHover(canvasTech, false);

    Render._lastChartData = data;
    Render._lastGttSau = gttSau;
  }
};
