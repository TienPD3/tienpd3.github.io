var arrayObj = JSON.parse($response.body);

arrayObj.forEach(obj => {
    obj.is_premium = true;
    obj.isTrialCourse = true;
    obj.userCourseExpiredDate = '9999-12-31';
    obj.isEnrolled = 1;
});

$done({ body: JSON.stringify(arrayObj) });
