var accessTokenSimplize = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0aWVucGQzQGljbG91ZC5jb20iLCJhdXRoIjoiUk9MRV9VU0VSIiwidWlkIjo5NDc0LCJleHAiOjE2Nzk0NjQ3MjJ9.IChqwe_0E0qQy1g9VR4L0sG0kena1yeH5giWRTzQljHW44oxwv432MipKucNaOWLvVm5rYoU7eAwnOB0MIg1vw';

var urlStockListSimplize = '';
var urlStockFilterSimplize = '';

function buildUrlSimplize() {

    urlStockListSimplize = 'https://api.simplize.vn/api/personalize/screener/list';
    urlStockFilterSimplize = 'https://api.simplize.vn/api/company/screener/filter'
}

// ----- START Các tiêu chí -----

var stockListSimplize = null;
function getAjaxStockListSimplize() {

    if (stockListSimplize === null) {

        $.ajax({
            url: urlStockListSimplize,
            async: false,
            dataType : 'json',
            headers: {
                authorization : accessTokenSimplize
            },
            success: function(reps){
                stockListSimplize = reps.data;
            }
        });
    }
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
            return a.id > b.id ? 1 : (a.id === b.id ? 0 : -1 );
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
        headers: {
            authorization : accessTokenSimplize
        },
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