/**
 * StringUtils Class
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/03/01
 * @class StringUtils
 */
class StringUtils {

    /**
     * Convert blank
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static convertBlank(input) {
        return input.length == 0? input: '';
    }

    /**
     * Format cash billion
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCashBillion(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input) / 1000000000;
        return input.toFixed(2);
    }

    /**
     * Format cash billion comma
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCashBillionComma(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input) / 1000000000;
        input = input.toFixed(2);
        return input.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Format cash million
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCashMillion(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input) / 1000000;
        return input.toFixed(2);
    }

    /**
     * Format cash million comma
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCashMillionComma(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input) / 1000000;
        input = input.toFixed(2);
        return input.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Format cash
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCash(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input);
        return input = input.toFixed(2);
    }

    /**
     * Format cash comma
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/03/01
     * @static
     * @param {*} input
     * @return {*} 
     * @memberof StringUtils
     */
    static formatCashComma(input) {

        if (input === undefined || input.length === 0) {
            return 'N/A';
        }
        input = Number(input);
        input = input.toFixed(2);
        return input.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}