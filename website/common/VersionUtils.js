/**
 * Class VersionUtils
 *
 * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
 * @date 2024/02/14
 * @class VersionUtils
 */
class VersionUtils {

    /**
     * Import CSS/JS
     *
     * @author TienPD3@icloud.com (https://paypal.me/tienpd3)
     * @date 2024/02/14
     * @static
     * @param {string} input
     * @memberof VersionUtils
     */
    static importPlugin(input) {
        const script = document.createElement('script');
        script.src = `${input}?v=${DatetimeUtils.getSystemDateTime()}`;
        document.head.appendChild(script);
    }
}
