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