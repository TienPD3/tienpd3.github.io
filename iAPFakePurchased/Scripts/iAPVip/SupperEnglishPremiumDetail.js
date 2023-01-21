var obj = JSON.parse($response.body);

obj.isTrialCourse = true;
obj.courseExpiredDate = '9999-12-31';
obj.isEnrolled = 1;

$done({ body: JSON.stringify(arrayObj) });
