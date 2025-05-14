# globals Collection Analysis

Documents: 1

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 0 |
| _id | string | "621e2c62a5638e5796a0f845" |
| createdAt | object | object |
| description | string | "Depicts the estimated unnecess..." |
| name | string | "Inefficiency Cost" |
| references | array(object) | array(object) |
| updatedAt | object | object |
| references[0]._id | string | "621e2c7aa5638e5796a10229" |
| references[0].id | string | "GUJ02zMue" |
| references[0].ref | string | "60cca3564859b0163983c0b8" |

## Sample Document

```json
{
  "_id": "621e2c62a5638e5796a0f845",
  "name": "Inefficiency Cost",
  "description": "Depicts the estimated unnecessary energy cost of an equipment based on the efficiency of the equipment and cost variables set by the customer.",
  "references": [
    {
      "ref": "60cca3564859b0163983c0b8",
      "id": "GUJ02zMue",
      "_id": "621e2c7aa5638e5796a10229"
    },
    {
      "ref": "60d4d78e1dc0dbe6d244407b",
      "id": "mqhJasoqB",
      "_id": "621e2c7ca5638e5796a10271"
    },
    {
      "ref": "61e97b7034ff685f945d833d",
      "id": "lAi5ncgaM",
      "_id": "621e2c7ea5638e5796a102ba"
    },
    {
      "ref": "6227626771ffc85627c5cc76",
      "id": "08Qgh1HZJ",
      "_id": "62670ee508bb7752b9a093d0"
    }
  ],
  "createdAt": {},
  "updatedAt": {},
  "__v": 0
}
```

## Potential Relationships

No obvious foreign key fields detected.
