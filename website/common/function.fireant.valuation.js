// Nguồn fireant.vn
var urlTransactionInformation = '';
var urlEconomicInformationQuarterly = '';
var urlEconomicInformationYear = '';
var urlFinancialIndicators = ''
// Nguồn fireant.vn - Giao dịch
var urlHolderTransactions = '';
// Nguồn fireant.vn - Tổng quan (tổ hợp)
var urlFundamental = '';
// Nguồn fireant.vn - Cân đối kế toán (toàn bộ)
var urlFullBalanceSheet = ''
// Nguồn fireant.vn - Kết quả kinh doanh (toàn bộ)
var urlFullBusinessResults = ''
// Nguồn fireant.vn - Giá quá khứ
var urlHistoricalQuotes = ''

// Nguồn cafef.vn - Hoạt động kinh doanh
var urlActiveBusiness = '';

function setParameter (pSymbol, pName, pExchange) {
    buildUrl(pSymbol, pName.stringEnglishHyphen(), pExchange);
}

function getExchange(exchange) {
    if (exchange == '2') {
        return 'hastc';
    } else if (exchange == '8') {
        return 'otc';
    } if (exchange == '9') {
        return 'upcom';
    } else {
        return 'hose';
    }
}

function buildUrl(pSymbol, pName, pExchange) {
    var today = new Date();
    var year = today.getFullYear();

    // Nguồn fireant.vn
    urlTransactionInformation = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-reports?type=BS&period=Q&compact=true&offset=0&limit=4';
    urlEconomicInformationQuarterly = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-reports?type=IS&period=Q&compact=true&offset=0&limit=5';
    urlEconomicInformationYear = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-reports?type=IS&period=Y&compact=true&offset=0&limit=5';
    urlFinancialIndicators = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-indicators'
    // Giao dịch
    urlHolderTransactions = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/holder-transactions?startDate=&endDate=&executedOnly=false&offset=0&limit=1';
    // Tổng quan (tổ hợp)
    urlFundamental = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/fundamental';
    // Cân đối kế toán (toàn bộ)
    urlFullBalanceSheet = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/full-financial-reports?type=1&year=' + year + '&quarter=1&limit=4'
    // Kết quả kinh doanh (toàn bộ)
    urlFullBusinessResults = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/full-financial-reports?type=2&year=' + year + '&quarter=1&limit=4'
    // Giá quá khứ
    urlHistoricalQuotes = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/historical-quotes?startDate=1900-01-01&endDate=' + today.toISO() + '&offset=0&limit=1'
    // Nguồn cafef.vn - Hoạt động kinh doanh
    urlActiveBusiness = 'https://e.cafef.vn/khkd.ashx?symbol=' + pSymbol;
}

// --- START Cafef.vn -----

var arrayActiveBusiness = null;
function getAjaxActiveBusiness() {

    if (arrayActiveBusiness === null) {
        strCT = null;

        $.ajax({
            url: urlActiveBusiness,
            async: false,
            dataType : 'json',
            success: function(reps){
                arrayActiveBusiness = reps;
            }
        });
    }
    return arrayActiveBusiness;
}

// Lấy cổ tức
var arrayLatestCT = null;
function getLatestCT() {

    if (arrayLatestCT === null || arrayActiveBusiness === null) {
        arrayActiveBusiness = getAjaxActiveBusiness();
        arrayLatestCT = {};
        arrayLatestCT.dividendPercent = '0%';
        arrayLatestCT.dividend = 'không có';

        if (arrayActiveBusiness) {
            var filterActiveBusiness = arrayActiveBusiness.filter(element => element.KYear == new Date().getFullYear());
            if (filterActiveBusiness.length > 0) {
                if (filterActiveBusiness[0].Dividend !== 0) {
                    arrayLatestCT.dividendPercent = filterActiveBusiness[0].Dividend + '%';
                    arrayLatestCT.dividend = 'tiền mặt';
                } else if (filterActiveBusiness[0].DivStock !== 0) {
                    arrayLatestCT.dividendPercent = filterActiveBusiness[0].DivStock + '%';
                    arrayLatestCT.dividend = 'cổ phiếu';
                }
            }
        }
        
        return arrayLatestCT;
    }

    return arrayLatestCT;
}

// ----- END Cafef.vn -----

// ----- START Giá quá khứ -----

