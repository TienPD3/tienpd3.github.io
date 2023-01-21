var obj = JSON.parse($response.body);

obj.isPremium = true;
obj.membershipExpiredDate = '9999-12-31';

$done({ body: JSON.stringify(obj) });
