# users Collection Analysis

Documents: 64

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 2 |
| _id | string | "60c791d3e103fdf10eac60f0" |
| access | array | array |
| archived | boolean | false |
| email | string | "zane@whitebayassets.com" |
| group | string | "618c43968be7cb5d4e3c1295" |
| lastLogin | object | object |
| logAccess | array | array |
| name | string | "MechDX Administrator" |
| password | string | "5b198b657b4f692872bec99869a270..." |
| preferences | object | object |
| privacy | string | "2022-07-15T15:40:27.801Z" |
| recovery | null | null |
| termsAndConditions | string | "2023-06-06T19:29:58.187Z" |
| timezone | string | "America/Chicago" |
| preferences.notifications | object | object |
| preferences.suball | array | array |
| preferences.subscriptions | array(object) | array(object) |
| preferences.notifications.activeDays | object | object |
| preferences.notifications.email | boolean | true |
| preferences.notifications.log | array(string) | array(string) |
| preferences.notifications.phone | boolean | true |
| preferences.notifications.registeredEmails | array(object) | array(object) |
| preferences.notifications.registeredPhones | array(object) | array(object) |
| preferences.subscriptions[0].id | string | "6225158a156fbbc4dd6e3b53" |
| preferences.subscriptions[0].type | string | "customer" |
| preferences.notifications.activeDays.friday | boolean | true |
| preferences.notifications.activeDays.monday | boolean | true |
| preferences.notifications.activeDays.saturday | boolean | false |
| preferences.notifications.activeDays.sunday | boolean | false |
| preferences.notifications.activeDays.thursday | boolean | true |
| preferences.notifications.activeDays.tuesday | boolean | true |
| preferences.notifications.activeDays.wednesday | boolean | true |
| preferences.notifications.registeredEmails[0].value | string | "zane@whitebayassets.com" |
| preferences.notifications.registeredEmails[0].verified | boolean | true |
| preferences.notifications.registeredPhones[0].ref | string | "62ed2a4c7ee876db0a701f80" |
| preferences.notifications.registeredPhones[0].verified | boolean | true |

## Sample Document

```json
{
  "_id": "60c791d3e103fdf10eac60f0",
  "name": "MechDX Administrator",
  "email": "zane@whitebayassets.com",
  "password": "5b198b657b4f692872bec99869a270f87179c27dd82f64e3341343479538473adb112e599280e25f8292894f7d76dde66490b918e93a9b1db327e6aeeb54b7b317e257ab6133e433fae054be527662bf68ba951f0c52f467231e4497a3831ce9f125ed4bdf4607cb52cfc4fd16cf8e292862665dcef6fd5111adb250eca326a28a8e0a78f7a69a497401a936c43b03997a5fde56e59a9e8231d55efb105bc4257b77f9f69242e52df5b88fda259b50396218b4686db5a6ccc522e4c31d0e10a5d28dc0a7511f9c9a389b7769835e3fdce5c4a5c8e5478a22c006e7832943883fbfef3fee77010154fbc948792945042d360ddd8c4502d02fd78556c518e2a92b:88d656ba2f15694062989c156b1364fd511d8cdd39a854558cfb449dd29c2952a19cca9e300814880b9f732bb442a7f70a34dc91a574cbb2fae84d72841a9dc04752e7aca7e39e9665eed16c2f4caa3836b938ced1836f1f845fcb9d50ff90edaec8a4b2f2327a5c272298182245266eed3795946e856cda0cbd6e79a59281a47b5b4a1c2e38f81f9b152124dc499a4c62b5ec53e296949d93f30b81a1500ed939c188fb3995134ea307a4f3d1d1e8631260f8a07d50cc0b5012d45e3896afbdb5d5e2b5b58db396c49c01a55aa28405e6ddb486abc5d599cd6aac5fecd52d2411ef014cddea56a3115213cf3e30a237f15c76761cbdd43067d7e49be6c49002",
  "access": [],
  "privacy": "2022-07-15T15:40:27.801Z",
  "termsAndConditions": "2023-06-06T19:29:58.187Z",
  "logAccess": [],
  "lastLogin": {},
  "archived": false,
  "__v": 2,
  "recovery": null,
  "preferences": {
    "notifications": {
      "email": true,
      "registeredEmails": [
        {
          "value": "zane@whitebayassets.com",
          "verified": true
        },
        {
          "value": "koletiamar@gmail.com",
          "verified": false
        }
      ],
      "phone": true,
      "registeredPhones": [
        {
          "ref": "62ed2a4c7ee876db0a701f80",
          "verified": true
        }
      ],
      "log": [
        "verify",
        "complete",
        "create"
      ],
      "activeDays": {
        "sunday": false,
        "monday": true,
        "tuesday": true,
        "wednesday": true,
        "thursday": true,
        "friday": true,
        "saturday": false
      }
    },
    "suball": [],
    "subscriptions": [
      {
        "type": "customer",
        "id": "6225158a156fbbc4dd6e3b53"
      }
    ]
  },
  "group": "618c43968be7cb5d4e3c1295",
  "timezone": "America/Chicago"
}
```

## Potential Relationships

No obvious foreign key fields detected.
