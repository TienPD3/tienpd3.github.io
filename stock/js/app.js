/**
 * app.js - File điều khiển chính (Entry Point)
 */

const App = {
  currentStockData: null,

  init: async () => {
    console.log("Stock Valuation App Initialized.");
    
    // 0. Validate Tokens / CORS (Health Check)
    API.validateHealth().then(isHealthy => {
        if (!isHealthy) {
            const warning = document.createElement("div");
            warning.className = "text-center p-2 mb-2 bg-pink-light text-danger font-bold border border-red rounded";
            warning.innerHTML = "⚠️ CẢNH BÁO: Không thể kết nối API Fireant (Lỗi Token/CORS). Vui lòng cập nhật Token.";
            document.body.insertBefore(warning, document.body.firstChild);
        }
    });

    // 1. Render Dropdowns
    await App.renderDropdowns();
    
    // 2. Data sẽ tự động load qua renderDropdowns -> loadStocksForDropdown
    // NOTE: codeDrpd "change" listener đã gắn trong renderDropdowns, không gắn lại ở đây tránh gọi API kép

    // 4. Gắn sự kiện nút Next
    document.getElementById("btnNext").addEventListener("click", App.nextStock);
    
    // 5. Lắng nghe phím Space để Next
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "SELECT" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        App.nextStock();
      }
    });
  },

  renderDropdowns: async () => {
    const listDrpd = document.getElementById("drpdStockList");
    const codeDrpd = document.getElementById("drpdStockCode");
    
    // Khôi phục trạng thái đã chọn từ bản cũ
    let drpdSelected = {};
    try {
        drpdSelected = JSON.parse(localStorage.getItem('drpdSelected')) || {};
    } catch(e) {}
    
    // Render Watchlist từ Simplize
    listDrpd.innerHTML = "";
    const watchlists = await API.getWatchlists();
    
    let initialRules = "";
    let initialListFound = false;

    const renderOption = (item) => {
      const isSelected = drpdSelected.stockListSelected == item.id || (!drpdSelected.stockListSelected && item.id == -99);
      if (isSelected) {
          initialRules = item.rules || "";
          initialListFound = true;
      }
      return `<option value="${item.id}" data-rules='${item.rules || ""}' ${isSelected ? 'selected' : ''}>${item.name}</option>`;
    };

    let html = "";
    // 2 phần tử đầu: Tất cả, Whitelist
    for(let i=0; i<Math.min(2, watchlists.list.length); i++) {
        html += renderOption(watchlists.list[i]);
    }
    
    // Phần Ngành
    if (watchlists.list.length > 2) {
        html += `<optgroup label="Ngành">`;
        for(let i=2; i<watchlists.list.length; i++) {
            html += renderOption(watchlists.list[i]);
        }
        html += `</optgroup>`;
    }

    // Phần Bộ lọc gợi ý
    if (watchlists.suggest && watchlists.suggest.length > 0) {
        html += `<optgroup label="Bộ lọc gợi ý">`;
        for(let i=0; i<watchlists.suggest.length; i++) {
            html += renderOption(watchlists.suggest[i]);
        }
        html += `</optgroup>`;
    }
    
    listDrpd.innerHTML = html;
    
    if (!initialListFound && watchlists.list.length > 0) {
        initialRules = watchlists.list[0].rules || "";
        listDrpd.selectedIndex = 0;
    }
    
    // Khi thay đổi Bộ lọc (Ngành/Sàn)
    listDrpd.addEventListener("change", async (e) => {
      const selectedOption = listDrpd.options[listDrpd.selectedIndex];
      const rules = selectedOption.getAttribute('data-rules');
      const id = selectedOption.value;
      
      drpdSelected.stockListSelected = id;
      localStorage.setItem('drpdSelected', JSON.stringify(drpdSelected));
      
      await App.loadStocksForDropdown(rules);
    });
    
    // Khi thay đổi Mã (để lưu trạng thái)
    codeDrpd.addEventListener("change", (e) => {
      drpdSelected.stockCodeSelected = e.target.value;
      localStorage.setItem('drpdSelected', JSON.stringify(drpdSelected));
      App.loadStockData(e.target.value);
    });

    // Khởi tạo danh sách mã đầu tiên
    await App.loadStocksForDropdown(initialRules, drpdSelected.stockCodeSelected);
  },

  loadStocksForDropdown: async (rules, initialCode = null) => {
    const codeDrpd = document.getElementById("drpdStockCode");
    codeDrpd.innerHTML = "<option>Đang tải...</option>";
    codeDrpd.disabled = true;

    const stocks = await API.getStocksByRules(rules);
    
    codeDrpd.innerHTML = "";
    codeDrpd.disabled = false;
    
    let foundInitial = false;
    const optionsHtml = [];
    stocks.forEach(stock => {
      const symbol = stock.symbol || stock.ticker;
      // Dùng stockExchange từ API, nếu không có thì fallback sang name (Whitelist dùng name lưu stockExchange)
      const exchange = stock.stockExchange || stock.name || "";
      
      const isSelected = symbol === initialCode;
      if (isSelected) foundInitial = true;
      optionsHtml.push(`<option value="${symbol}" ${isSelected ? 'selected' : ''}>${symbol} - ${exchange}</option>`);
    });
    codeDrpd.innerHTML = optionsHtml.join('');

    if (codeDrpd.options.length > 0) {
      if (!foundInitial) codeDrpd.selectedIndex = 0;
      await App.loadStockData(codeDrpd.value);
    } else {
      const statusEl = document.querySelector(".status-bar");
      if (statusEl) statusEl.innerHTML = `Không có mã nào trong bộ lọc này!`;
    }
  },

  loadStockData: async (symbol) => {
    const statusEl = document.querySelector(".status-bar");
    if (statusEl) {
        statusEl.innerHTML = `Đang tải ${symbol}...`;
        statusEl.className = "status-bar";
    }

    const data = await API.getStockData(symbol);
    
    // Check if error warning exists
    let warningEl = document.getElementById("mock-warning");
    if (!warningEl) {
        warningEl = document.createElement("div");
        warningEl.id = "mock-warning";
        warningEl.className = "text-center p-2 mb-2 bg-pink-light text-danger font-bold border border-red rounded";
        const tableContainer = document.querySelector(".table-container");
        if (tableContainer) tableContainer.parentNode.insertBefore(warningEl, tableContainer);
    }
    
    if (!data) {
        if (statusEl) {
            statusEl.innerHTML = `Lỗi API - Không thể tải dữ liệu thực tế cho mã ${symbol}!`;
            statusEl.className = "status-bar bg-pink-light text-danger border border-red rounded p-1 font-bold";
        }
        warningEl.style.display = "block";
        warningEl.innerHTML = `⚠️ KHÔNG CÓ DỮ LIỆU HOẶC THIẾU BÁO CÁO TÀI CHÍNH CHO MÃ ${symbol}. Vui lòng bỏ qua mã này.`;
        
        // Vẫn kích hoạt auto next để nhảy qua mã lỗi nếu đang auto
        App.autoNextStock(false);
        return;
    }
    
    // Ẩn cảnh báo lỗi nếu load thành công
    warningEl.style.display = "none";
    
    App.currentStockData = data;

    // 1. Đổ dữ liệu Bảng Đầu Vào & Lợi nhuận
    const { sumLnstTruoc, sumLnstSau } = Render.renderInputData(data);
    
    // 2. Định giá & Tính trụ cột
    Render.renderValuation(data, sumLnstTruoc, sumLnstSau);
    
    // 3. Đánh giá Checklist
    Render.renderChecklist(data, sumLnstSau);

    if (statusEl) {
        statusEl.innerHTML = `Đã phân tích xong ${symbol}`;
        statusEl.className = "status-bar bg-green-light text-success border border-green rounded p-1 font-bold";
    }

    // 4. Lưu whitelist nếu được check
    App.handleWhitelist(data, sumLnstSau);
    
    // 5. Tự động nhảy mã nếu bật tính năng
    const isGoodStock = document.getElementById('chk-thanhcong-sau')?.innerText === 'YES';
    App.autoNextStock(isGoodStock);
  },

  sleepNext: null,

  autoNextStock: (isGoodStock) => {
    clearInterval(App.sleepNext);
    const btnNext = document.getElementById("btnNext");
    const chkAutoStockNoValue = document.getElementById("chkAutoStockNoValue");
    const chkSaveWhitelist = document.getElementById("chkSaveWhitelist");
    const codeDrpd = document.getElementById("drpdStockCode");
    
    const isLast = codeDrpd.selectedIndex >= codeDrpd.options.length - 1;

    if (chkAutoStockNoValue && chkAutoStockNoValue.checked) {
      if (chkSaveWhitelist && chkSaveWhitelist.checked) {
        let idx = 5;
        App.sleepNext = setInterval(() => {
          if (idx <= 0) {
            clearInterval(App.sleepNext);
            if (!isLast) App.nextStock();
            else btnNext.innerHTML = "Kiểm tra mã tiếp theo";
          } else {
            btnNext.innerHTML = (isGoodStock ? `Cổ phiếu cần đánh giá, tiếp tục sau ${idx}s` : `Cổ phiếu không tốt, tiếp tục sau ${idx}s`);
            btnNext.disabled = true;
          }
          idx--;
        }, 1000);
      } else {
        if (!isGoodStock) {
          let idx = 5;
          App.sleepNext = setInterval(() => {
            if (idx <= 0) {
              clearInterval(App.sleepNext);
              if (!isLast) App.nextStock();
              else btnNext.innerHTML = "Kiểm tra mã tiếp theo";
            } else {
              btnNext.innerHTML = `Cổ phiếu không tốt, tiếp tục sau ${idx}s`;
              btnNext.disabled = true;
            }
            idx--;
          }, 1000);
        } else {
           btnNext.innerHTML = "Kiểm tra mã tiếp theo";
           btnNext.disabled = isLast;
        }
      }
    } else {
      btnNext.innerHTML = "Kiểm tra mã tiếp theo";
      btnNext.disabled = isLast;
    }
  },

  nextStock: () => {
    clearInterval(App.sleepNext);
    const codeDrpd = document.getElementById("drpdStockCode");
    
    if (codeDrpd.selectedIndex < codeDrpd.options.length - 1) {
      codeDrpd.selectedIndex += 1;
      codeDrpd.dispatchEvent(new Event("change"));
    } else {
      alert("Đã hết danh sách cổ phiếu!");
    }
  },

  handleWhitelist: (data, sumLnstSau) => {
    const chkSaveWhitelist = document.getElementById("chkSaveWhitelist");
    if (!chkSaveWhitelist || !chkSaveWhitelist.checked) return;

    // Lưu nếu THÀNH CÔNG = YES
    const isGoodStock = document.getElementById('chk-thanhcong-sau')?.innerText === 'YES';
    if (isGoodStock) {
      let wl = JSON.parse(localStorage.getItem('stockValue') || "[]");
      if (!wl.some(item => item.ticker === data.symbol)) {
        wl.push({ ticker: data.symbol, stockExchange: data.symbol });
        localStorage.setItem('stockValue', JSON.stringify(wl));
        console.log(`Đã lưu ${data.symbol} vào Whitelist.`);
      }
    } else {
      let wl = JSON.parse(localStorage.getItem('stockValue') || "[]");
      const filtered = wl.filter(item => item.ticker !== data.symbol);
      if (filtered.length !== wl.length) {
          localStorage.setItem('stockValue', JSON.stringify(filtered));
          console.log(`Đã xoá ${data.symbol} khỏi Whitelist vì không đạt.`);
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", App.init);
