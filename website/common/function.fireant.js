// Nguồn fireant.vn
var accessToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxOTc0MDQ3ODkwLCJuYmYiOjE2NzQwNDc4OTAsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiN2RiZDEzZC1lZGFhLTQ4ZWQtOGM1YS1iYmI3NzUxZjFhZTMiLCJhdXRoX3RpbWUiOjE2NzQwNDc4ODksImlkcCI6Ikdvb2dsZSIsIm5hbWUiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJzZWN1cml0eV9zdGFtcCI6ImE3N2ZhZTY1LWQ5YzctNGYxMS1iZGVmLWI2MzNkMWFlZmM4NiIsImp0aSI6IjEzMGFhNTFhZDUyMWE4NTZiNTJkMTEyYjJiOTFiOWVjIiwiYW1yIjpbImV4dGVybmFsIl19.txx7fO_78xSzbtt605WQl9aMxn8ao8K5bkjes-sPPFCZNScq0EjgwU1fbiYwNRevzp1K6I9j_5Cyz1Z3cl3BKruX68aQ1I_H6CaO_whmiASL5WSCBpdrH0tBNehWE6hav4g_NNMNOjMNILirvSwB4hzuOSaqApCYJFOBTQU96ycgyxRkij3HuU4WL_6Ph22irDTyVHt13GfzAra3NBj06XAaqE6Kx5dBcciVTnpyk9GStz6GUt-yINzAveTp7EC6AUU1-QHnn2Ood8SMVC5H6vvI3O29_Ag9e5b0yfHFxjhgYzbcD2khowSiT7lgCoqYwKzq3A6jwQYKZ5MZ0sR7xA';
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
    urlEconomicInformationQuarterly = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-reports?type=IS&period=Q&compact=true&offset=0&limit=4';
    urlEconomicInformationYear = 'https://restv2.fireant.vn/symbols/' + pSymbol + '/financial-reports?type=IS&period=Y&compact=true&offset=0&limit=4';
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

var activeBusiness = null;
function getAjaxActiveBusiness() {

    if (activeBusiness === null) {
        strCT = null;

        $.ajax({
            url: urlActiveBusiness,
            async: false,
            dataType : 'json',
            success: function(reps){
                activeBusiness = reps;
            }
        });
    }
    return activeBusiness;
}

