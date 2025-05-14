# customers Collection Analysis

Documents: 73

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 0 |
| _id | string | "60d9d86d64e566bec1809b99" |
| address | string | "N Demo Dr." |
| archived | boolean | false |
| city | string | "Corpus Christi" |
| contacts | array(object) | array(object) |
| locations | array(object) | array(object) |
| metadata | object | object |
| name | string | "Demo Org." |
| state | string | "Texas" |
| zip | string | "78417" |
| contacts[0]._id | string | "61813ebbe195d0c9f0926183" |
| contacts[0].primary | boolean | true |
| contacts[0].ref | string | "61813ebbe195d0c9f0926181" |
| metadata.btusPerCuFtGas | number | 1051 |
| metadata.daysPerYear | number | 365 |
| metadata.hoursPerDay | number | 24 |
| metadata.kWH | number | 0.06 |
| metadata.thousandCubicFeet | number | 5 |
| metadata.thousandGallonsWater | number | 9.3 |

## Sample Document

```json
{
  "_id": "60d9d86d64e566bec1809b99",
  "name": "Demo Org.",
  "address": "N Demo Dr.",
  "city": "Corpus Christi",
  "state": "Texas",
  "zip": "78417",
  "contacts": [
    {
      "ref": "61813ebbe195d0c9f0926181",
      "primary": true,
      "_id": "61813ebbe195d0c9f0926183"
    }
  ],
  "locations": [
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
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ],
  "archived": false,
  "metadata": {
    "kWH": 0.06,
    "hoursPerDay": 24,
    "daysPerYear": 365,
    "thousandCubicFeet": 5,
    "thousandGallonsWater": 9.3,
    "btusPerCuFtGas": 1051
  },
  "__v": 0
}
```

## Potential Relationships

No obvious foreign key fields detected.
