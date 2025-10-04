/**
 * Business rule utils
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/17
 * @class BusinessRuleUtils
 */
class BusinessRuleUtils {

    constructor() {
        this.varObj = {};
        this.varObj.inputBefore = 0;
        this.varObj.isGrowUp = 1;
        this.varObj.isPositiveCashFlow = 1;
    }

    /**
     * Tính toán việc tăng đều
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/17
     * @static
     * @param {*} inputCurrent
     * @memberof BusinessRuleUtils
     */
    isGrowUp(inputCurrent) {

        if (this.varObj.inputBefore == 0) {
            this.varObj.inputBefore = inputCurrent;
        } else if (this.varObj.inputBefore < inputCurrent) {
            this.varObj.inputBefore = inputCurrent;
            this.varObj.isGrowUp = 0;
        } else {
            this.varObj.inputBefore = inputCurrent;
        }
    }

    
    /**
     * Tính toán dòng tiền dương
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/17
     * @static
     * @param {*} inputCurrent
     * @memberof BusinessRuleUtils
     */
    isPositiveCashFlow(inputCurrent) {

        if (inputCurrent < 0) {
            this.varObj.isPositiveCashFlow = 0;
        }
    }
}
