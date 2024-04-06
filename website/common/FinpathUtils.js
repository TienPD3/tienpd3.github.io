const SIZE_DEFAULT = 5;
class FinpathUtils {

    constructor(stockCode, stockName, size = SIZE_DEFAULT) {
        this.stockCode = stockCode;
        this.stockName = stockName;
        this.size = size;
        this.isBank = false;
        if (stockName.indexOf('Ngân hàng') == 0) {
            this.isBank = true;
        }
    }

    financialratiosFinpath() {
        
    }
}