var historicalQuotes = null;
function getAjaxHistoricalQuotes() {

    if (historicalQuotes === null) {
        strLatestTGCP = null;

        $.ajax({
            url: urlHistoricalQuotes,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                historicalQuotes = reps;
            }
        });
    }
    return historicalQuotes;
}

// Lấy thị giá cổ phiếu (đồng/cp)
var strLatestTGCP = null;
function getLatestTGCP() {

    if (strLatestTGCP === null || historicalQuotes === null) {
        historicalQuotes = getAjaxHistoricalQuotes();
        strLatestTGCP = historicalQuotes[0].priceClose * 1000;
        return strLatestTGCP;
    }
    return strLatestTGCP;
}

// ----- END Giá quá khứ -----

// ----- START Tổng quan (tổ hợp) -----

var fundamental = null;
function getAjaxFundamental() {

    if (fundamental === null) {
        strKPCPDLH = null;

        $.ajax({
            url: urlFundamental,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                fundamental = reps;
            }
        });
    }
    return fundamental;
}

// TỔNG SỐ LƯỢNG CỔ PHIẾU (triệu cp)
var strKPCPDLH = null;
function getKPCPDLH() {

    if (strKPCPDLH === null || fundamental === null) {
        fundamental = getAjaxFundamental();
        if (fundamental !== null) {
            strKPCPDLH = convertZero(fundamental.sharesOutstanding) / 1000000;
        } else {
            strKPCPDLH = 0.00;
        }
        return strKPCPDLH;
    }
    return strKPCPDLH;
}

// ----- END Tổng quan (tổ hợp) -----

// ----- START Giao dịch -----

var holderTransactions = null;
function getHolderTransactions() {

    if (holderTransactions === null) {
        objectBLDMB = null;

        $.ajax({
            url: urlHolderTransactions,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                holderTransactions = reps;
            }
        });
    }
    return holderTransactions;
}

// Ban lãnh đạo mua bán cố phần (Đạt = 1, Không đạt = 0)
var objectBLDMB = null;
function isLatestBLDMB() {

    if (objectBLDMB === null || holderTransactions === null) {
        holderTransactions = getHolderTransactions();

        objectBLDMB = {}
        const elm = holderTransactions[0];
        if (elm) {
            var saleText = 'Đăng ký '
            if (elm.executionVolume === null) {
                saleText = 'Đã '
            }

            var transactionTextLast = nvl(elm.registeredVolume, elm.executionVolume).numberFormat() + ' (' + elm.startDate.dateFormat('yyyy/MM/dd') + ')';
            if (elm.type === 1) { // 1: Bán, 0: Mua
                objectBLDMB.isBLDMB = 0;
                objectBLDMB.transactionText = saleText + 'bán: ' + transactionTextLast;
            } else {
                objectBLDMB.isBLDMB = 1;
                objectBLDMB.transactionText = saleText + 'mua: ' + transactionTextLast;
            }
        } else {
            objectBLDMB.isBLDMB = 'N/A';
            objectBLDMB.transactionText = 'N/A'
        }

        return objectBLDMB;
    }
    return objectBLDMB;
}

// ----- END Giao dịch -----

// ----- START Cân đối kế toán (toàn bộ) -----

var fullBalanceSheet = null;
function getFullBalanceSheet() {

    if (fullBalanceSheet === null) {
        arrayNDH = [];
        strLatestNDH = null;

        $.ajax({
            url: urlFullBalanceSheet,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                fullBalanceSheet = reps;
            }
        });
    }
    return fullBalanceSheet;
}

var arrayNDH = [];
function listNDH () {

    if (arrayNDH.length === 0 || fullBalanceSheet === null) {
        fullBalanceSheet = getFullBalanceSheet();
        for (let i = 0; i < fullBalanceSheet.length; i++) {
            const elm = fullBalanceSheet[i];
            if (elm.name.contains('Nợ dài hạn')) {
                var values = elm.values;
                for (let j = 0; j < values.length; j++) {
                    const value = values[j].value / 1000000000;
                    arrayNDH.push(roundEmpty(value));
                }
                break;
            }
        }
        return arrayNDH;
    }
    return arrayNDH;
}

var strLatestNDH = null;
function getLatestNDH () {

    if (strLatestNDH === null || fullBalanceSheet === null) {
        var tmpArrayNDH = listNDH();
        strLatestNDH = tmpArrayNDH[tmpArrayNDH.length - 1];
        return strLatestNDH;
    }
    return strLatestNDH;
}

