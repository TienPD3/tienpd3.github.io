var accessTokenSimplize = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwidWlkIjo5NDc0LCJzaWQiOiIyNGRlN2I0MS03M2NlLTQzOGUtOTlmNC05OGQ1YjhmMjNiOTMiLCJwZSI6ZmFsc2UsImV4cCI6MTY5MTc2MTQzMn0.sdZrprpCZQE3IB2WZmG_doFMDzkftI9StZEO2OFj6Tr4obwWl-etGAncAI1G8Akaciz9JuXTbtICBYqeNBTnaw';

var urlStockListSimplizeCustom = '';
var urlStockListSimplizeDefault = '';
var urlStockListSimplizeError = '';
var urlStockFilterSimplize = '';
var urlSectorPerformanceSimplize = '';
var urlAnalysisSimplize = '';
var urlFinancialIndicatorsQuarterSimplize = '';
var urlFinancialIndicatorsYearSimplize = '';
var headerDataSimplize = {
    authorization : accessTokenSimplize,
    //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}

function buildUrlSimplize() {

    urlStockListSimplizeCustom = 'website/dummy/simplize-screener-list.json?cache=' + uuidv4();
    urlStockListSimplizeError = 'website/dummy/simplize-screener-suggest.json?cache=' + uuidv4();
    // urlStockListSimplizeDefault = 'https://api.simplize.vn/api/personalize/screener/suggest';
    urlStockListSimplizeDefault = urlStockListSimplizeError;
    //urlStockListSimplize = urlStockListSimplizeError;
    urlStockFilterSimplize = 'https://api.simplize.vn/api/company/screener/filter';
    urlSectorPerformanceSimplize = 'https://api.simplize.vn/api/company/se/sector-performance'
    urlAnalysisSimplize = 'https://api.simplize.vn/api/company/analysis-metrics-detail/{0}'
    // Chỉ số tài chính
    urlFinancialIndicatorsQuarterSimplize = 'https://api.simplize.vn/api/company/fi/ratio//{0}?period=Q&size=5'
    urlFinancialIndicatorsYearSimplize = 'https://api.simplize.vn/api/company/fi/ratio//{0}?period=Y&size=3'
}
// ----- START Chỉ số tài chính -----
var financialIndicatorsQuarterSimplize = null;
var financialIndicatorsYearSimplize = null;
function getAjaxFinancialIndicatorsQuarterSimplize(stockCode) {
    $.ajax({
        url: urlFinancialIndicatorsQuarterSimplize.replace('{0}', stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: headerDataSimplize,
        success: function(reps) {
            financialIndicatorsQuarterSimplize = reps.data;
        }
    });
    return financialIndicatorsQuarterSimplize;
}
function getAjaxFinancialIndicatorsYearSimplize(stockCode) {
    $.ajax({
        url: urlFinancialIndicatorsYearSimplize.replace('{0}', stockCode),
        async: false,
        contentType: "application/json",
        dataType : 'json',
        type: 'GET',
        headers: headerDataSimplize,
        success: function(reps) {
            financialIndicatorsYearSimplize = reps.data;
        }
    });
    return financialIndicatorsYearSimplize;
}

var arrayEarningsPerShareByQuarter = null;
var arrayEarningsPerShareByYear = null;
function earningsPerShareByQuarter(stockCode) {
    financialIndicatorsQuarterSimplize = getAjaxFinancialIndicatorsQuarterSimplize(stockCode);
    arrayEarningsPerShareByQuarter = [];
    for (let i = 0; i < financialIndicatorsQuarterSimplize.items.length; i++) {
        const itemCurrent = financialIndicatorsQuarterSimplize.items[i];
        const itemBefore = financialIndicatorsQuarterSimplize.items[i + 1];
        var earningsPerShareByQuarter = {};
        earningsPerShareByQuarter.quarter = itemCurrent.periodDateName;
        earningsPerShareByQuarter.epsQuarter = itemCurrent.op4;
        if (i + 1 != financialIndicatorsQuarterSimplize.items.length) {
            earningsPerShareByQuarter.epsGrowthQuarter = ((itemBefore.op4 - itemCurrent.op4) / itemCurrent.op4);
        } else {
            earningsPerShareByQuarter.epsGrowthQuarter = '';
        }
        arrayEarningsPerShareByQuarter.push(earningsPerShareByQuarter);
    }
    return arrayEarningsPerShareByQuarter;
}

function earningsPerShareByYear(stockCode) {
    financialIndicatorsYearSimplize = getAjaxFinancialIndicatorsYearSimplize(stockCode);
    arrayEarningsPerShareByYear = [];
    for (let i = 0; i < financialIndicatorsYearSimplize.items.length; i++) {
        const itemCurrent = financialIndicatorsYearSimplize.items[i];
        const itemBefore = financialIndicatorsYearSimplize.items[i + 1];
        var earningsPerShareByYear = {};
        earningsPerShareByYear.year = itemCurrent.periodDateName;
        earningsPerShareByYear.epsYear = itemCurrent.op4;
        if (i + 1 != financialIndicatorsYearSimplize.items.length) {
            earningsPerShareByYear.epsGrowthYear = ((itemCurrent.op4 - itemBefore.op4) / Math.abs(itemBefore.op4));
        } else {
            earningsPerShareByYear.epsGrowthYear = '';
        }
        arrayEarningsPerShareByYear.push(earningsPerShareByYear);
    }
    arrayEarningsPerShareByYear.push({year: '', epsYear: '', epsGrowthYear: ''});
    arrayEarningsPerShareByYear.push({year: '', epsYear: '', epsGrowthYear: ''});

    return arrayEarningsPerShareByYear;
}
// ----- END Chỉ số tài chính -----



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
            stockListSimplize = {};
            stockListSimplize.data = reps.data;
            stockListSimplize.sizeCustom = reps.data.length;
            stockListSimplize.data.sort(function(a, b) {
                return a.id > b.id ? 1 : (a.id === b.id ? 0 : -1);
            });
        }
    });

    $.ajax({
        url: urlStockListSimplizeDefault,
        async: false,
        dataType : 'json',
        headers: headerDataSimplize,
        success: function(reps){ 
            stockListSimplize.data = $.merge($.merge([], stockListSimplize.data), reps.data);
            stockListSimplizeNewData = "";
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            $.ajax({
                url: urlStockListSimplizeError,
                async: false,
                dataType : 'json',
                success: function(reps) {
                    stockListSimplize.data = $.merge($.merge([], stockListSimplize.data), reps.data);
                    stockListSimplizeNewData = ''
                    // stockListSimplizeNewData = 'Bộ lọc chứng khoán chưa phải data mới nhất'
                }
            });
        }
    });

    return stockListSimplize;
}

