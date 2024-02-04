class DatetimeUtils {

    static getSystemDate() {
        return new Date();
    }

    static getYear() {
        return DatetimeUtils.getSystemDate().getFullYear();
    }
}