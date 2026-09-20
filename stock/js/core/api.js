/**
 * api.js - Xử lý Fetch API (Fireant, Cafef, Simplize)
 * Tự động Fallback về Mock Data nếu Token hết hạn hoặc bị lỗi CORS.
 */

const FIREANT_TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxOTc0MDQ3ODkwLCJuYmYiOjE2NzQwNDc4OTAsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiN2RiZDEzZC1lZGFhLTQ4ZWQtOGM1YS1iYmI3NzUxZjFhZTMiLCJhdXRoX3RpbWUiOjE2NzQwNDc4ODksImlkcCI6Ikdvb2dsZSIsIm5hbWUiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJzZWN1cml0eV9zdGFtcCI6ImE3N2ZhZTY1LWQ5YzctNGYxMS1iZGVmLWI2MzNkMWFlZmM4NiIsImp0aSI6IjEzMGFhNTFhZDUyMWE4NTZiNTJkMTEyYjJiOTFiOWVjIiwiYW1yIjpbImV4dGVybmFsIl19.txx7fO_78xSzbtt605WQl9aMxn8ao8K5bkjes-sPPFCZNScq0EjgwU1fbiYwNRevzp1K6I9j_5Cyz1Z3cl3BKruX68aQ1I_H6CaO_whmiASL5WSCBpdrH0tBNehWE6hav4g_NNMNOjMNILirvSwB4hzuOSaqApCYJFOBTQU96ycgyxRkij3HuU4WL_6Ph22irDTyVHt13GfzAra3NBj06XAaqE6Kx5dBcciVTnpyk9GStz6GUt-yINzAveTp7EC6AUU1-QHnn2Ood8SMVC5H6vvI3O29_Ag9e5b0yfHFxjhgYzbcD2khowSiT7lgCoqYwKzq3A6jwQYKZ5MZ0sR7xA";
const SIMPLIZE_TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwidWlkIjo5NDc0LCJzaWQiOiIyNGRlN2I0MS03M2NlLTQzOGUtOTlmNC05OGQ1YjhmMjNiOTMiLCJwZSI6ZmFsc2UsImV4cCI6MTY5MTc2MTQzMn0.sdZrprpCZQE3IB2WZmG_doFMDzkftI9StZEO2OFj6Tr4obwWl-etGAncAI1G8Akaciz9JuXTbtICBYqeNBTnaw";

