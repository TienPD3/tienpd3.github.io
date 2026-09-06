var accessToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxOTQxMDQ2MTc2LCJuYmYiOjE2NDEwNDYxNzYsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiN2RiZDEzZC1lZGFhLTQ4ZWQtOGM1YS1iYmI3NzUxZjFhZTMiLCJhdXRoX3RpbWUiOjE2NDEwNDYxNzUsImlkcCI6Imlkc3J2IiwibmFtZSI6InRpZW5wZDNAaWNsb3VkLmNvbSIsInNlY3VyaXR5X3N0YW1wIjoiYTc3ZmFlNjUtZDljNy00ZjExLWJkZWYtYjYzM2QxYWVmYzg2IiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGllbnBkM0BpY2xvdWQuY29tIiwidXNlcm5hbWUiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJmdWxsX25hbWUiOiJQaOG6oW0gRHV5IFRp4bq_biIsImVtYWlsIjoidGllbnBkM0BpY2xvdWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwianRpIjoiOThhZWI4MDBkZDkyZTg5MTEzYWQwNjg1ZDBiM2RiNzEiLCJhbXIiOlsicGFzc3dvcmQiXX0.iY6pSYAvibyON5K3i3zmK91mNAX6UWW_Ec9Dwa23oEvwlFfAhc3eznCs_7Yx2EL6XyLZOOE114nZJCIp9RWNvTyUykxd9TLEC6shwpn9W_GMbt_JwrUVzUA7V4Br3KRiwMWHxLAPK59HXvft2Dvs8hni-zyHlygwtWobi3WVRiqIQLROMY9QrHmZf9Eb9hcPfUhmpKMT2b6ZM5g2IC3xuwysB_IjoPOnrW_4xf-omq0JIoCOwICGXfD7oLcJjzSzZwr2GQ4Yb8vWZA0zuE5IBK3-6Nr7-KL121MS1fhIlHuFijsHKciqhApVYocSO7IS5vrtbzHe5iUG3hTSaTmJzA';
var urlFinancialReports = 'https://s.cafef.vn/hastc/CPC-cong-ty-co-phan-thuoc-sat-trung-can-tho.chn';
var urlFinancial = 'https://e.cafef.vn/fi.ashx?symbol=CPC'

var symbol = null;
function setSymbol (val) {
    symbol = val;
}

// Lấy chỉ số tài chính
var arrayFinancial = null;
function getFinancial () {
    
    var arrayEPS = [];
    var strEPS = 0;
    var arrayBV = [];
    var strBV = 0;
    var arrayPE = [];
    var strPE = 0;
    var arrayROA = [];
    var strROA = 0;
    var arrayROE = [];
    var strROE = 0;
    var arrayROS = [];
    var strROS = 0;
    var arrayGOS = [];
    var strGOS = 0;
    var arrayDAR = [];
    var strDAR = 0;
    var fiveYear = 5;
    if (arrayFinancial === null) {
        financial = getAjaxFinancial();
        for (let i = 0; i < financial.length; i++) {
            // Lấy 5 năm
            if ((i + 1) > fiveYear) {
                continue;
            }
            // Lấy ra thông tin của từng năm
            const elmYear = financial[i];
            arrayEPS.push(elmYear.EPS);
            arrayBV.push(elmYear.BV);
            arrayPE.push(elmYear.PE);
            arrayROA.push(elmYear.ROA);
            arrayROE.push(elmYear.ROE);
            arrayROS.push(elmYear.ROS);
            arrayGOS.push(elmYear.GOS);
            arrayDAR.push(elmYear.DAR);

            // Tính trùng bình
            strEPS += elmYear.EPS;
            strBV += elmYear.BV;
            strPE += elmYear.PE;
            strROA += elmYear.ROA;
            strROE += elmYear.ROE;
            strROS += elmYear.ROS;
            strGOS += elmYear.GOS;
            strDAR += elmYear.DAR;
        }
        arrayFinancial = {}
        // Kết quả trả về
        arrayFinancial.arrayEPS = arrayEPS;
        arrayFinancial.arrayBV = arrayBV;
        arrayFinancial.arrayPE = arrayPE;
        arrayFinancial.arrayROA = arrayROA;
        arrayFinancial.arrayROE = arrayROE;
        arrayFinancial.arrayROS = arrayROS;
        arrayFinancial.arrayGOS = arrayGOS;
        arrayFinancial.arrayDAR = arrayDAR;
        arrayFinancial.EPS = numberRound(strEPS / fiveYear);
        arrayFinancial.BV = numberRound(strBV / fiveYear);
        arrayFinancial.PE = numberRound(strPE / fiveYear);
        arrayFinancial.ROA = numberRound(strROA / fiveYear);
        arrayFinancial.ROE = numberRound(strROE / fiveYear);
        arrayFinancial.ROS = numberRound(strROS / fiveYear);
        arrayFinancial.GOS = numberRound(strGOS / fiveYear);
        arrayFinancial.DAR = numberRound(strDAR / fiveYear);

        return arrayFinancial;
    }
    return arrayFinancial;
}