// ----- END Cân đối kế toán (toàn bộ) -----

// ----- START Cân đối kế toán -----

// Đọc data từ fireant.vn (Cân đối kế toán)
var transactionInformation = null;
function getTransactionInformationn() {

    if (transactionInformation === null) {
        objectVCSH = null;
        latestVCSH = null;
        increaseVCSH = null;

        $.ajax({
            url: urlTransactionInformation,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                transactionInformation = reps;
            }
        });
    }
    return transactionInformation;
}

// Lấy vốn chủ sở hữu
var objectVCSH = null;
function listVCSH (pName) {
    
    if (objectVCSH === null || transactionInformation === null) {
        
        var tmpArrayVCSH = [];
        transactionInformation = getTransactionInformationn();
        var elmHeaderYear = transactionInformation.columns;
        elmHeaderYear.splice(0, 2);
        var targetValue = '';
        if (pName.indexOf('Ngân hàng') == 0) {
            targetValue = 'Vốn và các quỹ';
        } else {
            targetValue = 'Nguồn VCSH';
        }
        
        var elmHeader = getRowTarget(transactionInformation.rows, targetValue)
        elmHeader.splice(0, 2);
        for (let i = 0; i < elmHeader.length; i++) {
            // Đổi đợn vị theo tỷ VNĐ
            const value = elmHeader[i] / 1000000000;
            tmpArrayVCSH.push(roundEmpty(value));
        }

        objectVCSH = {};
        objectVCSH.arrayVCSH = tmpArrayVCSH;
        objectVCSH.year = elmHeaderYear;
        return objectVCSH;
    }
    return objectVCSH;
}

// Lấy vốn chủ sở hữu (mới nhất)
var latestVCSH = null;
function getLatestVCSH (pName) {
    
    if (latestVCSH === null || transactionInformation === null) {
        
        objectVCSH = listVCSH(pName);

        var tmpLatestVCSH = objectVCSH.arrayVCSH;
        tmpLatestVCSH = tmpLatestVCSH[tmpLatestVCSH.length - 1];
        
        var tmpLatestVCSHYear = objectVCSH.year;
        tmpLatestVCSHYear = tmpLatestVCSHYear[tmpLatestVCSHYear.length - 1];

        latestVCSH = {};
        latestVCSH.latestVCSH = tmpLatestVCSH;
        latestVCSH.latestVCSHYear = tmpLatestVCSHYear;

        return latestVCSH;
    }
    return latestVCSH;
}

// Lấy vốn chủ sở hữu tăng đều
var increaseVCSH = null;
function isGrowUpVCSH (pName) {
    
    if (increaseVCSH === null || transactionInformation === null) {
        increaseVCSH = {};
        objectVCSH = listVCSH(pName);

        var before = 0;
        var tmpIncreaseVCSH = 1;
        objectVCSH.arrayVCSH.forEach(object => {
            if (before > object) {
                tmpIncreaseVCSH = 0;
            }
            before = object;
        });

        increaseVCSH.isGrowUpVCSH = tmpIncreaseVCSH;
        increaseVCSH.commaVCSH = objectVCSH.arrayVCSH.join(', ');
        return increaseVCSH;
    }
    return increaseVCSH;
}

// ----- END Cân đối kế toán -----

// ----- START Kết quả kinh doanh (toàn bộ) -----

var fullBusinessResults = null;
function getAjaxFullBusinessResults() {

    if (fullBusinessResults === null) {
        $.ajax({
            url: urlFullBusinessResults,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                fullBusinessResults = reps;
            }
        });
    }
    return fullBusinessResults;
}

// ----- END Kết quả kinh doanh (toàn bộ) -----

// ----- START Kết quả kinh doanh -----

// Đọc data từ fireant.vn (Kết quả kinh doanh)
var economicInformation = null;
function getEconomicInformation() {

    if (economicInformation === null) {
        arrayDTT = [];
        isUpDTT = null;
        arrayLNG = [];
        isUpLNG = null;
        arrayLNTHDKD = [];
        isUpPositiveLNTHDKD = null
        objectLNST = null;
        latestLNST = null;

        $.ajax({
            url: urlEconomicInformationQuarterly,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                if (reps) {
                    economicInformation = reps;
                    economicInformation.isYear = false;
                }
            }
        });

        if (economicInformation === null) {
            $.ajax({
                url: urlEconomicInformationYear,
                async: false,
                dataType : 'json',
                headers: {
                    authorization : ACCESS_TOKEN_FIREANT
                },
                success: function(reps){
                    if (reps) {
                        economicInformation = reps;
                        economicInformation.isYear = true;
                    }
                }
            });
        }
    }
    return economicInformation;
}

