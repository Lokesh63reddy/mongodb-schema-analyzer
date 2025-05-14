# uploads Collection Analysis

Documents: 172

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 1 |
| _id | string | "6233427f4fb073840675914d" |
| activity | array(object) | array(object) |
| archived | boolean | false |
| createdAt | object | object |
| description | string | "Marley Cooling Tower" |
| filename | string | "Best Western Marina Grand NC84..." |
| filesize | number | 90274 |
| filetype | string | "application/pdf" |
| key | string | "e5fef9e4-03b3-4ae3-8c51-cf092d..." |
| name | string | "Best Western Marina Grand NC84..." |
| resource | string | "equipment" |
| resourceId | string | "622b797d0785bc7a803f2c6b" |
| updatedAt | object | object |
| activity[0]._id | string | "6233427f4fb073840675914e" |
| activity[0].action | string | "create" |
| activity[0].by | string | "618c4501a804c7ede7a4712a" |
| activity[0].ts | object | object |

## Sample Document

```json
{
  "_id": "6233427f4fb073840675914d",
  "filename": "Best Western Marina Grand NC8403 Tower.pdf",
  "filetype": "application/pdf",
  "filesize": 90274,
  "resource": "equipment",
  "resourceId": "622b797d0785bc7a803f2c6b",
  "key": "e5fef9e4-03b3-4ae3-8c51-cf092d25a1e9.Best Western Marina Grand NC8403 Tower.pdf",
  "name": "Best Western Marina Grand NC8403 Tower.pdf",
  "activity": [
    {
      "by": "618c4501a804c7ede7a4712a",
      "action": "create",
      "ts": {},
      "_id": "6233427f4fb073840675914e"
    },
    {
      "by": "618c4501a804c7ede7a4712a",
      "action": "modifyDescription",
      "to": "Marley Cooling Tower",
      "ts": {},
      "_id": "623342b64fb073840675a623"
    }
  ],
  "archived": false,
  "createdAt": {},
  "updatedAt": {},
  "__v": 1,
  "description": "Marley Cooling Tower"
}
```

## Potential Relationships

Fields that might be foreign keys:

- resourceId