// Lấy vốn chủ sở hữu
var arrayVCSH = [];
function getVCSH () {
    
    if (arrayVCSH.length === 0) {
        financialReports = getFinancialReports();
        var elmHeader = $(financialReports).find('#ContentPlaceHolder1_CompanyInfo_FinanceStatement1_rptNhomChiTieu_rptData_1_TrData_4 > td')
        elmHeader.splice(0, 1);
        elmHeader.splice(elmHeader.length - 1, 1);
        for (let i = 0; i < elmHeader.length; i++) {
            // Theo đơn vị 1.000 VNĐ
            const elmValue = elmHeader[i];
            // Đổi đợn vị theo tỷ VNĐ
            var number = convertNumber(elmValue.innerText) / 1000000
            arrayVCSH.push(numberRound(number));
        }
        return arrayVCSH;
    }
    return arrayVCSH;
}

// Lấy doanh thu bán hàng và CCDV
var arrayDTBH = [];
function listDTBH () {
    
    if (arrayDTBH.length === 0) {
        financialReports = getFinancialReports();
        var elmHeader = $(financialReports).find('#ContentPlaceHolder1_CompanyInfo_FinanceStatement1_rptNhomChiTieu_rptData_0_TrData_0 > td')
        elmHeader.splice(0, 1);
        elmHeader.splice(elmHeader.length - 1, 1);
        for (let i = 0; i < elmHeader.length; i++) {
            // Theo đơn vị 1.000 VNĐ
            const elmValue = elmHeader[i];
            // Đổi đợn vị theo tỷ VNĐ
            var number = convertNumber(elmValue.innerText) / 1000000
            arrayDTBH.push(numberRound(number));
        }
        return arrayDTBH;
    }
    return arrayDTBH;
}

// Lấy doanh thu tăng đều theo biểu đồ (Đạt = 1, Không đạt = 0)
var strDTBH = null;
function isGrowUpDTBH () {

    if (strDTBH === null) {
        var tmpArrayDTBH = listDTBH();
        var tmpValueBefore = 0
        for (let i = 0; i < tmpArrayDTBH.length; i++) {
            const elmValue = tmpArrayDTBH[i];
            if (tmpValueBefore < elmValue) {
                strDTBH = 1
                tmpValueBefore = elmValue;
            } else {
                strDTBH = 0;
                break;
            }
        }
        return strDTBH;
    }
    return strDTBH;
}


// Lấy lợi nhuận gộp về BH và CCDV
var arrayLNG = [];
function listLNG () {
    
    if (arrayLNG.length === 0) {
        financialReports = getFinancialReports();
        var elmHeader = $(financialReports).find('#ContentPlaceHolder1_CompanyInfo_FinanceStatement1_rptNhomChiTieu_rptData_0_TrData_2 > td')
        elmHeader.splice(0, 1);
        elmHeader.splice(elmHeader.length - 1, 1);
        for (let i = 0; i < elmHeader.length; i++) {
            // Theo đơn vị 1.000 VNĐ
            const elmValue = elmHeader[i];
            // Đổi đợn vị theo tỷ VNĐ
            var number = convertNumber(elmValue.innerText) / 1000000
            arrayLNG.push(numberRound(number));
        }
        return arrayLNG;
    }
    return arrayLNG;
}

