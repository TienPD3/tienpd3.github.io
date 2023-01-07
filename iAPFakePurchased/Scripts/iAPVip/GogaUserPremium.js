// {
//   "type" : "DATA",
//   "data" : {
//     "products" : [
//       {
//         "status" : 1,
//         "_id" : "62f5dc99a88d18047905a7c4",
//         "product_key" : "GOGA_PREMIUM",
//         "is_unlimited" : false,
//         "language" : "vi",
//         "createdAt" : "2022-08-12T04:52:41.428Z",
//         "expired_date" : "2023-02-08T04:52:41.430Z"
//       }
//     ]
//   }
// }

var obj = JSON.parse($response.body);

obj["data"]["products"][0]["status"] = 1;
obj["data"]["products"][0]["product_key"] = "GOGA_PREMIUM";
obj["data"]["products"][0]["is_unlimited"] = false
obj["data"]["products"][0]["expired_date"] = "9999-12-31T00:00:00.000Z"

$done({ body: JSON.stringify(obj) });
