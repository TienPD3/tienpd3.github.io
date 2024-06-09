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
        return input ? '' : input;
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
        const num = parseFloat(input);
        return isNaN(num) ? 'N/A' : (num / 1000000000).toFixed(2);
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
        const num = parseFloat(input);
        if (isNaN(num)) {
            return 'N/A';
        }
        const formattedNum = (num / 1000000000).toFixed(2);
        return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
        if (!input) {
            return 'N/A';
        }
        const num = Number(input);
        if (isNaN(num)) {
            return 'N/A';
        }
        return (num / 1000000).toFixed(2);
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
        if (input == null || input === '') {
            return 'N/A';
        }
        const num = Number(input);
        if (isNaN(num)) {
            return 'N/A';
        }
        const formattedNum = (num / 1000000).toFixed(2);
        return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
        if (input == null || input === '') {
            return 'N/A';
        }
        const num = Number(input);
        if (isNaN(num)) {
            return 'N/A';
        }
        return num.toFixed(2);
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
        if (input == null || input === '') {
            return 'N/A';
        }
        const num = Number(input);
        if (isNaN(num)) {
            return 'N/A';
        }
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

