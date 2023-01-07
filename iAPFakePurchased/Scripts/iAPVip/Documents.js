// var obj = {
//   originalTransactionId: "20000625420102",
//   subscriptionState: "trial",
//   isInGracePeriod: false,
//   subscriptionExpirationDate: "17:48 25/11/2099",
//   isDocuments6User: true,
//   isEligibleForIntroPeriod: false,
//   subscriptionAutoRenewStatus: "autoRenewOff",
//   subscriptionReceiptId: "1530908572000",
// };

// var obj = {
//   inAppStates: [
//     {
//       originalTransactionId: "20000625420102",

//       subscriptionState: "trial",
//       isInGracePeriod: false,
//       subscriptionExpirationDate: "17:48 25/11/2099",
//       isDocuments6User: true,
//       isEligibleForIntroPeriod: false,
//       subscriptionAutoRenewStatus: "autoRenewOff",

//       entitlements: [],
//       type: "custom purchase",
//       productId: "documents6-user",
//     },
//   ],
//   statisticsInfo: {
//     events: [],
//   },
//   receiptId: 1530908572000,
//   receiptStatus: "OK",
//   bundleId: "com.readdle.ReaddleDocsIPad",
//   chargingPlatform: "iOS AppStore",
// };

var obj = {
  is_valid_device: true,
  has_valid_subscription: true,
  expiration_date_ms: 4097755192000,
  is_table_resettable: true,
  subscription_product_id: "com.kinemaster.sub.annual.ia2",
  state_code: 0,
};

$done({ body: JSON.stringify(obj) });
