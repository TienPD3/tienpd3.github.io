const pathFinpath = 'https://api.finpath.vn';
const pathFireant = 'https://restv2.fireant.vn';
const pathSimplize = 'https://api.simplize.vn';
const pathCafef = 'https://e.cafef.vn';
const SIZE_DEFAULT = 5;

// Create variable
var mpYearMonthData = new Map();
var mpYearData = new Map();
var dataFACurrent = {};

/**
 * Init
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} stockName
 * @param {boolean} [isYear=false]
 * @param {*} [size=SIZE_DEFAULT]
 */
function getFinancial(stockCode, stockName, isYear = false, size = SIZE_DEFAULT) {

    mpYearMonthData = new Map();
    mpYearData = new Map();

    isBank = false;
    if (stockName.indexOf('Ngân hàng') == 0) {
        isBank = true;
    }

    // ----- Finpath - The first -----
    financialratiosFinpath(stockCode, true, size);
    financialratiosFinpath(stockCode, false, size);
    fullincomestatementsFinpath(stockCode, isBank, true, size);
    fullincomestatementsFinpath(stockCode, isBank, false, size);
    fullbalancesheetsFinpath(stockCode, true, size);
    fullbalancesheetsFinpath(stockCode, false, size);
    // shareholderstructure(stock);

    // ----- Simplize - The second -----
    financialratiosSimplize(stockCode, true, size);
    financialratiosSimplize(stockCode, false, size);

    // ----- Fireant - The thrid -----
    financialIndicatorsFireant(stockCode);
    fullbalancesheetsFireant(stockCode, true, size);
    fullbalancesheetsFireant(stockCode, false, size);
    fullincomestatementsFireant(stockCode, isBank, true, size);
    fullincomestatementsFireant(stockCode, isBank, false, size);
    // holdersFireant(stockCode); // Không sử dụng
    profileFireant(stockCode);
    historicalQuotesFireant(stockCode);
    // fundamentalFireant(stockCode); Không sử dụng

    // ----- Cafef - The four -----
    // Cafef - Lấy cổ tức
    khkdCafef(stockCode);
}

