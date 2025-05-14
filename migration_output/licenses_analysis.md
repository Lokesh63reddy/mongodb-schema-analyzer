# licenses Collection Analysis

Documents: 20

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 221 |
| _id | string | "61813e9cb01a79c4754ba466" |
| contacts | array(object) | array(object) |
| customers | array(object) | array(object) |
| groups | array(object) | array(object) |
| metadata | object | object |
| plan | object | object |
| users | array(object) | array(object) |
| customers[0]._id | string | "61815525eb70d47a4f8697b7" |
| customers[0].including | object | object |
| customers[0].ref | string | "60d9d86d64e566bec1809b99" |
| customers[0].showHistory | boolean | true |
| metadata.additionalInfo | array(object) | array(object) |
| metadata.city | string | "Corpus Christi" |
| metadata.contactEmail | string | "Sales@protechmech.com" |
| metadata.faxNumber | string | "+18883366329" |
| metadata.history | array | array |
| metadata.licence | boolean | true |
| metadata.licensed | boolean | true |
| metadata.notificationEndpoints | array(object) | array(object) |
| metadata.organization | string | "Demo Vendor, LLC" |
| metadata.ownership | string | "61813e9cb01a79c4754ba466" |
| metadata.primaryPhone | string | "+18003366564" |
| metadata.state | string | "Texas" |
| metadata.streetAddress | string | "3366 Demo Drive" |
| metadata.suiteOther | string | "" |
| metadata.website | string | "protechmech.com" |
| metadata.zip | string | "78410" |
| plan.options | array | array |
| plan.primary | string | "61813e96096fdac3b57216dc" |
| customers[0].including.equipment | array | array |
| customers[0].including.locations | array | array |
| metadata.additionalInfo[0].qIIxEZCBY | array(string) | array(string) |
| metadata.notificationEndpoints[0].endpoints | array(object) | array(object) |
| metadata.notificationEndpoints[0].type | string | "LogEntryAlert" |
| metadata.notificationEndpoints[0].endpoints[0].value | string | "60c7d08f0159f55fde577e0a" |
| metadata.notificationEndpoints[0].endpoints[0].variant | string | "group" |

## Sample Document

