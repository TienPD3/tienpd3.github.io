
var updVersion = null;
function getAjaxUpdateVersion() {

    if (updVersion === null) {
        $.ajax({
            url: 'website/package.json?cache=' + uuidv4(),
            async: false,
            dataType : 'json',
            success: function(reps){
                updVersion = reps;
            }
        });
    }
    return updVersion;
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function getUpdateVersion() {

    var tmpUpdVerClient = localStorage.getItem('updVer');
    tmpUpdVerClient = JSON.parse(tmpUpdVerClient);
    const tmpUpdVerServer = getAjaxUpdateVersion();
    if (tmpUpdVerClient === null || tmpUpdVerClient.version !== tmpUpdVerServer.version) {
        localStorage.setItem('updVer', JSON.stringify(tmpUpdVerServer));
        tmpUpdVerServer.isUpdate = true;
        return tmpUpdVerServer;
    }
    tmpUpdVerClient.isUpdate = false;
    return tmpUpdVerClient;
}

function updateLocalStoreStockCode(arrayStockCodeSimplize) {

    var tmpUpdVerClient = localStorage.getItem('updVer');
    tmpUpdVerClient = JSON.parse(tmpUpdVerClient);
    tmpUpdVerClient.data.arrayStockCodeSimplize = JSON.stringify(arrayStockCodeSimplize);
    localStorage.setItem('updVer', JSON.stringify(tmpUpdVerClient));
}