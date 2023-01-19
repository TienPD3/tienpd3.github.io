var accessToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSIsImtpZCI6IkdYdExONzViZlZQakdvNERWdjV4QkRITHpnSSJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4iLCJhdWQiOiJodHRwczovL2FjY291bnRzLmZpcmVhbnQudm4vcmVzb3VyY2VzIiwiZXhwIjoxOTQxMDQ2MTc2LCJuYmYiOjE2NDEwNDYxNzYsImNsaWVudF9pZCI6ImZpcmVhbnQudHJhZGVzdGF0aW9uIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIiwiZW1haWwiLCJhY2NvdW50cy1yZWFkIiwiYWNjb3VudHMtd3JpdGUiLCJvcmRlcnMtcmVhZCIsIm9yZGVycy13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiaW5kaXZpZHVhbHMtcmVhZCIsImZpbmFuY2UtcmVhZCIsInBvc3RzLXdyaXRlIiwicG9zdHMtcmVhZCIsInN5bWJvbHMtcmVhZCIsInVzZXItZGF0YS1yZWFkIiwidXNlci1kYXRhLXdyaXRlIiwidXNlcnMtcmVhZCIsInNlYXJjaCIsImFjYWRlbXktcmVhZCIsImFjYWRlbXktd3JpdGUiLCJibG9nLXJlYWQiLCJpbnZlc3RvcGVkaWEtcmVhZCJdLCJzdWIiOiJiN2RiZDEzZC1lZGFhLTQ4ZWQtOGM1YS1iYmI3NzUxZjFhZTMiLCJhdXRoX3RpbWUiOjE2NDEwNDYxNzUsImlkcCI6Imlkc3J2IiwibmFtZSI6InRpZW5wZDNAaWNsb3VkLmNvbSIsInNlY3VyaXR5X3N0YW1wIjoiYTc3ZmFlNjUtZDljNy00ZjExLWJkZWYtYjYzM2QxYWVmYzg2IiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGllbnBkM0BpY2xvdWQuY29tIiwidXNlcm5hbWUiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJmdWxsX25hbWUiOiJQaOG6oW0gRHV5IFRp4bq_biIsImVtYWlsIjoidGllbnBkM0BpY2xvdWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwianRpIjoiOThhZWI4MDBkZDkyZTg5MTEzYWQwNjg1ZDBiM2RiNzEiLCJhbXIiOlsicGFzc3dvcmQiXX0.iY6pSYAvibyON5K3i3zmK91mNAX6UWW_Ec9Dwa23oEvwlFfAhc3eznCs_7Yx2EL6XyLZOOE114nZJCIp9RWNvTyUykxd9TLEC6shwpn9W_GMbt_JwrUVzUA7V4Br3KRiwMWHxLAPK59HXvft2Dvs8hni-zyHlygwtWobi3WVRiqIQLROMY9QrHmZf9Eb9hcPfUhmpKMT2b6ZM5g2IC3xuwysB_IjoPOnrW_4xf-omq0JIoCOwICGXfD7oLcJjzSzZwr2GQ4Yb8vWZA0zuE5IBK3-6Nr7-KL121MS1fhIlHuFijsHKciqhApVYocSO7IS5vrtbzHe5iUG3hTSaTmJzA';
var urlFinancialReports = 'https://s.cafef.vn/hastc/CPC-cong-ty-co-phan-thuoc-sat-trung-can-tho.chn';
var arrayLNST = [];
var strKLCPDLH = null;
var financialReports = null;

// Lấy lợi nhuận sau thuế
function getLNST () {
    
    if (arrayLNST.length === 0) {
        financialReports = getFinancialReports();
        var elmLNST = $(financialReports).find('#ContentPlaceHolder1_CompanyInfo_FinanceStatement1_rptNhomChiTieu_rptData_0_TrData_6 > td')
        elmLNST.splice(0, 1);
        elmLNST.splice(arrayLNST.length - 1, 1);
        for (let i = 0; i < elmLNST.length; i++) {
            // Theo đơn vị 1.000 VNĐ
            const elm = elmLNST[i];
            // Đổi đợn vị theo tỷ VNĐ
            var number = convertNumber(elm.innerText) / 1000000
            number = number.toFixed(2);
            arrayLNST.push(number);
        }
        return arrayLNST;
    }
    return arrayLNST;
}

function convertNumber(value) {

    return Number(value.replace(/\n/g, '').replace(/\s/g, '').replace(/,/g, ''));
}

// Lấy KLCP đang lưu hành
function getKLCPDLH() {

    if (strKLCPDLH === null) {
        financialReports = getFinancialReports();
        const elm = $(financialReports).find('b:contains("Vốn hóa thị trường")');
        strKLCPDLH = convertNumber(elm.parent().next().text());
        return strKLCPDLH;
    }

    return strKLCPDLH;
}

// Đọc data từ cafef.vn
function getFinancialReports() {

    if (financialReports === null) {
        $.ajax({
            url: urlFinancialReports,
            async: false,
            headers: {
                authorization: accessToken
            }, success: function(reps){
                financialReports = reps;
            }
        });
    }
    return financialReports;
}