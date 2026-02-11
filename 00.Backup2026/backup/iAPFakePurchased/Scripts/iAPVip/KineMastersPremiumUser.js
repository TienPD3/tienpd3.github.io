var obj = {
  is_valid_device: true,
  has_valid_subscription: true,
  expiration_date_ms: 4098231805000,
  is_table_resettable: true,
  subscription_product_id: "com.kinemaster.sub.annual",
  state_code: 0,
};

$done({ body: JSON.stringify(obj) });
