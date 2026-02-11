/**
 *
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @class DatetimeUtils
 */
class DatetimeUtils {

    /**
     * Get system date
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/14
     * @static
     * @return {*} 
     * @memberof DatetimeUtils
     */
    static getSystemDate() {
        return moment().format('YYYY-MM-DD');
    }

    /**
     * Get system date time
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/14
     * @static
     * @return {*} 
     * @memberof DatetimeUtils
     */
    static getSystemDateTime() {
        return moment().format('YYYYMMDDHHMMSS');
    }

    /**
     * Get year 
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/14
     * @static
     * @return {*} 
     * @memberof DatetimeUtils
     */
    static getYear() {
        return moment().format('YYYY');
    }
}