// Lấy DT thuần
var arrayDTT = [];
function listDTT () {
    
    if (arrayDTT.length === 0 || economicInformation === null) {
        economicInformation = getEconomicInformation();
        var elmHeader = economicInformation.rows[0];
        elmHeader.splice(0, 2);
        for (let i = 0; i < elmHeader.length; i++) {
            // Đổi đợn vị theo tỷ VNĐ
            const value = elmHeader[i] / 1000000000;
            arrayDTT.push(roundEmpty(value));
        }
        return arrayDTT;
    }
    return arrayDTT;
}

// Lấy doanh thu tăng đều theo biểu đồ (Đạt = 1, Không đạt = 0)
var isUpDTT = null;
function isGrowUpDTT () {

    if (isUpDTT === null || economicInformation === null) {
        var tmpArrayDTT = listDTT();
        var tmpValueBefore = 0
        for (let i = 0; i < tmpArrayDTT.length; i++) {
            const elmValue = tmpArrayDTT[i];
            if (tmpValueBefore < elmValue) {
                isUpDTT = 1
                tmpValueBefore = elmValue;
            } else {
                isUpDTT = 0;
                break;
            }
        }
        return isUpDTT;
    }
    return isUpDTT;
}

// Lấy LN gộp
var arrayLNG = [];
function listLNG () {
    
    if (arrayLNG.length === 0 || economicInformation === null) {
        economicInformation = getEconomicInformation();
        var elmHeader = economicInformation.rows[1];
        elmHeader.splice(0, 2);
        for (let i = 0; i < elmHeader.length; i++) {
            // Đổi đợn vị theo tỷ VNĐ
            const value = elmHeader[i] / 1000000000;
            arrayLNG.push(roundEmpty(value));
        }
        return arrayLNG;
    }
    return arrayLNG;
}

// Lấy lợi nhuận gộp tăng đều theo biểu đồ (Đạt=1, Không đạt = 0)
var isUpLNG = null;
function isGrowUpLNG () {

    if (isUpLNG === null || economicInformation === null) {
        var tmpArrayLNG = listDTT();
        var tmpValueBefore = 0
        for (let i = 0; i < tmpArrayLNG.length; i++) {
            const elmValue = tmpArrayLNG[i];
            if (tmpValueBefore < elmValue) {
                isUpLNG = 1
                tmpValueBefore = elmValue;
            } else {
                isUpLNG = 0;
                break;
            }
        }
        return isUpLNG;
    }
    return isUpLNG;
}

// Lấy LN từ HĐKD
var arrayLNTHDKD = [];
function listLNTHDKD () {
    
    if (arrayLNTHDKD.length === 0 || economicInformation === null) {
        economicInformation = getEconomicInformation();
        var elmHeader = economicInformation.rows[2];
        elmHeader.splice(0, 2);
        for (let i = 0; i < elmHeader.length; i++) {
            // Đổi đợn vị theo tỷ VNĐ
            const value = elmHeader[i] / 1000000000;
            arrayLNTHDKD.push(roundEmpty(value));
        }
        return arrayLNTHDKD;
    }
    return arrayLNTHDKD;
}

// Dòng tiền từ hoạt động Kinh doanh dương (Đạt = 1, Không đạt = 0)
var isUpPositiveLNTHDKD = null
function isPositiveLNTHDKD() {

    if (isUpPositiveLNTHDKD === null || economicInformation === null) {
        var tmpArrayLNTHDKD = listLNTHDKD();
        for (let i = 0; i < tmpArrayLNTHDKD.length; i++) {
            const elmValue = tmpArrayLNTHDKD[i];
            if (elmValue < 0) {
                isUpPositiveLNTHDKD = 0
                break;
            }
            isUpPositiveLNTHDKD = 1;
        }
    }
    return isUpPositiveLNTHDKD;
}

