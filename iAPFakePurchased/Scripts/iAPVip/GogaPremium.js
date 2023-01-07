var obj = JSON.parse($response.body);

obj.data = {
  "products" : [
    {
      "expired" : false,
      "product_key" : "GOGA_PREMIUM"
    }
  ],
  "permissions" : [
    "UNLIMITED_HEART",
    "PRONUN",
    "BREAKING",
    "UNLIMITED_ENERGY"
  ],
  "expired_trial" : null,
  "trial_products" : [
    {
      "expired" : false,
      "product_key" : "GOGA_PREMIUM"
    }
  ],
  "is_show_popup" : true
};

$done({ body: JSON.stringify(obj) });