const API = {
  getWatchlists: async () => {
    try {
        const cacheKey = "WATCHLISTS_CACHE";
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch(e) {}
        
        if (cached && cached.list) {
            // Chạy ngầm fetch để update cache cho lần sau (stale-while-revalidate)
            Promise.all([
                fetch(`dummy/simplize-screener-list.json?cache=${new Date().getTime()}`),
                fetch(`dummy/simplize-screener-suggest.json?cache=${new Date().getTime()}`)
            ]).then(async ([resList, resSuggest]) => {
                if (resList.ok && resSuggest.ok) {
                    const listJson = await resList.json();
                    const suggestJson = await resSuggest.json();
                    localStorage.setItem(cacheKey, JSON.stringify({
                        list: listJson.data.sort((a, b) => a.id - b.id),
                        suggest: suggestJson.data
                    }));
                }
            }).catch(e => {});
            return cached;
        }

        const [resList, resSuggest] = await Promise.all([
            fetch(`dummy/simplize-screener-list.json?cache=${new Date().getTime()}`),
            fetch(`dummy/simplize-screener-suggest.json?cache=${new Date().getTime()}`)
        ]);
        const listJson = resList.ok ? await resList.json() : { data: CONST.WATCHLISTS };
        const suggestJson = resSuggest.ok ? await resSuggest.json() : { data: [] };
        
        const listData = listJson.data.sort((a, b) => a.id - b.id);
        const result = { list: listData, suggest: suggestJson.data };
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch(e) {}
        
        return result;
    } catch (e) {
        return { list: CONST.WATCHLISTS, suggest: [] };
    }
  },

  getStocksByRules: async (rules) => {
    try {
        if (!rules || rules === "") {
            // Whitelist
            let wl = JSON.parse(localStorage.getItem('stockValue') || "[]");
            if (wl.length === 0) return CONST.STOCKS; // fall back
            // Chuyển array object thành chuẩn
            return wl.map(item => ({ symbol: item.ticker, ticker: item.ticker, name: item.stockExchange || item.ticker }));
        }

        // Dùng toàn bộ rules string làm cache key để tránh collision giữa các bộ lọc
        const cacheKey = "STOCK_RULES_CACHE_" + rules;
        let cached = null;
        try {
            cached = JSON.parse(localStorage.getItem(cacheKey));
        } catch(e) {}
        if (cached && cached.length > 0) return cached;

        const res = await fetch("https://api.simplize.vn/api/company/screener/filter", {
            method: 'POST',
            headers: {
                "Authorization": SIMPLIZE_TOKEN,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                page: 0,
                size: 9999,
                rules: rules
            })
        });
        if (!res.ok) return CONST.STOCKS;
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
            try { localStorage.setItem(cacheKey, JSON.stringify(data.data)); } catch(e) {}
            return data.data; // array of stocks
        }
        return CONST.STOCKS;
    } catch (e) {
        return CONST.STOCKS;
    }
  },

  getStockList: async () => {
    return CONST.STOCKS;
  },

  validateHealth: async () => {
    try {
      const res = await fetch(`https://restv2.fireant.vn/symbols/FPT/fundamental`, {
        headers: { "Authorization": FIREANT_TOKEN }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  fetchAPI: async (url, token = null) => {
    try {
      const headers = {};
      if (token) headers["Authorization"] = token;
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getStockData: async (symbol) => {
    console.log(`Đang tải TOÀN BỘ dữ liệu thực tế cho mã ${symbol}...`);
    
    const today = new Date().toISOString();
    
    const fetchReport = async (urlQ, urlY) => {
      let data = await API.fetchAPI(urlQ, FIREANT_TOKEN);
      if (!data || !data.rows || data.rows.length === 0) {
        data = await API.fetchAPI(urlY, FIREANT_TOKEN);
      }
      return data;
    };
    
    // Gọi song song các API cùng lúc
    const [priceData, fundData, indData, isData, bsData, cafefData, simplizeData, holderData, profileData] = await Promise.all([
      API.fetchAPI(`https://restv2.fireant.vn/symbols/${symbol}/historical-quotes?startDate=2020-01-01&endDate=${today}&offset=0&limit=1`, FIREANT_TOKEN),
      API.fetchAPI(`https://restv2.fireant.vn/symbols/${symbol}/fundamental`, FIREANT_TOKEN),
      API.fetchAPI(`https://restv2.fireant.vn/symbols/${symbol}/financial-indicators`, FIREANT_TOKEN),
      fetchReport(
        `https://restv2.fireant.vn/symbols/${symbol}/financial-reports?type=IS&period=Q&compact=false&offset=0&limit=5`,
        `https://restv2.fireant.vn/symbols/${symbol}/financial-reports?type=IS&period=Y&compact=false&offset=0&limit=5`
      ),
      fetchReport(
        `https://restv2.fireant.vn/symbols/${symbol}/financial-reports?type=BS&period=Q&compact=false&offset=0&limit=5`,
        `https://restv2.fireant.vn/symbols/${symbol}/financial-reports?type=BS&period=Y&compact=false&offset=0&limit=5`
      ),
      API.fetchAPI(`https://e.cafef.vn/khkd.ashx?symbol=${symbol}`),
      API.fetchAPI(`https://api.simplize.vn/api/company/analysis-metrics-detail/${symbol}`, SIMPLIZE_TOKEN),
      API.fetchAPI(`https://restv2.fireant.vn/symbols/${symbol}/holder-transactions?startDate=&endDate=&executedOnly=false&offset=0&limit=1`, FIREANT_TOKEN),
      API.fetchAPI(`https://restv2.fireant.vn/symbols/${symbol}/profile`, FIREANT_TOKEN)
    ]);

    if (!priceData || !isData || isData.length === 0 || !isData.rows) {
      console.error(`Không có dữ liệu BCTC (Quý hoặc Năm) cho mã ${symbol}. Sẽ tự động bỏ qua.`);
      return null;
    }

    try {
      // 1. Thị giá & Fundamental
      const marketPrice = (priceData[0]?.priceClose || 0) * 1000;
      const slcp = (profileData?.listingVolume || fundData?.sharesOutstanding || 0) / 1000000;

      // 2. Indicators (ROE, ROA, Biên lãi)
      const getIndFlexible = (keys) => {
          if (!indData) return 0;
          const found = indData.find(i => keys.some(k => {
              const kClean = k.toLowerCase().replace(/\//g, '').replace(/ /g, '');
              const sClean = i.shortName ? i.shortName.toLowerCase().replace(/\//g, '').replace(/ /g, '') : '';
              const nClean = i.name ? i.name.toLowerCase().replace(/\//g, '').replace(/ /g, '') : '';
              return sClean.includes(kClean) || nClean.includes(kClean);
          }));
          return found ? found.value : 0;
      };
      const getInd = (shortName) => (indData || []).find(i => i.shortName === shortName)?.value || 0;
      const roe = getIndFlexible(['roe']);
      const roa = getIndFlexible(['roa']);
      const tyLeLaiGop = getIndFlexible(['lãi gộp', 'gos', 'gross']);
      const tyLeLaiRong = getIndFlexible(['lãi ròng', 'npm', 'net margin']);
      const pe = getIndFlexible(['pe']);
      const pb = getIndFlexible(['pb']);
      const roic = getIndFlexible(['roic']);

      // 3. LNST & HDKD
      let lnstRow = isData.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'netprofit');
      if (!lnstRow && isData.rows.length >= 4) lnstRow = isData.rows[3];
      
      let hdkdRow = isData.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'operatingprofit');
      if (!hdkdRow && isData.rows.length >= 3) hdkdRow = isData.rows[2];
      
      let lngRow = isData.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'grossprofit');
      if (!lngRow && isData.rows.length >= 2) lngRow = isData.rows[1];
      
      let dttRow = isData.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'sales');
      if (!dttRow && isData.rows.length >= 1) dttRow = isData.rows[0];

      // Fireant trả về: columns[0]=Name, columns[1]=ID, columns[2]=Q0(mới nhất), columns[3]=Q1...
      // Tự động tìm các cột có chứa quarter và year
      const periods = [];
      for (let i = 0; i < isData.columns.length; i++) {
          const col = isData.columns[i];
          if (col && typeof col === 'object' && col.year && col.quarter) {
              periods.push({ index: i, quarter: col.quarter, year: col.year });
          } else if (typeof col === 'string') {
              const str = col.replace('Q', '').trim();
              const parts = str.split('/');
              if (parts.length === 2 && parseInt(parts[1]) > 2000) {
                 periods.push({ index: i, quarter: parseInt(parts[0]), year: parseInt(parts[1]) });
              } else if (parts.length === 1 && parseInt(parts[0]) > 2000) {
                 periods.push({ index: i, quarter: 0, year: parseInt(parts[0]) });
              }
          }
      }
      
      // periods[0] là mới nhất (Q0), periods[1..4] là Q1..Q4
            // Fireant có thể trả về lẫn lộn hoặc từ cũ đến mới. Ta phải sort lại từ MỚI NHẤT -> CŨ NHẤT.
      periods.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.quarter - a.quarter;
      });

      const pLatest = periods[0];
      const latestLnst = {
          quarter: pLatest.quarter,
          year: pLatest.year,
          value: (lnstRow?.[pLatest.index] || 0) / 1000000000
      };

      const lnst4Quarters = [];
      // Lấy 4 quý cũ (Q1 -> Q4) (index 1 -> 4 trong mảng periods)
      for (let i = 1; i <= 4; i++) {
          if (periods[i]) {
              lnst4Quarters.push({
                  quarter: periods[i].quarter,
                  year: periods[i].year,
                  value: (lnstRow?.[periods[i].index] || 0) / 1000000000
              });
          }
      }
      
      // Lúc này lnst4Quarters = [Q1, Q2, Q3, Q4].
      // Do trong code render.js chúng ta gán: sumLnstTruoc = sum(Q4+Q3+Q2+Q1) => data truyền vào phải là [Q4, Q3, Q2, Q1].
      // Vậy reverse() một lần để đảo thành [Q4, Q3, Q2, Q1]
      lnst4Quarters.reverse();

      const lnHdkd = hdkdRow && periods.length > 0 ? (hdkdRow[periods[0].index] / 1000000000) : 0;
      
      // Tăng trưởng LN Gộp và Doanh thu (Q_latest vs Q_last_year)
      let tangTruongLng = 0;
      let tangTruongDtt = 0;
      let dttDesc = "--";
      let lngDesc = "--";
      
      // Kiểm tra tăng đều 4 quý liên tiếp (q1_oldest -> q2 -> q3 -> q4_newest không có quý nào giảm)
      let isTangDeuDtt = false;
      let isTangDeuLng = false;
      
      if (periods.length >= 4) {
          const formatNum = (num) => Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          const getTrendHtml = (q1, q2, q3, q4) => {
              const fmt = (val, prev) => val < prev ? `<span class="text-danger font-bold">${formatNum(val)}</span>` : formatNum(val);
              return `${formatNum(q1)} ➔ ${fmt(q2, q1)} ➔ ${fmt(q3, q2)} ➔ ${fmt(q4, q3)}`;
          };
          
          if (lngRow) {
              const q1 = (lngRow[periods[3].index] || 0) / 1000000000; // Oldest
              const q2 = (lngRow[periods[2].index] || 0) / 1000000000;
              const q3 = (lngRow[periods[1].index] || 0) / 1000000000;
              const q4 = (lngRow[periods[0].index] || 0) / 1000000000; // Newest
              lngDesc = getTrendHtml(q1, q2, q3, q4);
              // Tăng đều: mỗi quý phải >= quý trước (không được giảm)
              isTangDeuLng = (q2 >= q1) && (q3 >= q2) && (q4 >= q3);
          }
          if (dttRow) {
              const q1 = (dttRow[periods[3].index] || 0) / 1000000000; // Oldest
              const q2 = (dttRow[periods[2].index] || 0) / 1000000000;
              const q3 = (dttRow[periods[1].index] || 0) / 1000000000;
              const q4 = (dttRow[periods[0].index] || 0) / 1000000000; // Newest
              dttDesc = getTrendHtml(q1, q2, q3, q4);
              // Tăng đều: mỗi quý phải >= quý trước (không được giảm)
              isTangDeuDtt = (q2 >= q1) && (q3 >= q2) && (q4 >= q3);
          }
      }
      
      if (periods.length >= 5) {
          const idxLatest = periods[0].index;
          const idxLastYear = periods[4].index; // Quý cùng kỳ năm ngoái (vì có 5 quý)
          
          if (lngRow && lngRow[idxLatest] !== undefined && lngRow[idxLastYear] !== undefined && lngRow[idxLastYear] !== 0) {
              tangTruongLng = ((lngRow[idxLatest] - lngRow[idxLastYear]) / Math.abs(lngRow[idxLastYear])) * 100;
          }
          
          if (dttRow && dttRow[idxLatest] !== undefined && dttRow[idxLastYear] !== undefined && dttRow[idxLastYear] !== 0) {
              tangTruongDtt = ((dttRow[idxLatest] - dttRow[idxLastYear]) / Math.abs(dttRow[idxLastYear])) * 100;
          }
      }

      // 4. VCSH & Nợ dài hạn
      let vcshRow = bsData?.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'equity');
      
      let vcsh = 0;
      let isVcshTangDeu = false;
      let vcshDesc = "--";
      let vcshQuarters = [];
      if (vcshRow && periods.length > 0) {
          vcsh = (vcshRow[periods[0].index] || 0) / 1000000000;
          if (periods.length >= 4) {
              const q1 = (vcshRow[periods[3].index] || 0) / 1000000000; // Oldest
              const q2 = (vcshRow[periods[2].index] || 0) / 1000000000;
              const q3 = (vcshRow[periods[1].index] || 0) / 1000000000;
              const q4 = (vcshRow[periods[0].index] || 0) / 1000000000; // Newest
              
              isVcshTangDeu = (q1 <= q2) && (q2 <= q3) && (q3 <= q4);
              vcshQuarters = [q1, q2, q3, q4];
              
              const formatNum = (num) => Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              vcshDesc = `${formatNum(q1)} ➔ ${formatNum(q2)} ➔ ${formatNum(q3)} ➔ ${formatNum(q4)}`;
          }
      }

      let ndhRow = bsData?.rows.find(r => r[1] && r[1].toString().toLowerCase() === 'longtermliability');
      const ndh = ndhRow && periods.length > 0 ? (ndhRow[periods[0].index] / 1000000000) : 0;
      const vcsh_ndh = (ndh > 0) ? (vcsh / ndh) : (vcsh > 0 ? 99 : 0);

      // 5. Cổ tức từ CafeF
      let dividendRate = 0;
      if (cafefData && cafefData.length > 0) {
          const currentYear = new Date().getFullYear();
          const filterData = cafefData.filter(e => e.KYear === currentYear || e.KYear === currentYear - 1);
          if (filterData.length > 0) {
              dividendRate = filterData[0].Dividend !== 0 ? filterData[0].Dividend : filterData[0].DivStock;
          }
      }

      // 6. Định giá Simplize
      let simplizeValue = 0;
      if (simplizeData && simplizeData.data && simplizeData.data.combined) {
          simplizeValue = simplizeData.data.combined.overallIntrinsicValue || 0;
      }

      // 7. Ban lãnh đạo mua bán (Holder Transactions)
      let bldMuaBan = 0; // 0 = Bán (hoặc không đạt), 1 = Mua (Đạt)
      let bldDesc = "--";
      if (holderData && holderData.length > 0) {
          const elm = holderData[0];
          bldMuaBan = (elm.type === 0) ? 1 : 0;
          
          let actionText = (elm.type === 1) ? 'BÁN' : 'MUA';
          let actionColor = (elm.type === 1) ? 'text-danger' : 'text-success';
          let vol = (elm.registeredVolume || elm.executionVolume || 0).toLocaleString('en-US');
          
          const fmtDate = (d) => d && d.length >= 10 ? d.substring(0, 10).replace(/-/g, "/") : null;
          const startDate = fmtDate(elm.startDate);
          const endDate = fmtDate(elm.endDate);
          const executionDate = fmtDate(elm.executionDate);
          
          // Dòng 1: Loại giao dịch + khối lượng
          let prefix = elm.executionVolume === null ? 'Đăng ký' : 'Đã';
          let line1 = `<span class="${actionColor} font-bold">${prefix} ${actionText}</span>: ${vol} cổ phiếu`;
          // Dòng 2: Thời gian đăng ký (startDate ~ endDate)
          let line2 = (startDate && endDate) ? `Đăng ký: ${startDate} ~ ${endDate}` : '';
          // Dòng 3: Ngày thực hiện (executionDate)
          let line3 = executionDate ? `Thực hiện: ${executionDate}` : '';
          
          bldDesc = [line1, line2, line3].filter(Boolean).join('\n');
      } else {
          bldMuaBan = null; // N/A
          bldDesc = "Không có giao dịch gần đây";
      }

      return {
        symbol: symbol,
        name: profileData?.companyName || fundData?.companyName || symbol,
        marketPrice: marketPrice,
        dividendRate: dividendRate,
        slcp: slcp,
        vcsh: vcsh,
        vcshQuarters: vcshQuarters,
        lnst4Quarters: lnst4Quarters,
        lnstLatest: latestLnst,
        simplizeValue: simplizeValue,
        tangTruongLng: tangTruongLng,
        vcsh_ndh: vcsh_ndh,
        lnHdkd: lnHdkd,
        roe: roe,
        tyLeLaiGop: tyLeLaiGop,
        tyLeLaiRong: tyLeLaiRong,
        roa: roa,
        pe: pe,
        pb: pb,
        roic: roic,
        tangTruongDtt: tangTruongDtt,
        isTangDeuDtt: isTangDeuDtt,
        dttDesc: dttDesc,
        lngDesc: lngDesc,
        isTangDeuLng: isTangDeuLng,
        ndh: ndh,
        bldMuaBan: bldMuaBan,
        bldDesc: bldDesc,
        isVcshTangDeu: isVcshTangDeu,
        vcshDesc: vcshDesc,
        moHinh: null // Manual criteria
      };
    } catch (e) {
      console.error("Lỗi khi parse dữ liệu:", e);
      return null;
    }
  }
};
