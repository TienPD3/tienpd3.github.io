var pathFinpath = 'https://api.finpath.vn';
var pathFireant = 'https://restv2.fireant.vn';

// Create variable
const lstYearMonth = new Set();
const mpYearMonthData = new Map();
const lstYear = new Set();
const mpYearData = new Map();
const SIZE_DEFAULT = 5

getFinancial = function(stockCode, size = SIZE_DEFAULT) {
    // Finpath - The first
    financialratios(stockCode, size);
    fullincomestatementsFinpath(stockCode, size);
    fullbalancesheetsFinpath(stockCode, size);
    // Fireant - The second
    fullbalancesheetsFireant(stockCode, size);
    fullincomestatementsFireant(stockCode, size);
}

// Finpath - Phân tích tài chính
financialratios = function(stockCode, size) {

    $.ajax({
        url: '{0}/api/stocks/financialratios/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {
            $.each(reps.data.quarterlyProfits, function(idx, obj) {
                if (idx < size) {
                    var keyYearMonth = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                    lstYearMonth.add(keyYearMonth);

                    var data = mpYearMonthData.get(keyYearMonth) || {};
                    // BV
                    
                    // P/B - OK
                    data.PB = {new: obj.pb, old: null};
                    // P/E - OK
                    data.PE = {new: obj.pe, old: null};
                    // ROA - OK
                    data.ROA = {new: obj.roa, old: null};
                    // ROE - OK
                    data.ROE = {new: obj.roe, old: null};
                    // EPS - OK
                    data.EPS = {new: obj.eps, old: null};
                    // ROS
                    // GOS
                    // DAR

                    mpYearMonthData.set(keyYearMonth, data)
                }
            });

            $.each(reps.data.yearlyProfits, function(idx, obj) {
                if (idx < size) {
                    // Các chỉ số tài chính
                    var keyYear = '{0}'.format(obj.yearReport);
                    lstYear.add(keyYear);

                    var data = mpYearData.get(keyYear) || {};
                    // BV
                    
                    // P/B - OK
                    data.PB = {new: obj.pb, old: null};
                    // P/E - OK
                    data.PE = {new: obj.pe, old: null};
                    // ROA - OK
                    data.ROA = {new: obj.roa, old: null};
                    // ROE - OK
                    data.ROE = {new: obj.roe, old: null};
                    // EPS - OK
                    data.EPS = {new: obj.eps, old: null};
                    // ROS
                    // GOS
                    // DAR

                    mpYearData.set(keyYear, data)
                }
            });
        }
    });
    
    return;
}

// Finpath - Báo cáo tài chính - Kết quả kinh doanh
fullincomestatementsFinpath = function(stockCode, size) {

    $.ajax({
        url: '{0}/api/stocks/fullincomestatements/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {
            $.each(reps.data.quarterlys, function(idx, obj) {
                if (idx < size) {
                    //
                    var keyYearMonth = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                    lstYearMonth.add(keyYearMonth);

                    var data = mpYearMonthData.get(keyYearMonth) || {};
                    // isa3: Doanh số thuần - Danh thu thuần
                    data.DTT = {new: obj.isa3, old: null};
                    // isa5: Lãi gộp - Lợi nhuận gộp
                    data.LNG = {new: obj.isa5, old: null};
                    // isa22: Lợi nhuận của Cổ đông của Công ty mẹ - Lợi nhuận sau thuế
                    data.LNST = {new: obj.isa22, old: null};

                    mpYearMonthData.set(keyYearMonth, data)
                }
            });
        }
    });
    return;
}