// Lấy cổ tức
var arrayLatestCT = null;
function getLatestCT() {

    if (arrayLatestCT === null || activeBusiness === null) {
        activeBusiness = getAjaxActiveBusiness();
        arrayLatestCT = {};
        if (activeBusiness) {
            if (activeBusiness[0].Dividend !== 0) {
                arrayLatestCT.dividendPercent = activeBusiness[0].Dividend + '%';
                arrayLatestCT.dividend = 'tiền mặt';
            } else if (activeBusiness[0].DivStock !== 0) {
                arrayLatestCT.dividendPercent = activeBusiness[0].DivStock + '%';
                arrayLatestCT.dividend = 'cổ phiếu';
            } else {
                arrayLatestCT.dividendPercent = '0%';
                arrayLatestCT.dividend = 'không có';
            }
        } else {
            arrayLatestCT.dividendPercent = '0%';
            arrayLatestCT.dividend = 'không có';
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
                authorization : accessToken
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
                authorization : accessToken
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
        isBLDMB = null;

        $.ajax({
            url: urlHolderTransactions,
            async: false,
            dataType : 'json',
            headers: {
                authorization : accessToken
            },
            success: function(reps){
                holderTransactions = reps;
            }
        });
    }
    return holderTransactions;
}

// Ban lãnh đạo mua bán cố phần (Đạt = 1, Không đạt = 0)
var isBLDMB = null;
function isLatestBLDMB() {

    if (isBLDMB === null || holderTransactions === null) {
        holderTransactions = getHolderTransactions();
        const elm = holderTransactions[0];
        if (elm) {
            if (elm.type === 1) {
                isBLDMB = 0;
            } else {
                isBLDMB = 1;
            }
        } else {
            isBLDMB = 'N/A';
        }
        return isBLDMB;
    }
    return isBLDMB;
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
                authorization : accessToken
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

        $.ajax({
            url: urlTransactionInformation,
            async: false,
            dataType : 'json',
            headers: {
                authorization : accessToken
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
function listVCSH () {
    
    if (objectVCSH === null || transactionInformation === null) {
        
        var tmpArrayVCSH = [];
        transactionInformation = getTransactionInformationn();
        var elmHeaderYear = transactionInformation.columns;
        elmHeaderYear.splice(0, 2);
        var elmHeader = transactionInformation.rows[2];
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
function getLatestVCSH () {
    
    if (latestVCSH === null || transactionInformation === null) {
        
        objectVCSH = listVCSH();

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
                authorization : accessToken
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
                authorization : accessToken
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
                    authorization : accessToken
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
                authorization : accessToken
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
    activeBusiness = null;
    historicalQuotes = null;
    fundamental = null;
    holderTransactions = null;
    fullBalanceSheet = null;
    transactionInformation = null;
    fullBusinessResults = null;
    economicInformation = null;
    financialIndicators = null;
}

String.prototype.stringEnglish = function() {

    var input = this;
    input = input.trim();
    
    var retVal = '';
    var arrayInputChar = input.split('');
    var arrayEnglishChar = ENGLISH_CHAR.split('');
    var pos;
    for (var i = 0; i < arrayInputChar.length; i++){
        pos = VIETNAMESE_CHAR.indexOf(arrayInputChar[i]);
        if (pos >= 0) {
            retVal+= arrayEnglishChar[pos];
        } else {
            retVal+= arrayInputChar[i];
        }
    }
    return retVal;
};

String.prototype.stringEnglishHyphen = function() {

    var input = this;
    input = input.trim();

    var strChar = 'abcdefghiklmnopqrstxyzuvxw0123456789 ';
    
    var str = input.replace("–", "");
    str = str.replace("  ", " ");
    str = str.toLowerCase().stringEnglish();
    var s = str.split('');
    var sReturn = "";
    for (var i = 0; i < s.length; i++){
        if (strChar.indexOf(s[i]) >-1){
            if (s[i] != ' ') sReturn+= s[i];
            else if (i > 0 && s[i-1] != ' ' && s[i-1] != '-') sReturn+= "-";
        }
    }
    return sReturn;
};

String.prototype.stringEnglishUppercase = function() {

    var input = this;
    var retVal = '';
    input = input.trim();

    // Loại bỏ kí tự đặc biệt
    input = input.replace(/\/|%/g, '')
    input = input.replace(/\s/g, '_')

    var arrayInputChar = input.split('');
    var arrayEnglishChar = ENGLISH_CHAR.split('');
    var pos;
    for (var i = 0; i < arrayInputChar.length; i++){
        pos = VIETNAMESE_CHAR.indexOf(arrayInputChar[i]);
        if (pos >= 0) {
            retVal+= arrayEnglishChar[pos].toLocaleUpperCase();
        } else {
            retVal+= arrayInputChar[i].toLocaleUpperCase();
        }
    }
    return retVal;
};

String.prototype.ltrim = function() {

    var input = this;
    if (input) {
        return input.toString().replace(/^\s+/, '');
    } else {
        return '';
    }
};

String.prototype.rtrim = function() {

    var input = this;
    if (input) {
        return input.toString().replace(/\s+$/, '');
    } else {
        return '';
    }
};

String.prototype.trim = function() {

    var input = this;
    if (input) {
        return input.toString().replace(/^\s+|\s+$/g, '');
    } else {
        return '';
    }
};

String.prototype.contains = function(value) {

    var input = this;
    if (input.indexOf(value) !== -1) {
        return true;
    }
    return false;
};

Number.prototype.round = function() {

    var input = this;
    if (input) {
        if (input === 'N/A' || input === 'NA') {
            return 0.00;
        }
        return Number(input.toFixed(2));
    } else {
        return 0.00;
    }
};

Date.prototype.toISO = function() {

    var input = this;
    input = input.toISOString();
    return input.split("T")[0];
};

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

String.prototype.replaceExcel = function(regex, value, isString = false) {

    var input = this;

    if (isValidNumber(value)) {
        if (isString === false) {
            return input.replace('"' + regex + '"', value);
        } else {
            return input.replace(regex, value);
        }
    } else {
        if (value !== undefined) {
            return input.replace(regex, value);
        }
    }
    return input.replace(regex, convertNA(value));
};

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
    var tmpLatestVCSH = getLatestVCSH();

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
    // Lợi nhuận gộp tăng đều  (Đạt=1, Không đạt = 0)  
    var tmpIsUpLNG = isGrowUpLNG();
    jsonExcel = jsonExcel.replaceExcel('#LNGUP', tmpIsUpLNG);
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
    // BBan lãnh đạo mua/bán cố phần (Đạt = 1, Không đạt = 0)
    var tmpIsBLDMB = isLatestBLDMB();
    jsonExcel = jsonExcel.replaceExcel('#BLDMB', tmpIsBLDMB);
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