var obj = JSON.parse($response.body);

obj.data.is_purchased = true;
obj.data.playlist.is_purchased = true;

$done({ body: JSON.stringify(obj) });