/**
 * Cafef - Lấy cổ tức
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function khkdCafef(stockCode) {
    $.ajax({
        url: '{0}/khkd.ashx?symbol={1}'.format(pathCafef, stockCode),
        async: false,
        dataType : 'json',
        type: 'GET',
        success: function(reps) {
            var dataCurrent = reps.filter(element => element.KYear == DatetimeUtils.getYear());
            dataFACurrent.dividendPercent = '0%';
            dataFACurrent.dividend = 'không có';
            if (dataCurrent.length > 0) {
                if (dataCurrent[0].Dividend !== 0) {
                    dataFACurrent.dividendPercent = dataCurrent[0].Dividend + '%';
                    dataFACurrent.dividend = 'tiền mặt';
                } else if (dataCurrent[0].DivStock !== 0) {
                    dataFACurrent.dividendPercent = dataCurrent[0].DivStock + '%';
                    dataFACurrent.dividend = 'cổ phiếu';
                }
            }
        }
    });
}

/**
 * Fireant - Cổ đông
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function holdersFireant(stockCode) {
    $.ajax({
        url: '{0}/symbols/{1}/holders'.format(pathFireant, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {

            var result = reps.reduce((partialSum, obj) => partialSum + obj.ownership * 100, 0);
            console.log(result);
        }
    });
}

/**
 * Fireant - Hồ sơ
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function profileFireant(stockCode) {
    $.ajax({
        url: '{0}/symbols/{1}/profile'.format(pathFireant, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            // Khối lượng cổ phiếu đang niêm yết
            dataFACurrent.listingVolume = reps.listingVolume/ 1000000;
        }
    });
}

/**
 * Fireant - Giá quá khứ
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function historicalQuotesFireant(stockCode) {

    if (historicalQuotes === null) {
        strLatestTGCP = null;

        $.ajax({
            url: '{0}/symbols/{1}/historical-quotes?startDate=1900-01-01&endDate={2}&offset=0&limit=1'.format(pathFireant, stockCode, DatetimeUtils.getSystemDate()),
            async: false,
            contentType: "application/json",
            dataType : 'json',
            type: 'GET',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps) {
                // Giá đóng cửa của ngày hôm nay
                dataFACurrent.priceClose = (reps[0].priceClose * 1000).toFixed();
            }
        });
    }
}

/**
 * Fireant - Tổng quan - Tổng hợp
 * 
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function fundamentalFireant(stockCode) {

    if (historicalQuotes === null) {
        strLatestTGCP = null;

        $.ajax({
            url: '{0}/symbols/{1}/fundamental'.format(pathFireant, stockCode),
            async: false,
            contentType: "application/json",
            dataType : 'json',
            type: 'GET',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps) {
                // Cổ phiếu đang lưu hành
                dataFACurrent.sharesOutstanding = reps.sharesOutstanding / 1000000;
            }
        });
    }
}

/**
 * Fireant - Chỉ số
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 */
function financialIndicatorsFireant(stockCode) {
    $.ajax({
        url: '{0}/symbols/{1}/financial-indicators'.format(pathFireant, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            
            $.each(reps, function(idx, obj) {
                // P/E (Price to Earning per share) là tỷ lệ giữa giá thị trường và lợi nhuận ròng trên mỗi cổ phiếu.
                setValueFinancialIndicatorsFireant('P/E', 'PE', obj);
                // P/B (Price to Book value per share) là tỷ lệ giữa giá thị trường và giá trị sổ sách trên mỗi cổ phiếu.
                setValueFinancialIndicatorsFireant('P/B', 'PB', obj);
                // Tỷ lệ lãi ròng hay còn gọi là biên lợi nhuận sau thuế (Net profit margin) được tính bằng tỷ lệ giữa lợi nhuận sau thuế và doanh thu thuần.
                setValueFinancialIndicatorsFireant('%Lãi ròng', 'netProfitMargin', obj);
                // Tỷ lệ lãi gộp hay biên lợi nhuận gộp (Gross margin), được tính bằng tỷ lệ giữa lợi nhuận gộp và doanh thu thuần.
                setValueFinancialIndicatorsFireant('%Lãi gộp', 'grossMargin', obj);
                // ROA (Return on Assets) là hệ số lợi nhuận trên tài sản, được tính bằng tỷ lệ giữa lợi nhuận sau thuế và tổng tài sản.
                setValueFinancialIndicatorsFireant('ROA', 'ROA', obj);
                // ROE (Return on Equity) là hệ số lợi nhuận trên vốn chủ sở hữu, được tính bằng tỷ lệ giữa lợi nhuận sau thuế và tổng nguồn vốn chủ sở hữu.
                setValueFinancialIndicatorsFireant('ROE', 'ROE', obj);
                // ROIC (Return on invested Capital) là hệ số lợi nhuận trên vốn đầu tư, được tính bằng tỷ lệ giữa EBIT*(1-thuế suất) và vốn đầu tư.
                setValueFinancialIndicatorsFireant('ROIC', 'ROIC', obj);
                // Hệ số nợ trên vốn chủ sở hữu (Debt On Equity), được tính bằng tỷ lệ giữa tổng nợ phải trả và tổng nguồn vốn chủ sở hữu.
                setValueFinancialIndicatorsFireant('Nợ/VCSH', 'debtOnEquity', obj);
            });
        }
    });
}

/**
 * Set value financial indicators fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} getName
 * @param {*} setName
 * @param {*} obj
 */
function setValueFinancialIndicatorsFireant(getName, setName, obj) {
    if (obj.shortName === getName) {
        dataFACurrent[setName] = obj.value;
    }
}

/**
 * Finpath - Phân tích tài chính
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
function financialratiosFinpath(stockCode, isYear, size) {

    $.ajax({
        url: '{0}/api/stocks/financialratios/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {

            var dataReps = null;
            if (isYear) {
                dataReps = reps.data.yearlyProfits;
            } else {
                dataReps = reps.data.quarterlyProfits;
            }

            $.each(dataReps, function(idx, obj) {
                if (idx < size) {
                    
                    var key = '';
                    var data = {};
                    if (isYear) {
                        // Lấy theo Quý
                        key = '{0}'.format(obj.yearReport);
                        data = mpYearData.get(key) || {};
                    } else {
                        // Lấy theo Năm
                        key = '{0}/Q{1}'.format(obj.yearReport, obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }

                    // EPS
                    data.EPS = {new: obj.eps, old: ''};
                    // P/B
                    data.PB = {new: obj.pb, old: ''};
                    // P/E
                    data.PE = {new: obj.pe, old: ''};

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
}

/**
 * Simplize - Chỉ số tài chính
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
function financialratiosSimplize(stockCode, isYear, size) {

    $.ajax({
        url: '{0}/api/company/fi/ratio//{1}?period={2}&size={3}'.format(pathSimplize, stockCode, isYear? 'Y': 'Q', isYear? 3: 12),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization: ACCESS_TOKEN_SIMPLIZE
        },
        success: function(reps) {
            $.each(reps.data.items, function(idx, obj) {
                if (idx < size) {
                    // op2: P/B
                    setValueSimplize(obj, 'PB', 'op2', isYear);
                    // op1: P/E
                    setValueSimplize(obj, 'PE', 'op1', isYear);
                    // op4: EPS
                    setValueSimplize(obj, 'EPS', 'op4', isYear);
                }
            });
        }
    });
}

/**
 * Finpath - Báo cáo tài chính - Kết quả kinh doanh
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isBank
 * @param {*} isYear
 * @param {*} size
 */
