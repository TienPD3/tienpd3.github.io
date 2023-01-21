var obj = JSON.parse($response.body);

obj.isPremium = true;
obj.membershipExpiredDate = '9999-12-31T00:00:00.000Z';

$done({ body: JSON.stringify(obj) });
