/**
 * utils.js - Các hàm tiện ích dùng chung
 * KHÔNG dùng thư viện ngoài (Vanilla JS)
 */

const Utils = {
  // Format số tiền (vd: 1234567 -> "1,234,567")
  formatNumber: (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    
    // Nếu là số nguyên hoặc user muốn hiện 0 số thập phân
    if (decimals === 0 || Number.isInteger(num)) {
      return Math.round(num).toLocaleString('en-US');
    }
    
    // Format 2 số thập phân
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  },

  // Format phần trăm (vd: 0.123 -> "12.30%")
  formatPercent: (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    const val = Number(num);
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    }) + "%";
  },

  // Xử lý ngày tháng (thay thế moment.js)
  // Input: format YYYY-MM-DD hoặc ISO
  formatDate: (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch (e) {
      return dateStr;
    }
  },

  // Trả về Quý và Năm từ YYYY/MM (VD: Quý 2/2025)
  getQuarterYear: (year, quarter) => {
    return quarter > 0 ? `Q${quarter}/${year}` : `${year}`;
  }
};