// Fireant - Tài chính - Kết quả kinh doanh
fullincomestatementsFireant = function(stockCode, size) {

    $.ajax({
        // type: Loại báo cáo (1: Cân đối kế toán, 2: Kết quả SXKD, 3: Lưu chuyển tiền tệ trực tiếp, 4: Lưu chuyển tiền tệ gián tiếp)
        // year: Năm lấy báo cáo
        // quarter: Quý lấy báo cáo
        // limit: Số lượng tối đa bản ghi lấy về (Mặc địch là SIZE_DEFAULT)
        url: '{0}/symbols/{1}/full-financial-reports?type=2&year={2}&quarter=1&limit={3}'.format(pathFireant, stockCode, DatetimeUtils.getYear(), size),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            var mpData = arrayToMap(reps);
            
            // Doanh thu thuần
            setValueFireantYearMonth(mpData, 'Doanh thu thuần', 'DTT');
            // Lợi nhuận gộp
            setValueFireantYearMonth(mpData, 'Lợi nhuận gộp', 'LNG');
            // Lợi nhuận sau thuế của cổ đông của công ty mẹ (19)-(20)
            setValueFireantYearMonth(mpData, 'Lợi nhuận sau thuế của cổ đông của công ty mẹ', 'LNST');
        }
    });
    return;
}

// Finpath - Báo cáo tài chính - Cân đối kế toán
fullbalancesheetsFinpath = function(stockCode, size) {
    
    $.ajax({
        url: '{0}/api/stocks/fullbalancesheets/{1}'.format(pathFinpath, stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {},
        success: function(reps) {
            $.each(reps.data.quarterlys, function(idx, obj) {
                if (idx < size) {
                    //
                    var keyYearMonth = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                    lstYearMonth.add(keyYearMonth);

                    var data = mpYearMonthData.get(keyYearMonth) || {};
                    // bsa53: TỔNG CỘNG TÀI SẢN
                    data.TTS = {new: obj.bsa53, old: null};
                    // bsa54: NỢ PHẢI TRẢ
                    data.NO = {new: obj.bsa54, old: null};
                    // bsa78: VỐN CHỦ SỞ HỮU
                    data.VCSH = {new: obj.bsa78, old: null};

                    mpYearMonthData.set(keyYearMonth, data)
                }
            });
        }
    });
    return;
}

// Fireant - Tài chính - Cân đối kế toán
fullbalancesheetsFireant = function(stockCode, size) {

    $.ajax({
        // type: Loại báo cáo (1: Cân đối kế toán, 2: Kết quả SXKD, 3: Lưu chuyển tiền tệ trực tiếp, 4: Lưu chuyển tiền tệ gián tiếp)
        // year: Năm lấy báo cáo
        // quarter: Quý lấy báo cáo
        // limit: Số lượng tối đa bản ghi lấy về (Mặc địch là SIZE_DEFAULT)
        url: '{0}/symbols/{1}/full-financial-reports?type=1&year={2}&quarter=1&limit={3}'.format(pathFireant, stockCode, DatetimeUtils.getYear(), size),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: {
            authorization : ACCESS_TOKEN_FIREANT
        },
        success: function(reps) {
            var mpData = arrayToMap(reps);

            // TỔNG CỘNG TÀI SẢN
            setValueFireantYearMonth(mpData, 'TỔNG CỘNG TÀI SẢN', 'TTS');
            // Nợ phải trả
            setValueFireantYearMonth(mpData, 'Nợ phải trả', 'NO');
            // Nguồn vốn chủ sở hữu
            setValueFireantYearMonth(mpData, 'Nguồn vốn chủ sở hữu', 'VCSH');
        }
    });
    return;
}
arrayToMap = function(input) {
    const map = new Map();
    for (let obj of input) {
        let arrName = obj.name.split('.');
        let name = ''
        if (arrName.length == 1) {
            name = obj.name.replace(/-|\(\d+\)/g, '').trim();
        } else {
            name = arrName[1].replace(/-|\(\d+\)/g, '').trim();
        }
        map.set(name, obj.values);
      }
    return map;
}
setValueFireantYearMonth = function(mpData, key, set) {
    mpData.get(key).forEach(obj => {
        var keyYearMonth = '{0}{1}{2}'.format(obj.year, 'Q', obj.quarter);
        lstYearMonth.add(keyYearMonth);
        var data = mpYearMonthData.get(keyYearMonth) || {};
        if (data[set] === undefined) {
            data[set] = {new: obj.value, old: null};
        } else if (data[set].new !== obj.value) {
            data[set] = {new: obj.value, old: data[set].new};
        }
        mpYearMonthData.set(keyYearMonth, data)
    });
}