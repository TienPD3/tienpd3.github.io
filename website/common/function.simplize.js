var accessTokenSimplize = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwidWlkIjo5NDc0LCJzaWQiOiI5Y2M2ZDcyNS1kOTYwLTQzMzgtYmRjZC1jNjNlZjFhYjg0OWYiLCJwZSI6ZmFsc2UsImV4cCI6MTY5MTQ2NzI5N30._-4IqL7kzPGCEQeSRV0QT_qsckT62g-xpOEkxIyr_XuGg7FJJHpNE_T1oJ2fioQDBrYCC4oo9fedNBr234-PmA';

var urlStockListSimplizeCustom = '';
var urlStockListSimplizeDefault = '';
var urlStockListSimplizeError = '';
var urlStockFilterSimplize = '';
var urlSectorPerformanceSimplize = '';
var urlAnalysisSimplize = '';
var headerDataSimplize = {
    authorization : accessTokenSimplize,
    //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}

function buildUrlSimplize() {

    urlStockListSimplizeCustom = 'website/dummy/dummy-all.json?cache=' + uuidv4();
    urlStockListSimplizeDefault = 'https://api.simplize.vn/api/personalize/screener/suggest';
    urlStockListSimplizeError = 'website/dummy/simplize-list.json?cache=' + uuidv4();
    //urlStockListSimplize = urlStockListSimplizeError;
    urlStockFilterSimplize = 'https://api.simplize.vn/api/company/screener/filter';
    urlSectorPerformanceSimplize = 'https://api.simplize.vn/api/company/se/sector-performance'
    urlAnalysisSimplize = 'https://api.simplize.vn/api/company/analysis-metrics-detail/{0}'
}


// ----- START Định giá cổ phiếu -----
var analysisSimplize = null;
function getAjaxAnalysisSimplize(stockCode) {

    $.ajax({
        url: urlAnalysisSimplize.replace('{0}', stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: headerDataSimplize,
        success: function(reps) {
            analysisSimplize = reps.data;
        }
    });
    return analysisSimplize;
}

var overallIntrinsicValue = null;
function getOverallIntrinsicValue(stockCode) {

    analysisSimplize = getAjaxAnalysisSimplize(stockCode);
    overallIntrinsicValue = analysisSimplize.combined.overallIntrinsicValue;
    return overallIntrinsicValue;
}

// ----- END Định giá cổ phiếu -----

// ----- START Các tiêu chí -----

var stockListSimplize = null;
var stockListSimplizeNewData = null;
function getAjaxStockListSimplize() {

    $.ajax({
        url: urlStockListSimplizeCustom,
        async: false,
        dataType : 'json',
        headers: headerDataSimplize,
        success: function(reps) {
            stockListSimplize = reps.data;
        }
    });

    $.ajax({
        url: urlStockListSimplizeDefault,
        async: false,
        dataType : 'json',
        headers: headerDataSimplize,
        success: function(reps){ 
            stockListSimplize = $.merge($.merge([], stockListSimplize), reps.data);
            stockListSimplizeNewData = "";
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            $.ajax({
                url: urlStockListSimplizeError,
                async: false,
                dataType : 'json',
                success: function(reps) {
                    stockListSimplize = $.merge($.merge([], stockListSimplize), reps.data);
                    stockListSimplizeNewData = ''
                    // stockListSimplizeNewData = 'Bộ lọc chứng khoán chưa phải data mới nhất'
                }
            });
        }
    });

    return stockListSimplize;
}

function buildDropdownStockList(idStockFilter) {

    var firstValue = {};
    if (stockListSimplize === null) {
        stockListSimplize = getAjaxStockListSimplize();

        const drpdStockList = $('<select>', {
            class: 'select',
            id: 'drpdStockList',
            name: 'drpdStockList'
        });

        stockListSimplize.sort(function(a, b) {
            return a.id > b.id ? 1 : (a.id === b.id ? 0 : -1);
        });

        var drpdSelected = JSON.parse(localStorage.getItem('drpdSelected'));
        var arrayHtmlStockList = [];

        for (let i = 0; i < stockListSimplize.length; i++) {
            const object = stockListSimplize[i];
            if (i === 0) {
                firstValue.id = object.id;
                firstValue.rules = object.rules;
            }
            
            var tmpSetting = {
                id: object.id,
                text: object.name,
                rules: object.rules
            };
            if (drpdSelected !== null && drpdSelected.stockListSelected !== undefined) {
                if (drpdSelected.stockListSelected == object.id) {
                    tmpSetting.selected = 'selected';
                    firstValue.id = object.id;
                    firstValue.rules = object.rules;
                }
            }

            arrayHtmlStockList.push($('<option>', tmpSetting));
        }
        drpdStockList.append(arrayHtmlStockList);
        idStockFilter.append(drpdStockList);
    }
    return firstValue;
}

// ----- END Các tiêu chí -----

// ----- START Các mã chứng khoán -----

function getAjaxStockCodeSimplize(pRules) {

    var stockCodeSimplize = null;
    $.ajax({
        url: urlStockFilterSimplize,
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'POST',
        data: JSON.stringify({
            page: 0,
            size: 1618,
            rules: pRules
        }),
        headers: headerDataSimplize,
        success: function(reps) {
            stockCodeSimplize = reps.data;
        }
    });
    return stockCodeSimplize;
}

var arrayStockCodeSimplize = {};
var drpdStockCode = null;
function buildDropdownStockCode(pId, pRules) {

    const updateVersion = getUpdateVersion();
    if (updateVersion.isUpdate) {
        arrayStockCodeSimplize = {};
    } else {
        arrayStockCodeSimplize = JSON.parse(updateVersion.data.arrayStockCodeSimplize);
    }

    var tmpStockCodeSimplize = null;
    if (arrayStockCodeSimplize[pId] === undefined || arrayStockCodeSimplize[pId] === null) {
        tmpStockCodeSimplize = getAjaxStockCodeSimplize(pRules);
        arrayStockCodeSimplize[pId] = tmpStockCodeSimplize;
        updateLocalStoreStockCode(arrayStockCodeSimplize);
    } else {
        tmpStockCodeSimplize = arrayStockCodeSimplize[pId];
    }
    if (drpdStockCode === null) {
        drpdStockCode = $('#drpdStockCode');
    } else {
        drpdStockCode.empty();
    }
    
    tmpStockCodeSimplize.sort(function (a, b) {
        return (ORDER_STOCK_CODE[a.stockExchange] || 0) - (ORDER_STOCK_CODE[b.stockExchange] || 0);
    });

    var drpdSelected = JSON.parse(localStorage.getItem('drpdSelected'));
    var arrayHtmlStockCode = [];
    for (let i = 0; i < tmpStockCodeSimplize.length; i++) {
        const object = tmpStockCodeSimplize[i];

        var tmpSetting = {
            id: object.ticker,
            text: object.ticker + ': ' + object.stockExchange
        };
        if (drpdSelected !== null && drpdSelected.stockCodeSelected !== undefined) {
            if (drpdSelected.stockCodeSelected === object.ticker) {
                tmpSetting.selected = 'selected';
            }
        }

        arrayHtmlStockCode.push($('<option>', tmpSetting));
    }
    drpdStockCode.append(arrayHtmlStockCode);
}

// ----- END Các mã chứng khoán -----

// ----- START P/E của các ngành -----
function getAjaxSectorPerformanceSimplize() {

    var sectorPerformanceSimplize = null;
    $.ajax({
        url: urlSectorPerformanceSimplize,
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: headerDataSimplize,
        success: function(reps) {
            sectorPerformanceSimplize = reps.data;
        }
    });
    return sectorPerformanceSimplize;
}

function listTrend() {

    var arraySectorPerformances = [];

    var tmpSectorPerformance = getAjaxSectorPerformanceSimplize();
    var sectorPerformances = tmpSectorPerformance.sectorPerformances;
    var tmpBDS = sectorPerformances.filter(element => element.bcEconomicSectorId == 10)[0];
    var tmpCN = sectorPerformances.filter(element => element.bcEconomicSectorId == 8)[0];
    var tmpHHKTY = sectorPerformances.filter(element => element.bcEconomicSectorId == 4)[0];
    var tmpHHTT = sectorPerformances.filter(element => element.bcEconomicSectorId == 5)[0];
    var tmpCNG = sectorPerformances.filter(element => element.bcEconomicSectorId == 3)[0];
    var tmpNL = sectorPerformances.filter(element => element.bcEconomicSectorId == 1)[0];
    var tmpCSSK = sectorPerformances.filter(element => element.bcEconomicSectorId == 7)[0];
    var tmpTC = sectorPerformances.filter(element => element.bcEconomicSectorId == 6)[0];
    var tmpTI = sectorPerformances.filter(element => element.bcEconomicSectorId == 9)[0];
    var tmpNVL = sectorPerformances.filter(element => element.bcEconomicSectorId == 2)[0];
    var tmpDVHTGD = sectorPerformances.filter(element => element.bcEconomicSectorId == 13)[0];
    arraySectorPerformances.bds = tmpBDS.peRatio;
    arraySectorPerformances.cn = tmpCN.peRatio;
    arraySectorPerformances.hhkty = tmpHHKTY.peRatio;
    arraySectorPerformances.hhty = tmpHHTT.peRatio;
    arraySectorPerformances.cng = tmpCNG.peRatio;
    arraySectorPerformances.nl = tmpNL.peRatio;
    arraySectorPerformances.cssk = tmpCSSK.peRatio;
    arraySectorPerformances.tc = tmpTC.peRatio;
    arraySectorPerformances.ti = tmpTI.peRatio;
    arraySectorPerformances.nvl = tmpNVL.peRatio;
    arraySectorPerformances.dvhtgd = tmpDVHTGD.peRatio;
    arraySectorPerformances.trend = tmpSectorPerformance.statements[0].description.replace("<br/>", "");

    return arraySectorPerformances;
}
// ----- END P/E của các ngành -----