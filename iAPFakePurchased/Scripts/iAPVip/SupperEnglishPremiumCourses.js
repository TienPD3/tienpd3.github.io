var arrayObj = JSON.parse($response.body);

arrayObj.forEach(obj => {
    obj.is_premium = true;
    obj.isTrialCourse = true;
    obj.userCourseExpiredDate = '9999-12-31T00:00:00.000Z';
});

$done({ body: JSON.stringify(arrayObj) });