// Lấy LN sau thuế
var objectLNST = null;
function listLNST () {
    
    if (objectLNST === null || economicInformation === null) {
        objectLNST = {};
        var tmpArrayLNST = [];
        economicInformation = getEconomicInformation();
        var elmHeaderRows = economicInformation.rows[3];
        var elmHeaderColums = economicInformation.columns;
        elmHeaderColums.splice(0, 2);
        elmHeaderRows.splice(0, 2);
        for (let i = 0; i < elmHeaderRows.length; i++) {
            // Đổi đợn vị theo tỷ VNĐ
            const value = elmHeaderRows[i] / 1000000000;
            tmpArrayLNST.push(roundEmpty(value));
        }
        objectLNST.year = elmHeaderColums;
        objectLNST.arrayLNST = tmpArrayLNST;
        return objectLNST;
    }
    return objectLNST;
}

var latestLNST = null;
function getLatestLNST() {

    if (latestLNST === null || economicInformation === null) {
        objectLNST = listLNST();

        var tmpLatestLNST = objectLNST.arrayLNST;
        tmpLatestLNST = tmpLatestLNST[tmpLatestLNST.length - 1]

        var tmpLatestLNSTYear = objectLNST.year;
        tmpLatestLNSTYear = tmpLatestLNSTYear[tmpLatestLNSTYear.length - 1]

        latestLNST = {};
        latestLNST.latestLNST = tmpLatestLNST;
        latestLNST.latestLNSTYear = tmpLatestLNSTYear;
        return latestLNST;
    }
    return latestLNST;
}

// ----- END Kết quả kinh doanh -----

// ----- START Chỉ số -----

// Đọc data từ fireant.vn (Chỉ số tài chính)
var financialIndicators = null;
function getAjaxFinancialIndicators() {

    if (financialIndicators === null) {
        arrayFinancialIndicators = null;
        $.ajax({
            url: urlFinancialIndicators,
            async: false,
            dataType : 'json',
            headers: {
                authorization : ACCESS_TOKEN_FIREANT
            },
            success: function(reps){
                financialIndicators = reps;
            }
        });
    }
    return financialIndicators;
}

// Lấy chỉ số tài chính
var arrayFinancialIndicators = null;
function getFinancialIndicators () {
    
    if (arrayFinancialIndicators === null || financialIndicators === null) {
        financialIndicators = getAjaxFinancialIndicators();
        arrayFinancialIndicators = {}
        for (let i = 0; i < financialIndicators.length; i++) {
            // Lấy ra từng phần tử
            const elmValue = financialIndicators[i];

            // Lấy ra tên viết tắt
            const shortName = elmValue.shortName.stringEnglishUppercase();

            // Build lại thành JSON của mình mong muốn
            arrayFinancialIndicators[shortName] = roundEmpty(elmValue.value);
            arrayFinancialIndicators[shortName + '_NAME'] = elmValue.name
            arrayFinancialIndicators[shortName + '_DESCRIPTION'] = elmValue.description
        }
        return arrayFinancialIndicators;
    }
    return arrayFinancialIndicators;
}

// ----- END Chỉ số -----

// Common
function resetData() {
    arrayActiveBusiness = null;
    historicalQuotes = null;
    fundamental = null;
    holderTransactions = null;
    fullBalanceSheet = null;
    transactionInformation = null;
    fullBusinessResults = null;
    economicInformation = null;
    financialIndicators = null;
}

function getRowTarget (lstData, targetValue) {

    var object = null;
    lstData.forEach(row => {
        if (row[0].trim() == targetValue.trim()) {
            object = row;
            return false;
        }
    });

    return object;
}

function nvl (sourceValue, targetValue) {

    if (sourceValue === null || sourceValue.length === 0) {
        return targetValue;
    }

    return sourceValue;
}

function roundEmpty(input) {

    if (input) {
        return input.round();
    } else {
        return 0.00;
    }
};

function convertZero(value) {

    if (value) {
        return value;
    } else {
        return 0.00;
    }
}

function isValidNumber (num) {
    return typeof num === 'number' && !isNaN(num);
}

function convertNA(value) {

    if (value) {
        return value;
    } else {
        return 'N/A';
    }
}

function convertNumber(value) {

    return Number(value.replace(/\n/g, '').replace(/\s/g, '').replace(/,/g, ''));
}

function removePercent(value) {

    return value.replace(/\s/g, '').replace(/%/g, '');
}

