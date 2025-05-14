# logs Collection Analysis

Documents: 513

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 41 |
| _id | string | "60d9dfca64e566bec180bd3c" |
| action | string | "Need to verify how BAS is cont..." |
| archived | boolean | false |
| calculations | array(object) | array(object) |
| checklist | array(object) | array(object) |
| completion | number | 1 |
| conclusion | string | "Found condenser water flow is ..." |
| costAnalyses | array(object) | array(object) |
| createdAt | object | object |
| customer | string | "60d9d86d64e566bec1809b99" |
| equipment | string | "60d9de0664e566bec180ba98" |
| location | string | "60d9d89364e566bec1809ba4" |
| locked | boolean | true |
| lockTs | object | object |
| log | array(object) | array(object) |
| technician | object | object |
| updatedAt | object | object |
| verified | object | object |
| workOrder | number | 33591 |
| calculations[0].71tSUDH1q | number | 224 |
| checklist[0].NP2UvxQQF | number | 1 |
| costAnalyses[0].19JZo-7mi | number | -16.65926514770382 |
| log[0].eer8pu0qF7 | string | "6.35" |
| technician._id | string | "60c7cff00159f55fde577deb" |
| technician.email | string | "cblair@protechmech.com" |
| technician.name | string | "Cliff Blair" |
| technician.role | string | "60c79b3c5adbdc234ce7cf2a" |
| technician.username | string | "cblair" |
| verified.comment | string | "Found condenser water flow is ..." |
| verified.condition | string | "success" |
| verified.date | string | "2021-08-30T14:19:01.185Z" |
| verified.user | string | "60c791f3e103fdf10eac60f7" |

## Sample Document

```json
{
  "_id": "60d9dfca64e566bec180bd3c",
  "archived": false,
  "customer": "60d9d86d64e566bec1809b99",
  "location": "60d9d89364e566bec1809ba4",
  "equipment": "60d9de0664e566bec180ba98",
  "createdAt": {},
  "updatedAt": {},
  "__v": 41,
  "calculations": [
    {
      "71tSUDH1q": 224
    },
    {
      "jpLpNolUE": 0.5503685503685504
    },
    {
      "QF_mLLhFu": 467
    },
    {},
    {
      "kahXEoWSG": 162711.781344
    },
    {
      "5EQqSAOAW": 7.099999999999994
    },
    {
      "AVIr4o83H": 17.5
    },
    {
      "T4oTHXzyS": 1.8999999999999915
    },
    {
      "mdiSp3Xvi": -8.86
    },
    {
      "Kzs4dKhiQ": 7.400000000000006
    },
    {
      "faPPeLk7A": 0.880952380952381
    },
    {
      "Sq0tERdH9": -7
    },
    {
      "f2TLw5lia": 1183.1526948797427
    },
    {
      "NB6y9WiI7": 369.4232043084432
    },
    {
      "cqEqc7CwV": -6.309999999999999
    },
    {
      "Px0ngwZW4": 0.6503929653317662
    },
    {
      "Rp8ogYg8w": 6.5
    },
    {
      "FoH-8Zis6": 2.299999999999997
    },
    {
      "kfPJrSNc8": 2.799999999999997
    },
    {
      "dbtGINq1B": 7.800000000000004
    },
    {
      "52P4tWT63": -5.399999999999999
    },
    {
      "qEz2DzlXU": 769.5074615189468
    },
    {
      "m7TC8xMwJ": 250.08992499365786
    },
    {
      "DYDW7-5R5": 0.6506130998604853
    },
    {
      "w3_OlRItC": 0.897614880679824
    },
    {
      "9ggJy-UTf": 0.4771614822860679
    },
    {
      "SLAXfO2aB": 0.34999999999999964
    },
    {
      "s1tA2CxCT": 0.5001798499873157
    }
  ],
  "checklist": [
    {
      "NP2UvxQQF": 1
    },
    {
      "tQciUhndK": 3
    },
    {
      "_i3_8pO7Z": 3
    },
    {
      "MPWQSju0p": 1
    },
    {
      "8PZsNGD8E": 1
    },
    {
      "uW3SYyXh0": 1
    },
    {
      "JFUoNQTgj": 1
    },
    {
      "ynbeXa3hn": 1
    },
    {
      "f6xrZj6hB": 1
    },
    {
      "2rq_39_OQ": 1
    },
    {
      "QawjZiBAR": 1
    },
    {
      "D2TqqTioI": 1
    },
    {
      "t6xexGsQn": 1
    },
    {
      "h0cCSCD_M": 1
    },
    {
      "siKk0N3oA": 1
    },
    {
      "JCZuzgVCj": 1
    },
    {
      "X3z4ENQi1": 1
    },
    {
      "YCQS_ME81": 1
    }
  ],
  "completion": 1,
  "log": [
    {
      "eer8pu0qF7": "6.35"
    },
    {
      "mklmz4ew6": "52.6"
    },
    {
      "pqqoDeKKJw": "44.8"
    },
    {
      "xlMukr_tP": "49"
    },
    {
      "JxjJBrK6-": "42.5"
    },
    {
      "xRJbcp8J3": "49"
    },
    {
      "Cm0vEIVJB": "10.39"
    },
    {
      "WsiG2DUnM": "79"
    },
    {
      "LF29uYshS": "86.4"
    },
    {
      "kX7fgTayi": "99.8"
    },
    {
      "8rKJ0dLtd": "105.8"
    },
    {
      "RISnpOR21": "88.3"
    },
    {
      "IRhKhSHjZ": "81.2"
    },
    {
      "xFckNZx_u": {
        "L1": "467",
        "L2": "467",
        "L3": "467"
      }
    },
    {
      "gtccLV_6J": {
        "L1": "224",
        "L2": "224",
        "L3": "224"
      }
    },
    {
      "1xQzxpQFy": "19604"
    },
    {
      "TEYRwgoFU": "0"
    },
    {
      "8ujm0BmJ_": "35"
    },
    {
      "cVfNi1qA_": "117.2"
    },
    {
      "8M8Fvklu8": "117.2"
    },
    {
      "XGU-J19KH": "110"
    },
    {
      "7zpuN98cD": "82"
    },
    {
      "vNnbf6N1G": "78"
    }
  ],
  "conclusion": "Found condenser water flow is lower than design. Condenser water pumps are on VFD. Need to verify control. ",
  "action": "Need to verify how BAS is controlling condenser pump VFD speed. ",
  "technician": {
    "_id": "60c7cff00159f55fde577deb",
    "name": "Cliff Blair",
    "username": "cblair",
    "email": "cblair@protechmech.com",
    "role": "60c79b3c5adbdc234ce7cf2a"
  },
  "verified": {
    "user": "60c791f3e103fdf10eac60f7",
    "condition": "success",
    "comment": "Found condenser water flow is lower than design. Condenser water pumps are on VFD. Need to verify control. Need to verify how BAS is controlling condenser pump VFD speed.  ",
    "date": "2021-08-30T14:19:01.185Z"
  },
  "workOrder": 33591,
  "locked": true,
  "lockTs": {},
  "costAnalyses": [
    {
      "19JZo-7mi": -16.65926514770382
    },
    {
      "tZLCTWYtE": -4238.117053575851
    },
    {
      "GUJ02zMue": -4238.117053575851
    },
    {
      "HOC-R7k_2": -0.897614880679824
    }
  ]
}
```

## Potential Relationships

No obvious foreign key fields detected.