```json
{
  "_id": "61813e9cb01a79c4754ba466",
  "plan": {
    "primary": "61813e96096fdac3b57216dc",
    "options": []
  },
  "customers": [
    {
      "ref": "60d9d86d64e566bec1809b99",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697b7"
    },
    {
      "ref": "60edb6409276235b58299d60",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697b8"
    },
    {
      "ref": "60f6e2a4c85ec0bb2aa580c1",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697b9"
    },
    {
      "ref": "60fecb1ab8d5eb4230798556",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697bb"
    },
    {
      "ref": "61088754d2fd88193002da63",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697bd"
    },
    {
      "ref": "610a8b85261fb59901e01102",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697be"
    },
    {
      "ref": "610aa00f261fb59901e015ba",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697bf"
    },
    {
      "ref": "61116ef00c35e4fdb0ff2aad",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c0"
    },
    {
      "ref": "6113dbe70c35e4fdb0ff4134",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c1"
    },
    {
      "ref": "611685b50c35e4fdb0ff5dbb",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c2"
    },
    {
      "ref": "611bda3a0c35e4fdb0ff77bc",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c3"
    },
    {
      "ref": "611fd4e49f5c06670d0e9146",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c4"
    },
    {
      "ref": "611fe4209f5c06670d0e93a2",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c5"
    },
    {
      "ref": "6127aab29f5c06670d0ebeca",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c6"
    },
    {
      "ref": "612eb1d59f5c06670d0eeb2d",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c7"
    },
    {
      "ref": "6130c9c69f5c06670d0f01c5",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c8"
    },
    {
      "ref": "61311f659f5c06670d0f087f",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697c9"
    },
    {
      "ref": "6148f9aa18c47d951f237344",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697ca"
    },
    {
      "ref": "614b8b6318c47d951f237624",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697cb"
    },
    {
      "ref": "6155f3ec18c47d951f238029",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61815525eb70d47a4f8697cc"
    },
    {
      "ref": "618ad7828e80550eac3cd926",
      "including": {
        "locations": [],
        "equipment": []
      },
      "_id": "618ad7828e80550eac3cd929"
    },
    {
      "ref": "6102de09d2fd88193002c5cc",
      "including": {
        "locations": [
          {}
        ],
        "equipment": [
          {},
          {},
          {},
          {}
        ]
      },
      "showHistory": true,
      "_id": "618c2c21a804c7ede7a2e6ee"
    },
    {
      "ref": "61aeb25743c750f5756065fc",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61af712d2d5773e295b126ef"
    },
    {
      "ref": "61aa330543c750f5755e426c",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61af71ce2d5773e295b1477a"
    },
    {
      "ref": "61a4ef95263ebe2d5f03c884",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61af71d42d5773e295b1493b"
    },
    {
      "ref": "61aa446843c750f5755e6053",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61af71d72d5773e295b14a63"
    },
    {
      "ref": "61b7686cdee27175657154de",
      "including": {
        "locations": [],
        "equipment": []
      },
      "_id": "61b7686cdee27175657154e1"
    },
    {
      "ref": "61ba29a4dee2717565a5d17d",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61bb4ddddee2717565a991ed"
    },
    {
      "ref": "6183eb53b19d81e753b33f1c",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61bb4e10dee2717565a9b75d"
    },
    {
      "ref": "61bb6c3f4e12cbdd9a631422",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61bb6c3f4e12cbdd9a631425"
    },
    {
      "ref": "61c23e1a4e12cbdd9a741586",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61c23e1a4e12cbdd9a741589"
    },
    {
      "ref": "61d4511f478f4c5584765dfa",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "61d4511f478f4c5584765dfd"
    },
    {
      "ref": "6201a31808c41ea7b65f7bf6",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6201a31808c41ea7b65f7c1a"
    },
    {
      "ref": "6215183e7fa6bbffda326b51",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "621565fb7fa6bbffda389e94"
    },
    {
      "ref": "62164f4d7fa6bbffda3b6df9",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "62164f4d7fa6bbffda3b6e1f"
    },
    {
      "ref": "62193836b68157058150f8fd",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "62193836b68157058150f924"
    },
    {
      "ref": "6225158a156fbbc4dd6e3b53",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6225158a156fbbc4dd6e3b7b"
    },
    {
      "ref": "623a262c4fb07384068f1a5f",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "623a262c4fb07384068f1a88"
    },
    {
      "ref": "623b9331185b6f72c08be7a1",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "623b9331185b6f72c08be7cb"
    },
    {
      "ref": "624b5c94c7ab9a0702bd9516",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "624b5c94c7ab9a0702bd9541"
    },
    {
      "ref": "624f38f5bf8b6e8c57df1d6a",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "624f38f5bf8b6e8c57df1d95"
    },
    {
      "ref": "6262bc99724df34dc71f0c44",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6262bc99724df34dc71f0c9a"
    },
    {
      "ref": "627035898ede63b63c4b3eb5",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "627035898ede63b63c4b3f0d"
    },
    {
      "ref": "627ac94c17145bfd6a82c7ee",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "627ac94c17145bfd6a82c848"
    },
    {
      "ref": "6282b41517145bfd6a970d04",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6282b41517145bfd6a970d60"
    },
    {
      "ref": "628fdaea6af0adfc626444c8",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "628fdaea6af0adfc62644526"
    },
    {
      "ref": "62a8a7f1860caca7e201f234",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "62a8a7f1860caca7e201f294"
    },
    {
      "ref": "62c86f4903095496a493de66",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "62c86f4903095496a493dec8"
    },
    {
      "ref": "630a79e6da597ad1490b704f",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "630a79e6da597ad1490b70b3"
    },
    {
      "ref": "630a91cfda597ad1492868c8",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "630a91cfda597ad14928692e"
    },
    {
      "ref": "630e7673a48b685e7f4f29ce",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "630e7673a48b685e7f4f2a36"
    },
    {
      "ref": "6310d5f4a48b685e7f8a421b",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6310d5f4a48b685e7f8a4285"
    },
    {
      "ref": "631a3dfa498e880b8e0629e2",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "631a3dfa498e880b8e062a4e"
    },
    {
      "ref": "632327b046e56ef2ca5160e2",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "632327b046e56ef2ca516150"
    },
    {
      "ref": "632deea854d6f15487bbae37",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "632deea854d6f15487bbaea7"
    },
    {
      "ref": "633dc58eaf2ea98bd3e5dd17",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "633dc58eaf2ea98bd3e5dd89"
    },
    {
      "ref": "634da1dc9783712b4e947294",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "634da1dc9783712b4e947308"
    },
    {
      "ref": "638e2aad850ace963cbf772c",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "638e2aad850ace963cbf77a2"
    },
    {
      "ref": "6390c6661b3c49fadd66903d",
      "including": {
        "locations": [],
        "equipment": []
      },
      "showHistory": true,
      "_id": "6390c6661b3c49fadd6690b5"
    }
  ],
  "users": [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ],
  "__v": 221,
  "contacts": [
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ],
  "metadata": {
    "organization": "Demo Vendor, LLC",
    "streetAddress": "3366 Demo Drive",
    "suiteOther": "",
    "city": "Corpus Christi",
    "state": "Texas",
    "zip": "78410",
    "contactEmail": "Sales@protechmech.com",
    "website": "protechmech.com",
    "primaryPhone": "+18003366564",
    "faxNumber": "+18883366329",
    "additionalInfo": [
      {
        "qIIxEZCBY": [
          "TACLA",
          "DEMO"
        ]
      },
      {
        "tYKcZ3Zwo": [
          "RNP",
          "DEMO"
        ]
      }
    ],
    "notificationEndpoints": [
      {
        "type": "LogEntryAlert",
        "endpoints": [
          {
            "value": "60c7d08f0159f55fde577e0a",
            "variant": "group"
          },
          {
            "variant": "group",
            "value": "61016cc8ca71ec368b04f52e"
          },
          {
            "value": "60c791f3e103fdf10eac60f7",
            "variant": "user"
          },
          {
            "value": "610af624261fb59901e0216b",
            "variant": "group"
          },
          {
            "value": "631a0b05498e880b8eff5fe9",
            "variant": "group"
          }
        ]
      },
      {
        "type": "LogVerifyAlert",
        "endpoints": []
      },
      {
        "type": "LogReviewAlert",
        "endpoints": []
      }
    ],
    "licensed": true,
    "ownership": "61813e9cb01a79c4754ba466",
    "history": [],
    "licence": true
  },
  "groups": [
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ]
}
```

## Potential Relationships

No obvious foreign key fields detected.
