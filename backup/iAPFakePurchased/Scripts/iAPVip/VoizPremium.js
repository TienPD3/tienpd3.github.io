var obj = JSON.parse($response.body);

obj.data.promotion = "vip";
obj.data.plan_subscriptions = [
      {
        "remaining_day" : 2,
        "promotion" : "vip",
        "end_at" : "23:48 24-01-2023",
        "name" : "Gói VIP \u001dquà tặng",
        "start_at" : "23:48 21-01-2023"
      }
    ];

$done({ body: JSON.stringify(obj) });
