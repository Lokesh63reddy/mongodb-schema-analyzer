# locations Collection Analysis

Documents: 183

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 1 |
| _id | string | "60d9d89364e566bec1809ba4" |
| address | string | "213 Revolution Blvd" |
| archived | boolean | false |
| city | string | "Corpus Christi" |
| contacts | array(object) | array(object) |
| equipment | array(object) | array(object) |
| name | string | "Cadets High School" |
| overrides | object | object |
| state | string | "Texas" |
| zip | string | "78410" |
| contacts[0]._id | string | "61d75694478f4c5584867074" |
| contacts[0].primary | boolean | true |
| contacts[0].ref | string | "61813ebbe195d0c9f0926181" |

## Sample Document

```json
{
  "_id": "60d9d89364e566bec1809ba4",
  "name": "Cadets High School",
  "address": "213 Revolution Blvd",
  "city": "Corpus Christi",
  "state": "Texas",
  "zip": "78410",
  "contacts": [
    {
      "ref": "61813ebbe195d0c9f0926181",
      "primary": true,
      "_id": "61d75694478f4c5584867074"
    }
  ],
  "equipment": [
    {},
    {},
    {},
    {}
  ],
  "archived": false,
  "__v": 1,
  "overrides": {}
}
```

## Potential Relationships

No obvious foreign key fields detected.
