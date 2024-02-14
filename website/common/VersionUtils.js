/**
 * Class VersionUtils
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @class VersionUtils
 */
class VersionUtils {

    /**
     * import CSS/JS
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/14
     * @static
     * @param {*} input
     * @memberof VersionUtils
     */
    static importPlugin(input) {
        document.write('<script src="' + input + '?v=' + DatetimeUtils.getSystemDateTime() + '"\><\/script>');
    }
}
