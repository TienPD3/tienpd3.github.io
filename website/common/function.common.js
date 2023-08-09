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

Number.prototype.roundInteger = function() {

    var input = this;
    if (input) {
        if (input === 'N/A' || input === 'NA') {
            return 0;
        }
        return Number(input.toFixed(0));
    } else {
        return 0;
    }
};

Date.prototype.toISO = function() {

    var input = this;
    input = input.toISOString();
    return input.split("T")[0];
};

String.prototype.replaceExcel = function(regex, value, isString = false) {

    var input = this;

    if (isValidNumber(value)) {
        if (isString === false) {
            return input.replaceAll('"' + regex + '"', value);
        } else {
            return input.replaceAll(regex, value);
        }
    } else {
        if (value !== undefined) {
            return input.replaceAll(regex, value);
        }
    }
    return input.replaceAll(regex, convertNA(value));
};

Number.prototype.numberFormat = function() { 

    var input = this;
    return input.toLocaleString("en");
}

String.prototype.dateFormat = function (pattern) {
    
    var input = this;

    var monthNames=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var todayDate = new Date(input);                                 
    var date = todayDate.getDate().toString();
    var month = todayDate.getMonth().toString(); 
    var year = todayDate.getFullYear().toString(); 
    var formattedMonth = (todayDate.getMonth() < 10) ? "0" + month : month;
    var formattedDay = (todayDate.getDate() < 10) ? "0" + date : date;
    var result = "";

    switch (pattern) {
        case "M/d/yyyy": 
            formattedMonth = formattedMonth.indexOf("0") == 0 ? formattedMonth.substring(1, 2) : formattedMonth;
            formattedDay = formattedDay.indexOf("0") == 0 ? formattedDay.substring(1, 2) : formattedDay;
            result  = formattedMonth + '/' + formattedDay + '/' + year;
            break;
        case "M/d/yy": 
            formattedMonth = formattedMonth.indexOf("0") == 0 ? formattedMonth.substring(1, 2) : formattedMonth;
            formattedDay = formattedDay.indexOf("0") == 0 ? formattedDay.substring(1, 2) : formattedDay;
            result = formattedMonth + '/' + formattedDay + '/' + year.substr(2);
            break;
        case "MM/dd/yy":
            result = formattedMonth + '/' + formattedDay + '/' + year.substr(2);
            break;
        case "MM/dd/yyyy":
            result = formattedMonth + '/' + formattedDay + '/' + year;
            break;
        case "yy/MM/dd":
            result = year.substr(2) + '/' + formattedMonth + '/' + formattedDay;
            break;
        case "yyyy-MM-dd":
            result = year + '-' + formattedMonth + '-' + formattedDay;
            break;
        case "yyyy/MM/dd":
            result = year + '/' + formattedMonth + '/' + formattedDay;
            break;
        case "dd-MMM-yy":
            result = formattedDay + '-' + monthNames[todayDate.getMonth()].substr(3) + '-' + year.substr(2);
            break;
        case "MMMM d, yyyy":
            result = todayDate.toLocaleDateString("en-us", { day: 'numeric', month: 'long', year: 'numeric' });
            break;
    }

    return result;
}

Storage.prototype.removeStorage = function (name) {
    try {
        localStorage.removeItem(name);
        localStorage.removeItem(name + '_expiresIn');
    } catch(e) {
        return false;
    }
    return true;
}

Storage.prototype.removeStorageExpires = function () {
    try {
        var keys = Object.keys(localStorage);

        for (let i = 0; i < keys.length; i++) {
            localStorage.getStorage(keys[i]);
        }
    } catch(e) {
        return false;
    }
    return true;
}

Storage.prototype.getStorage = function (key) {

    if (key.indexOf('_expiresIn') > 0) {
        return null;
    }

    var now = Date.now();  // epoch time, lets deal only with integer
    // set expiration for storage
    var expiresIn = localStorage.getItem(key + '_expiresIn');
    if (expiresIn === undefined || expiresIn === null) { 
        expiresIn = 0; 
    }

    var value = localStorage.getItem(key);
    if (UNLIMITED !== expiresIn) {
        if (Number(expiresIn) < now) { // Expired
            localStorage.removeStorage(key);
        }
    }
    return value;
}

const DAY_30 = 24 * 60 * 60 * 30;
const DAY_7 = 24 * 60 * 60 * 7;
const UNLIMITED = 'Unlimited'
Storage.prototype.setStorage = function (key, value, expires) {

    var schedule = null;
    if (UNLIMITED === expires) {
        schedule = UNLIMITED;
    } else {
        if (expires === undefined || expires === null) {
            expires = (DAY_30);  // default: seconds for 30 day
        } else {
            expires = Math.abs(expires); // make sure it's positive
        }
    
        var now = Date.now();  // millisecs since epoch time, lets deal only with integer
        schedule = now + expires * 1000; 
    }
    
    try {
        localStorage.setItem(key, value);
        localStorage.setItem(key + '_expiresIn', schedule);
    } catch(e) {
        return false;
    }
    return true;
}