// Lấy lợi nhuận gộp tăng đều theo biểu đồ (Đạt=1, Không đạt = 0)
var strLNG = null;
function isGrowUpLNG () {

    if (strLNG === null) {
        var tmpArrayLNG = listDTBH();
        var tmpValueBefore = 0
        for (let i = 0; i < tmpArrayLNG.length; i++) {
            const elmValue = tmpArrayLNG[i];
            if (tmpValueBefore < elmValue) {
                strLNG = 1
                tmpValueBefore = elmValue;
            } else {
                strLNG = 0;
                break;
            }
        }
        return strLNG;
    }
    return strLNG;
}

// Lấy vốn chủ sở hữu (mới nhất)
var strLatestVCSH = [];
function getLatestVCSH () {
    
    if (arrayVCSH.length === 0) {
        arrayVCSH = getVCSH();
        return arrayVCSH[arrayVCSH.length - 1];
    }
    return arrayVCSH[arrayVCSH.length - 1];
}

// Lấy lợi nhuận sau thuế
var arrayLNST = [];
function listLNST () {
    
    if (arrayLNST.length === 0) {
        financialReports = getFinancialReports();
        var elmHeader = $(financialReports).find('#ContentPlaceHolder1_CompanyInfo_FinanceStatement1_rptNhomChiTieu_rptData_0_TrData_6 > td')
        elmHeader.splice(0, 1);
        elmHeader.splice(elmHeader.length - 1, 1);
        for (let i = 0; i < elmHeader.length; i++) {
            // Theo đơn vị 1.000 VNĐ
            const elmValue = elmHeader[i];
            // Đổi đợn vị theo tỷ VNĐ
            var number = convertNumber(elmValue.innerText) / 1000000
            arrayLNST.push(numberRound(number));
        }
        return arrayLNST;
    }
    return arrayLNST;
}

// Lấy thị giá cổ phiếu (đồng/cp)
var strTGCP = null;
function getTGCP() {

    if (strTGCP === null) {
        financialReports = getFinancialReports();
        const elmHeader = $(financialReports).find('div.dltlu-point');
        strTGCP = convertNumber(elmHeader.text()) * 1000;
        return strTGCP;
    }

    return strTGCP;
}

// Lấy cổ tức bằng tiền mặt
var strCTBTM = null;
function getCTBTM() {

    if (strCTBTM === null) {
        financialReports = getFinancialReports();
        const elmHeader = $(financialReports).find('div.l:contains("Cổ tức bằng tiền mặt")');
        strCTBTM = removePercent(elmHeader.next().text());
        if (strCTBTM === 'N/A') {
            strCTBTM = '0';
        }
        strCTBTM = strCTBTM.split('-');
        return strCTBTM[0] + '%';
    }

    return strCTBTM;
}

// Lấy KLCP đang lưu hành
var strKLCPDLH = null;
function getKLCPDLH() {

    if (strKLCPDLH === null) {
        financialReports = getFinancialReports();
        const elmHeader = $(financialReports).find('b:contains("KLCP đang lưu hành:")');
        var number = convertNumber(elmHeader.parent().next().text()) / 1000000;
        strKLCPDLH = numberRound(number);
        return strKLCPDLH;
    }

    return strKLCPDLH;
}

// Đọc data từ cafef.vn
var financialReports = null;
function getFinancialReports() {

    if (financialReports === null) {
        $.ajax({
            url: urlFinancialReports,
            async: false,
            type: 'GET',
            success: function(reps){
                financialReports = reps;
            }
        });
    }
    return financialReports;
}

// Đọc data từ cafef.vn (Chỉ số tài chính)
var financial = null;
function getAjaxFinancial() {

    if (financial === null) {
        $.ajax({
            url: urlFinancial,
            async: false,
            dataType : 'json',
            success: function(reps){
                financial = reps;
            }
        });
    }
    return financial;
}

// Common
function numberRound (value) {

    return value.toFixed(2);
}

function convertNumber(value) {

    return Number(value.replace(/\n/g, '').replace(/\s/g, '').replace(/,/g, ''));
}

function removePercent(value) {

    return value.replace(/\s/g, '').replace(/%/g, '');
}