function fullincomestatementsFinpath(stockCode, isBank, isYear, size) {

    $.ajax({
        url: '{0}/api/stocks/fullincomestatements/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {

            var dataReps = null;
            if (isYear) {
                dataReps = reps.data.yearlys;
            } else {
                dataReps = reps.data.quarterlys;
            }

            $.each(dataReps, function(idx, obj) {
                if (idx < size) {
                    
                    var key = '';
                    var data = {};
                    if (isYear) {
                        // Lấy theo Quý
                        key = '{0}'.format(obj.yearReport);
                        data = mpYearData.get(key) || {};
                    } else {
                        // Lấy theo Năm
                        key = '{0}/Q{1}'.format(obj.yearReport, obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }

                    // Kiểm tra xem có phải thuộc mã Ngân hàng không?
                    if (isBank) {
                        // isb25: Thu nhập lãi và các khoản thu nhập tương tự - Danh thu thuần
                        data.netRevenue = {new: obj.isb25, old: ''};
                        // isb27: Thu nhập lãi thuần - Lợi nhuận gộp
                        data.grossProfit = {new: obj.isb27, old: ''};
                        // isb38: Dòng tiền từ HĐKD - Tổng thu nhập từ hoạt động
                        data.netIncomeStatement = {new: obj.isb38, old: ''};
                    } else {
                        // isa3: Doanh số thuần - Danh thu thuần
                        data.netRevenue = {new: obj.isa3, old: ''};
                        // isa5: Lãi gộp - Lợi nhuận gộp
                        data.grossProfit = {new: obj.isa5, old: ''};
                        // isa11: Dòng tiền từ HĐKD - Lãi/(lỗ) từ hoạt động kinh doanh
                        data.netIncomeStatement = {new: obj.isa11, old: ''};
                    }
                    
                    // isa22: Lợi nhuận của Cổ đông của Công ty mẹ - Lợi nhuận sau thuế
                    data.LNST = {new: obj.isa22, old: ''};

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
}

/**
 * Fireant - Tài chính - Kết quả kinh doanh
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isBank
 * @param {*} isYear
 * @param {*} size
 */
function fullincomestatementsFireant(stockCode, isBank, isYear, size) {

    $.ajax({
        // type: Loại báo cáo (1: Cân đối kế toán, 2: Kết quả SXKD, 3: Lưu chuyển tiền tệ trực tiếp, 4: Lưu chuyển tiền tệ gián tiếp)
        // year: Năm lấy báo cáo
        // quarter: Quý lấy báo cáo
        // limit: Số lượng tối đa bản ghi lấy về (Mặc địch là SIZE_DEFAULT)
        url: '{0}/symbols/{1}/full-financial-reports?type=2&year={2}&quarter={3}&limit={4}'.format(pathFireant, stockCode, DatetimeUtils.getYear(), isYear? 0: 1, size),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization: ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            var mpData = arrayToMapFireant(reps);
  
            if (isBank) {
                // Doanh thu thuần
                setValueFireant(mpData, 'Thu nhập từ lãi và các khoản thu nhập tương tự', 'netRevenue', isYear);
                // Lợi nhuận gộp
                setValueFireant(mpData, 'Thu nhập lãi thuần', 'grossProfit', isYear);
                // Lợi nhuận thuần từ hoạt động kinh doanh
                setValueFireant(mpData, 'Tổng lợi nhuận trước thuế', 'netIncomeStatement', isYear);
                // Lợi nhuận sau thuế
                setValueFireant(mpData, 'Lợi nhuận sau thuế thu nhập doanh nghiệp', 'LNST', isYear);
            } else {
                // Doanh thu thuần
                setValueFireant(mpData, 'Doanh thu thuần', 'netRevenue', isYear);
                // Lợi nhuận gộp
                setValueFireant(mpData, 'Lợi nhuận gộp', 'grossProfit', isYear);
                // Lợi nhuận thuần từ hoạt động kinh doanh
                setValueFireant(mpData, 'Lợi nhuận thuần từ hoạt động kinh doanh', 'netIncomeStatement', isYear);
                // Lợi nhuận sau thuế
                setValueFireant(mpData, 'Lợi nhuận sau thuế của cổ đông của công ty mẹ', 'LNST', isYear);
            }
        }
    });
}

/**
 * Finpath - Báo cáo tài chính - Cân đối kế toán
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
function fullbalancesheetsFinpath(stockCode, isYear, size) {
    
    $.ajax({
        url: '{0}/api/stocks/fullbalancesheets/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {

            var dataReps = null;
            if (isYear) {
                dataReps = reps.data.yearlys;
            } else {
                dataReps = reps.data.quarterlys;
            }
            
            $.each(dataReps, function(idx, obj) {
                if (idx < size) {

                    var key = '';
                    var data = {};
                    if (isYear) {
                        // Lấy theo Quý
                        key = '{0}'.format(obj.yearReport);
                        data = mpYearData.get(key) || {};
                    } else {
                        // Lấy theo Năm
                        key = '{0}/Q{1}'.format(obj.yearReport, obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }
                    // bsa53: TỔNG CỘNG TÀI SẢN
                    data.TTS = {new: obj.bsa53, old: ''};
                    // bsa54: NỢ PHẢI TRẢ
                    data.NO = {new: obj.bsa54, old: ''};
                    // bsa78: VỐN CHỦ SỞ HỮU
                    data.ownerEquity = {new: obj.bsa78, old: ''};

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
}

/**
 * Fireant - Tài chính - Cân đối kế toán
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} stockCode
 * @param {*} isYear
 * @param {*} size
 */
function fullbalancesheetsFireant(stockCode, isYear, size) {

    $.ajax({
        // type: Loại báo cáo (1: Cân đối kế toán, 2: Kết quả SXKD, 3: Lưu chuyển tiền tệ trực tiếp, 4: Lưu chuyển tiền tệ gián tiếp)
        // year: Năm lấy báo cáo
        // quarter: Quý lấy báo cáo
        // limit: Số lượng tối đa bản ghi lấy về (Mặc địch là SIZE_DEFAULT)
        url: '{0}/symbols/{1}/full-financial-reports?type=1&year={2}&quarter={3}&limit={4}'.format(pathFireant, stockCode, DatetimeUtils.getYear(), isYear? 0: 1, size),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            var mpData = arrayToMapFireant(reps);

            // TỔNG CỘNG TÀI SẢN
            setValueFireant(mpData, 'TỔNG CỘNG TÀI SẢN', 'TTS', isYear);
            // Nợ phải trả
            setValueFireant(mpData, 'Nợ phải trả', 'NO', isYear);
            // Nợ dài hạn
            setValueFireant(mpData, 'Nợ dài hạn', 'longTermDebt', isYear);
            // Nguồn vốn chủ sở hữu
            setValueFireant(mpData, 'Nguồn vốn chủ sở hữu', 'ownerEquity', isYear);
        }
    });
}

/**
 * Convvert array to map of Fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} input
 * @return {*}
 */
function arrayToMapFireant(input) {
    const map = new Map();
    for (let obj of input) {
        let arrName = obj.name.split('.');
        let name = ''
        if (arrName.length == 1) {
            name = obj.name.replace(/-|\(\d+\)|\+/g, '').trim();
        } else {
            name = arrName[1].replace(/-|\(\d+\)|\+/g, '').trim();
        }
        map.set(name, obj.values);
      }
    return map;
}

/**
 * Set value of Fireant
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} mpData
 * @param {*} mpKey
 * @param {*} set
 * @param {*} isYear
 */
function setValueFireant(mpData, mpKey, set, isYear) {

    mpData.get(mpKey).forEach(obj => {
        var key = '';
        var data = {};
        if (isYear) {
            // Lấy theo Quý
            key = '{0}'.format(obj.year);
            data = mpYearData.get(key) || {};
        } else {
            // Lấy theo Năm
            key = '{0}/Q{1}'.format(obj.year, obj.quarter);
            data = mpYearMonthData.get(key) || {};
        }

        if (data[set] === undefined) {
            data[set] = {new: obj.value, old: ''};
        } else if (data[set].new !== obj.value) {
            data[set] = {new: obj.value, old: data[set].new};
        }

        if (isYear) {
            mpYearData.set(key, data)
        } else {
            mpYearMonthData.set(key, data)
        }
    });
}

/**
 * Set value of Simplize
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @param {*} obj
 * @param {*} set
 * @param {*} get
 * @param {*} isYear
 */
function setValueSimplize(obj, set, get, isYear) {

    var key = '';
    var data = {};
    if (isYear) {
        // Lấy theo Quý
        key = '{0}'.format(obj.periodDate);
        data = mpYearData.get(key) || {};
    } else {
        // Lấy theo Năm
        var arrPeriodDate = obj.periodDateName.split('/');
        key = '{0}/{1}'.format(arrPeriodDate[1], arrPeriodDate[0]);
        data = mpYearMonthData.get(key) || {};
    }

    if (data[set] === undefined) {
        data[set] = {new: obj[get], old: ''};
    } else if (data[set].new !== obj[get]) {
        data[set] = {new: obj[get], old: data[set].new};
    }

    if (isYear) {
        mpYearData.set(key, data)
    } else {
        mpYearMonthData.set(key, data)
    }
}