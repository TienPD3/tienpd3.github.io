var urlFinancialReports = 'https://finance.vietstock.vn/NVL/tai-chinh.htm?tab=KQKD';
// Đọc data từ cafef.vn
var financialReports = null;
function getFinancialReports1() {

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