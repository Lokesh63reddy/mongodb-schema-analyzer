# groups Collection Analysis

Documents: 36

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 14 |
| _id | string | "60c791d3e103fdf10eac60ef" |
| archived | boolean | false |
| name | string | "Administrator" |
| order | number | 0 |
| permissions | array(object) | array(object) |
| permissions[0]._id | string | "61815263f16cf9a905d39d24" |
| permissions[0].ref | string | "61813e96096fdac3b57216d6" |
| permissions[0].scope | string | "license" |
| permissions[0].value | string | "write" |

## Sample Document

```json
{
  "_id": "60c791d3e103fdf10eac60ef",
  "archived": false,
  "name": "Administrator",
  "permissions": [
    {
      "ref": "61813e96096fdac3b57216d6",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d24"
    },
    {
      "ref": "61813e96096fdac3b57216d4",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d25"
    },
    {
      "ref": "61813e96096fdac3b57216d2",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d26"
    },
    {
      "ref": "61813e96096fdac3b57216d0",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d27"
    },
    {
      "ref": "61813e96096fdac3b57216ce",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d28"
    },
    {
      "ref": "61813e96096fdac3b57216ca",
      "value": "write",
      "scope": "license",
      "_id": "61815263f16cf9a905d39d29"
    },
    {
      "ref": "61813e96096fdac3b57216cc",
      "value": true,
      "scope": "license",
      "_id": "61815263f16cf9a905d39d2a"
    },
    {
      "ref": "61840594cc94444958dcf39d",
      "value": true,
      "scope": "license",
      "_id": "618c2beba804c7ede7a2db3b"
    },
    {
      "ref": "61813e96096fdac3b57216da",
      "value": true,
      "scope": "license",
      "_id": "618c2beba804c7ede7a2db3c"
    },
    {
      "ref": "61813e96096fdac3b57216d8",
      "value": true,
      "scope": "license",
      "_id": "6465461883df3666aef024f9"
    }
  ],
  "__v": 14,
  "order": 0
}
```

## Potential Relationships

No obvious foreign key fields detected.
