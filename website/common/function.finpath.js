var pathFinpath = 'https://api.finpath.vn';
var pathFireant = 'https://restv2.fireant.vn';

// Create variable
const mpYearMonthData = new Map();
const mpYearData = new Map();
const SIZE_DEFAULT = 5

getFinancial = function(stockCode, stockName, isYear = false, size = SIZE_DEFAULT) {

    isBank = false;
    if (stockName.indexOf('Ngân hàng') == 0) {
        isBank = true;
    }
    console.log(isBank);

    // Finpath - The first
    financialratios(stockCode, isYear, size);
    fullincomestatementsFinpath(stockCode, isBank, isYear, size);
    fullbalancesheetsFinpath(stockCode, isYear, size);
    // Fireant - The second
    //fullbalancesheetsFireant(stockCode, isYear, size);
    //fullincomestatementsFireant(stockCode, isYear, size);
}

// Finpath - Phân tích tài chính
financialratios = function(stockCode, isYear, size) {

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
                        key = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }

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

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
    
    return;
}

// Finpath - Báo cáo tài chính - Kết quả kinh doanh
fullincomestatementsFinpath = function(stockCode, isBank, isYear, size) {

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
                        key = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }

                    // Kiểm tra xem có phải thuộc mã Ngân hàng không?
                    if (isBank) {
                        // isb25: Thu nhập lãi và các khoản thu nhập tương tự - Danh thu thuần
                        data.DTT = {new: obj.isb25, old: null};
                        // isb27: Thu nhập lãi thuần - Lợi nhuận gộp
                        data.LNG = {new: obj.isb27, old: null};
                    } else {
                        // isa3: Doanh số thuần - Danh thu thuần
                        data.DTT = {new: obj.isa3, old: null};
                        // isa5: Lãi gộp - Lợi nhuận gộp
                        data.LNG = {new: obj.isa5, old: null};
                    }
                    
                    
                    // isa22: Lợi nhuận của Cổ đông của Công ty mẹ - Lợi nhuận sau thuế
                    data.LNST = {new: obj.isa22, old: null};

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
    return;
}

// Fireant - Tài chính - Kết quả kinh doanh
fullincomestatementsFireant = function(stockCode, isYear, size) {

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
            setValueFireantYearMonth(mpData, 'Doanh thu thuần', 'DTT', isYear);
            // Lợi nhuận gộp
            setValueFireantYearMonth(mpData, 'Lợi nhuận gộp', 'LNG', isYear);
            // Lợi nhuận sau thuế của cổ đông của công ty mẹ
            setValueFireantYearMonth(mpData, 'Lợi nhuận sau thuế của cổ đông của công ty mẹ', 'LNST', isYear);
        }
    });
    return;
}

// Finpath - Báo cáo tài chính - Cân đối kế toán
fullbalancesheetsFinpath = function(stockCode, isYear, size) {
    
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
                        key = '{0}{1}{2}'.format(obj.yearReport, 'Q', obj.quarterReport);
                        data = mpYearMonthData.get(key) || {};
                    }
                    // bsa53: TỔNG CỘNG TÀI SẢN
                    data.TTS = {new: obj.bsa53, old: null};
                    // bsa54: NỢ PHẢI TRẢ
                    data.NO = {new: obj.bsa54, old: null};
                    // bsa78: VỐN CHỦ SỞ HỮU
                    data.VCSH = {new: obj.bsa78, old: null};

                    if (isYear) {
                        mpYearData.set(key, data)
                    } else {
                        mpYearMonthData.set(key, data)
                    }
                }
            });
        }
    });
    return;
}

// Fireant - Tài chính - Cân đối kế toán
fullbalancesheetsFireant = function(stockCode, isYear, size) {

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
            var mpData = arrayToMap(reps);

            // TỔNG CỘNG TÀI SẢN
            setValueFireantYearMonth(mpData, 'TỔNG CỘNG TÀI SẢN', 'TTS', isYear);
            // Nợ phải trả
            setValueFireantYearMonth(mpData, 'Nợ phải trả', 'NO', isYear);
            // Nguồn vốn chủ sở hữu
            setValueFireantYearMonth(mpData, 'Nguồn vốn chủ sở hữu', 'VCSH', isYear);
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
setValueFireantYearMonth = function(mpData, key, set, isYear) {

    mpData.get(key).forEach(obj => {
        var key = '';
        var data = {};
        if (isYear) {
            // Lấy theo Quý
            key = '{0}'.format(obj.year);
            data = mpYearData.get(key) || {};
        } else {
            // Lấy theo Năm
            key = '{0}{1}{2}'.format(obj.year, 'Q', obj.quarter);
            data = mpYearMonthData.get(key) || {};
        }
        if (data[set] === undefined) {
            data[set] = {new: obj.value, old: null};
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