function getDataJson(jsonExcel, pSymbol, pName) {

    // Định giá simplize
    var overallIntrinsicValue = getOverallIntrinsicValue(pSymbol);
    jsonExcel = jsonExcel.replaceExcel('#DGN', overallIntrinsicValue);

    // Tab Xu hướng
    var tmpArraySectorPerformances = listTrend();
    jsonExcel = jsonExcel.replaceExcel('#0PEBDS', tmpArraySectorPerformances.bds);
    jsonExcel = jsonExcel.replaceExcel('#0PECN', tmpArraySectorPerformances.cn);
    jsonExcel = jsonExcel.replaceExcel('#0PEHHKTY', tmpArraySectorPerformances.hhkty);
    jsonExcel = jsonExcel.replaceExcel('#0PEHHTT', tmpArraySectorPerformances.hhty);
    jsonExcel = jsonExcel.replaceExcel('#0PECNG', tmpArraySectorPerformances.cng);
    jsonExcel = jsonExcel.replaceExcel('#0PENL', tmpArraySectorPerformances.nl);
    jsonExcel = jsonExcel.replaceExcel('#0PECSSK', tmpArraySectorPerformances.cssk);
    jsonExcel = jsonExcel.replaceExcel('#0PETC', tmpArraySectorPerformances.tc);
    jsonExcel = jsonExcel.replaceExcel('#0PETI', tmpArraySectorPerformances.ti);
    jsonExcel = jsonExcel.replaceExcel('#0PENVL', tmpArraySectorPerformances.nvl);
    jsonExcel = jsonExcel.replaceExcel('#0PEDVHTGD', tmpArraySectorPerformances.dvhtgd);
    jsonExcel = jsonExcel.replaceExcel('#0TREND', tmpArraySectorPerformances.trend);

    // LNST 4 qúy gần nhất
    var tmpEconomicInformation = getEconomicInformation();
    var tmpObjectLNST = listLNST();
    var tmpArrayLNST = tmpObjectLNST.arrayLNST;
    var tmpArrayLNSTYear = tmpObjectLNST.year;
    for (let i = 0; i < tmpArrayLNST.length; i++) {

        // Chuyển năm hoặc quý
        const strLNSTYear = tmpArrayLNSTYear[i];
        jsonExcel = jsonExcel.replaceExcel('#QFY' + i, strLNSTYear);

        const strLNST = tmpArrayLNST[i];
        if (tmpEconomicInformation.isYear) {
            if (i !== tmpArrayLNST.length - 1) {
                jsonExcel = jsonExcel.replace('#Q' + i, '0.00');
            }
        }
        jsonExcel = jsonExcel.replaceExcel('#Q' + i, strLNST);
    }

    // Chuyển 1 năm hay 4 quý
    if (tmpEconomicInformation.isYear) {
        jsonExcel = jsonExcel.replaceExcel('#QGN', '1 năm gấn nhất');
    } else {
        jsonExcel = jsonExcel.replaceExcel('#QGN', '4 quý gấn nhất');
    }

    // Chuyển mã chứng khoán
    jsonExcel = jsonExcel.replaceExcel('#SYMBOL', pSymbol + ': ' + pName);

    // LỢI NHUẬN SAU THUẾ 4 QUÝ GẦN NHẤT (tỷ đồng)
    // VỐN CHỦ SỞ HỮU HIỆN TẠI (tỷ đồng)
    var tmpLatestVCSH = getLatestVCSH(pName);

    jsonExcel = jsonExcel.replaceExcel('#VCSHFY', tmpLatestVCSH.latestVCSHYear);
    jsonExcel = jsonExcel.replaceExcel('#VCSH', tmpLatestVCSH.latestVCSH);
    // TỶ LỆ CỔ TỨC (tính theo mệnh giá)
    var tmpArrayLatestCT = getLatestCT();
    jsonExcel = jsonExcel.replaceExcel('#TLCT', tmpArrayLatestCT.dividendPercent);
    jsonExcel = jsonExcel.replaceExcel('#CT', tmpArrayLatestCT.dividend);
    // THỊ GIÁ CỔ PHIẾU (đồng/cp)
    var tmpStrLatestTGCP = getLatestTGCP();
    jsonExcel = jsonExcel.replaceExcel('#TGCP', tmpStrLatestTGCP);
    // TỔNG SỐ LƯỢNG CỔ PHIẾU (triệu cp)
    var tmpStrKPCPDLH = getKPCPDLH();
    jsonExcel = jsonExcel.replaceExcel('#TSLCP', tmpStrKPCPDLH);

    // NHỮNG TIÊU CHUẨN ĐỂ ĐỊNH GIÁ MỘT DOANH NGHIỆP TÔT
    var tmpFinancial = getFinancialIndicators();
    // Doanh thu tăng đều (Đạt = 1, Không đạt = 0)
    var tmpIsUpDTT = isGrowUpDTT();
    jsonExcel = jsonExcel.replaceExcel('#DTUP', tmpIsUpDTT);
    // Lợi nhuận gộp tăng đều (Đạt=1, Không đạt = 0)  
    var tmpIsUpLNG = isGrowUpLNG();
    jsonExcel = jsonExcel.replaceExcel('#LNGUP', tmpIsUpLNG);
    // Vốn chủ sở hữu tăng đều (Đạt=1, Không đạt = 0) 
    var tmpIsGrowUpVCSH = isGrowUpVCSH(pName);
    jsonExcel = jsonExcel.replaceExcel('#VCSHUP', tmpIsGrowUpVCSH.isGrowUpVCSH);
    jsonExcel = jsonExcel.replaceExcel('#CVCSH', tmpIsGrowUpVCSH.commaVCSH);
    // Tỷ lệ lãi gộp (>= 15%)
    jsonExcel = jsonExcel.replaceExcel('#GOS', tmpFinancial.LAI_GOP);
    // Tỷ lệ lãi ròng (>= 5)
    jsonExcel = jsonExcel.replaceExcel('#NPM', tmpFinancial.LAI_RONG);
    // ROA (>= 5%)
    jsonExcel = jsonExcel.replaceExcel('#ROA', tmpFinancial.ROA);
    // ROE (>= 15%)
    jsonExcel = jsonExcel.replaceExcel('#ROE', tmpFinancial.ROE);
    // ROIC (>= 10%)
    jsonExcel = jsonExcel.replaceExcel('#ROIC', tmpFinancial.ROIC);
    // Nợ/VCSH (<= 1)
    jsonExcel = jsonExcel.replaceExcel('#NOVCSH', tmpFinancial.NOVCSH);
    // P/E <15(có thể 20) <=15
    jsonExcel = jsonExcel.replaceExcel('#PE', tmpFinancial.PE);
    // P/B<2(<= 2)
    jsonExcel = jsonExcel.replaceExcel('#PB', tmpFinancial.PB);
    // Mô hình đơn giản tập chung (Đạt = 1, Không đạt = 0)
    // Pending
    // Ban lãnh đạo mua/bán cố phần (Đạt = 1, Không đạt = 0)
    var tmpObjectBLDMB = isLatestBLDMB();
    jsonExcel = jsonExcel.replaceExcel('#BLDMB', tmpObjectBLDMB.isBLDMB);
    jsonExcel = jsonExcel.replaceExcel('#IBLDMB', tmpObjectBLDMB.transactionText);
    // Dòng tiền từ HĐKD dương (Đạt = 1, Không đạt = 0)
    var tmpIsPositiveLNTHDKD = isPositiveLNTHDKD();
    jsonExcel = jsonExcel.replaceExcel('#DTP', tmpIsPositiveLNTHDKD);
    // Nợ dài hạn(N/A)/LNST(N/A) (Q3/2022) <= 5
    var tmpLatestNDH = getLatestNDH();
    var tmpLatestLNST = getLatestLNST();
    jsonExcel = jsonExcel.replaceExcel('#NDHLNSTFY', tmpLatestLNST.latestLNSTYear);
    var tmpNDHLNST = 'N/A';
    if (tmpLatestNDH !== undefined && tmpLatestLNST.latestLNST !== undefined) {
        tmpNDHLNST = (convertZero(tmpLatestNDH) / tmpLatestLNST.latestLNST).round()
    } 
    jsonExcel = jsonExcel.replaceExcel('#NDHLNST', tmpNDHLNST);
    jsonExcel = jsonExcel.replaceExcel('#NDH', tmpLatestNDH, true);
    jsonExcel = jsonExcel.replaceExcel('#LNST', tmpLatestLNST.latestLNST, true);

    // getAjaxFullBusinessResults();

    return JSON.parse(jsonExcel);
}