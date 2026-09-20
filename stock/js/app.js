/**
 * app.js - File điều khiển chính (Entry Point)
 */

const App = {
  currentStockData: null,

  init: async () => {
    console.log("Stock Valuation App Initialized.");
    
    // 0. Validate Tokens / CORS (Health Check)
    const isHealthy = await API.validateHealth();
    if (!isHealthy) {
        const warning = document.createElement("div");
        warning.className = "text-center p-2 mb-2 bg-pink-light text-danger font-bold border border-red rounded";
        warning.innerHTML = "⚠️ CẢNH BÁO HỆ THỐNG: Mất kết nối đến dữ liệu thực (Lỗi CORS hoặc Hết hạn Token). App sẽ chạy bằng Dữ liệu giả lập (Mock Data).";
        document.body.insertBefore(warning, document.body.firstChild);
    }

    // 1. Render Dropdowns
    await App.renderDropdowns();
    
    // 2. Load dữ liệu mã đầu tiên
    const codeDrpd = document.getElementById("drpdStockCode");
    if (codeDrpd.value) {
      await App.loadStockData(codeDrpd.value);
    }
    
    // 3. Gắn sự kiện Change cho Dropdown
    codeDrpd.addEventListener("change", (e) => {
      App.loadStockData(e.target.value);
    });

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
    
    // Render Watchlist
    listDrpd.innerHTML = "";
    CONST.WATCHLISTS.forEach(item => {
      listDrpd.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
    
    // Render Mã cổ phiếu
    codeDrpd.innerHTML = "";
    const stocks = await API.getStockList();
    stocks.forEach(stock => {
      codeDrpd.innerHTML += `<option value="${stock.symbol}">${stock.symbol} - ${stock.name}</option>`;
    });
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
        warningEl.innerHTML = "⚠️ LỖI: KHÔNG THỂ LẤY DỮ LIỆU TỪ FIREANT/SIMPLIZE (TOKEN HẾT HẠN HOẶC LỖI CORS).";
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
  },


  nextStock: () => {
    const codeDrpd = document.getElementById("drpdStockCode");
    const isAutoSkip = document.getElementById("chkAutoStockNoValue")?.checked;
    
    if (codeDrpd.selectedIndex < codeDrpd.options.length - 1) {
      codeDrpd.selectedIndex += 1;
      const nextSymbol = codeDrpd.value;
      
      // Kích hoạt sự kiện change để tải dữ liệu mới
      codeDrpd.dispatchEvent(new Event("change"));
    } else {
      alert("Đã hết danh sách cổ phiếu!");
    }
  },

  handleWhitelist: (data, sumLnstSau) => {
    const chkSaveWhitelist = document.getElementById("chkSaveWhitelist");
    if (!chkSaveWhitelist || !chkSaveWhitelist.checked) return;

    // Logic whitelist: VD nếu LNST > 0 và ROE > 10% thì lưu
    if (sumLnstSau > 0 && data.roe > 10) {
      let wl = JSON.parse(localStorage.getItem(CONST.LOCAL_STORAGE_WHITELIST_KEY) || "[]");
      if (!wl.includes(data.symbol)) {
        wl.push(data.symbol);
        localStorage.setItem(CONST.LOCAL_STORAGE_WHITELIST_KEY, JSON.stringify(wl));
        console.log(`Đã lưu ${data.symbol} vào Whitelist.`);
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", App.init);
