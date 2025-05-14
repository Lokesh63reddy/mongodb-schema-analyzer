# contacts Collection Analysis

Documents: 151

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 0 |
| _id | string | "61813ebbe195d0c9f0926181" |
| archived | boolean | false |
| email | string | "john.demo.ver.042@demo.org" |
| name | object | object |
| phone | array | array |
| user | string | "61a56445a5a63eb2cca7b61e" |
| name.first | string | "John" |
| name.last | string | "Demover" |
| name.middle | string | "" |

## Sample Document

```json
{
  "_id": "61813ebbe195d0c9f0926181",
  "archived": false,
  "name": {
    "first": "John",
    "middle": "",
    "last": "Demover"
  },
  "email": "john.demo.ver.042@demo.org",
  "phone": [],
  "__v": 0,
  "user": "61a56445a5a63eb2cca7b61e"
}
```

## Potential Relationships

No obvious foreign key fields detected.