function buildDropdownStockList() {

    var firstValue = {};
    if (stockListSimplize === null) {
        stockListSimplize = getAjaxStockListSimplize();

        const drpdStockList = $('#drpdStockList');

        var drpdSelected = JSON.parse(localStorage.getStorage('drpdSelected'));
        var arrayHtmlStockList = [];

        // Setting Caterory
        var categoryBranch = null;
        for (let i = 0; i < stockListSimplize.data.length; i++) {
            const object = stockListSimplize.data[i];
            if (i === 0) {
                firstValue.id = object.id;
                firstValue.rules = object.rules;
            }
            
            // Setting Caterory
            var idxStart = 2;
            if (i === idxStart) {
                var tmpSettingCaterory = {
                    label: 'Ngành'
                };
                categoryBranch = $('<optgroup>', tmpSettingCaterory);
            } else if (i === stockListSimplize.sizeCustom) {
                var tmpSettingCaterory = {
                    label: 'Bộ lọc gợi ý'
                };
                categoryBranch = $('<optgroup>', tmpSettingCaterory);
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

            if (i >= idxStart) {
                categoryBranch = categoryBranch.append($('<option>', tmpSetting));
                arrayHtmlStockList.push(categoryBranch);
            } else {
                arrayHtmlStockList.push($('<option>', tmpSetting));
            }
            
        }
        drpdStockList.append(arrayHtmlStockList);
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
            size: 9999,
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
    if (pRules.length > 0) {
        if (arrayStockCodeSimplize[pId] === undefined || arrayStockCodeSimplize[pId] === null) {
            tmpStockCodeSimplize = getAjaxStockCodeSimplize(pRules);
            arrayStockCodeSimplize[pId] = tmpStockCodeSimplize;
            updateLocalStoreStockCode(arrayStockCodeSimplize);
        } else {
            tmpStockCodeSimplize = arrayStockCodeSimplize[pId];
        }
    } else {
        var tmpStockValueList = localStorage.getStorage('stockValue');
        if (tmpStockValueList === null) {
            tmpStockValueList = [];
        } else {
            tmpStockValueList = JSON.parse(tmpStockValueList);
        }
        tmpStockCodeSimplize = tmpStockValueList
    }

    if (drpdStockCode === null) {
        drpdStockCode = $('#drpdStockCode');
    } else {
        drpdStockCode.empty();
    }
    
    tmpStockCodeSimplize.sort(function (a, b) {
        return (ORDER_STOCK_CODE[a.stockExchange] || 0) - (ORDER_STOCK_CODE[b.stockExchange] || 0);
    });

    var drpdSelected = JSON.parse(localStorage.getStorage('drpdSelected'));
    var arrayHtmlStockCode = [];
    for (let i = 0; i < tmpStockCodeSimplize.length; i++) {
        const object = tmpStockCodeSimplize[i];
        
        var tickerStockExchange = null;
        if (pRules.length > 0) {
            tickerStockExchange = object.ticker + ': ' + object.stockExchange
        } else {
            tickerStockExchange = object.stockExchange;
        }

        var tmpSetting = {
            id: object.ticker,
            text: tickerStockExchange
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