# templates Collection Analysis

Documents: 8

## Field Analysis

| Field | Type | Example |
|-------|------|--------|
| __v | number | 146 |
| _id | string | "60cca3564859b0163983c0b8" |
| archived | boolean | false |
| costAnalyses | array(object) | array(object) |
| createdAt | object | object |
| defaultVariant | string | "61fbfad491b3061d3f61c753" |
| efficiencyConfiguration | object | object |
| history | array | array |
| name | string | "Water-Cooled Chiller" |
| updatedAt | object | object |
| variants | array(object) | array(object) |
| costAnalyses[0]._id | string | "621e2a19a5638e5796a042a4" |
| costAnalyses[0].content | object | object |
| costAnalyses[0].formula | array(object) | array(object) |
| costAnalyses[0].id | string | "HOC-R7k_2" |
| efficiencyConfiguration.ranges | array(object) | array(object) |
| efficiencyConfiguration.ref | string | "w3_OlRItC" |
| variants[0]._id | string | "61fbfad491b3061d3f61c753" |
| variants[0].checklist | array(object) | array(object) |
| variants[0].default | boolean | true |
| variants[0].info | array(object) | array(object) |
| variants[0].name | string | "Full" |
| variants[0].sections | array(object) | array(object) |
| costAnalyses[0].content.decimals | number | 2 |
| costAnalyses[0].content.metric | boolean | true |
| costAnalyses[0].content.name | string | "Percent Inefficiency" |
| costAnalyses[0].content.order | number | 0 |
| costAnalyses[0].content.type | string | "Percentage" |
| costAnalyses[0].content.unit | string | "No Unit" |
| costAnalyses[0].formula[0]._id | string | "621e2a43a5638e5796a04ea4" |
| costAnalyses[0].formula[0].type | string | "Number" |
| costAnalyses[0].formula[0].variable | string | "0" |
| efficiencyConfiguration.ranges[0]._id | string | "621d54b5a5638e57969e4af3" |
| efficiencyConfiguration.ranges[0].color | string | "#8a0707" |
| efficiencyConfiguration.ranges[0].condition | array(string) | array(string) |
| variants[0].checklist[0]._id | string | "61fbfad491b3061d3f61c759" |
| variants[0].checklist[0].content | object | object |
| variants[0].checklist[0].id | string | "YCQS_ME81" |
| variants[0].info[0]._id | string | "61fbfad491b3061d3f61c754" |
| variants[0].info[0].content | object | object |
| variants[0].info[0].id | string | "m5DsIreLC" |
| variants[0].sections[0]._id | string | "61fbfad491b3061d3f61c76b" |
| variants[0].sections[0].items | array(object) | array(object) |
| variants[0].sections[0].name | string | "Evaporator" |
| variants[0].checklist[0].content.isRequired | boolean | true |
| variants[0].checklist[0].content.name | string | "Check Guages and Indicator Lig..." |
| variants[0].info[0].content.isRequired | boolean | true |
| variants[0].info[0].content.modelNumber | boolean | false |
| variants[0].info[0].content.name | string | "Refrigerant Type" |
| variants[0].info[0].content.type | string | "Text" |
| variants[0].sections[0].items[0]._id | string | "61fbfad491b3061d3f61c76c" |
| variants[0].sections[0].items[0].calculations | array(object) | array(object) |
| variants[0].sections[0].items[0].design | object | object |
| variants[0].sections[0].items[0].log | object | object |
| variants[0].sections[0].items[0].calculations[0]._id | string | "61fbfad491b3061d3f61c76d" |
| variants[0].sections[0].items[0].calculations[0].content | object | object |
| variants[0].sections[0].items[0].calculations[0].formula | array(object) | array(object) |
| variants[0].sections[0].items[0].calculations[0].id | string | "m7TC8xMwJ" |
| variants[0].sections[0].items[0].design.content | object | object |
| variants[0].sections[0].items[0].design.id | string | "J8v3VTHz7" |
| variants[0].sections[0].items[0].log.analytics | array | array |
| variants[0].sections[0].items[0].log.content | object | object |
| variants[0].sections[0].items[0].calculations[0].content.decimals | number | 1 |
| variants[0].sections[0].items[0].calculations[0].content.indexed | boolean | false |
| variants[0].sections[0].items[0].calculations[0].content.metric | boolean | false |
| variants[0].sections[0].items[0].calculations[0].content.name | string | "Evaporator Tons" |
| variants[0].sections[0].items[0].calculations[0].content.order | number | 0 |
| variants[0].sections[0].items[0].calculations[0].content.type | string | "Number" |
| variants[0].sections[0].items[0].calculations[0].content.unit | string | "No Unit" |
| variants[0].sections[0].items[0].calculations[0].formula[0]._id | string | "61fbfad491b3061d3f61c76e" |
| variants[0].sections[0].items[0].calculations[0].formula[0].type | string | "Math" |
| variants[0].sections[0].items[0].calculations[0].formula[0].variable | string | "(" |
| variants[0].sections[0].items[0].design.content.decimals | number | 1 |
| variants[0].sections[0].items[0].design.content.indexed | boolean | false |
| variants[0].sections[0].items[0].design.content.isRequired | boolean | true |
| variants[0].sections[0].items[0].design.content.metric | boolean | false |
| variants[0].sections[0].items[0].design.content.name | string | "Tons " |
| variants[0].sections[0].items[0].design.content.type | string | "Number" |
| variants[0].sections[0].items[0].log.content.decimals | number | 3 |
| variants[0].sections[0].items[0].log.content.type | string | "Blank" |

## Sample Document

```json
{
  "_id": "60cca3564859b0163983c0b8",
  "history": [],
  "archived": false,
  "name": "Water-Cooled Chiller",
  "variants": [
    {
      "name": "Full",
      "default": true,
      "info": [
        {
          "id": "m5DsIreLC",
          "content": {
            "name": "Refrigerant Type",
            "type": "Text",
            "isRequired": true,
            "modelNumber": false
          },
          "_id": "61fbfad491b3061d3f61c754"
        },
        {
          "id": "d0vY3FdhG",
          "content": {
            "name": "Model No.",
            "type": "Text",
            "isRequired": true,
            "modelNumber": true
          },
          "_id": "61fbfad491b3061d3f61c755"
        },
        {
          "id": "qeVJfrEBz",
          "content": {
            "name": "Serial No.",
            "type": "Text",
            "isRequired": true,
            "modelNumber": false
          },
          "_id": "61fbfad491b3061d3f61c756"
        },
        {
          "id": "e3s8866Gq",
          "content": {
            "name": "Chiller No.",
            "type": "Number",
            "isRequired": true,
            "modelNumber": false
          },
          "_id": "61fbfad491b3061d3f61c757"
        },
        {
          "id": "Mf5x4RPiL",
          "content": {
            "name": "Nickname/Comment",
            "type": "Text",
            "isRequired": true,
            "modelNumber": false
          },
          "_id": "61fbfad491b3061d3f61c758"
        }
      ],
      "checklist": [
        {
          "id": "YCQS_ME81",
          "content": {
            "name": "Check Guages and Indicator Lights",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c759"
        },
        {
          "id": "X3z4ENQi1",
          "content": {
            "name": "Inspect Starter Caps, Fuses, Linkages and Contacts",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75a"
        },
        {
          "id": "JCZuzgVCj",
          "content": {
            "name": "Check Safety and Operating Controls",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75b"
        },
        {
          "id": "siKk0N3oA",
          "content": {
            "name": "Check and Tighten Electrical Connections",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75c"
        },
        {
          "id": "h0cCSCD_M",
          "content": {
            "name": "Calibrate Operating Controls",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75d"
        },
        {
          "id": "t6xexGsQn",
          "content": {
            "name": "Verify Flow Switch Operation",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75e"
        },
        {
          "id": "D2TqqTioI",
          "content": {
            "name": "Check and Log Alarms/Faults",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c75f"
        },
        {
          "id": "QawjZiBAR",
          "content": {
            "name": "Inspect Oil Pump and Motor Assembly",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c760"
        },
        {
          "id": "NP2UvxQQF",
          "content": {
            "name": "Brush Condenser Tubes",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c761"
        },
        {
          "id": "_i3_8pO7Z",
          "content": {
            "name": "Brush Evaporator Tubes",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c762"
        },
        {
          "id": "MPWQSju0p",
          "content": {
            "name": "Take Oil Sample for Analysis",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c763"
        },
        {
          "id": "8PZsNGD8E",
          "content": {
            "name": "Replace Oil Filter",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c764"
        },
        {
          "id": "tQciUhndK",
          "content": {
            "name": "Take Refrigerant Sample for Analysis",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c765"
        },
        {
          "id": "uW3SYyXh0",
          "content": {
            "name": "Replace Drier Cores",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c766"
        },
        {
          "id": "JFUoNQTgj",
          "content": {
            "name": "Check for Refrigerant Leaks with Leak Detector",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c767"
        },
        {
          "id": "ynbeXa3hn",
          "content": {
            "name": "Inspect Water Piping at Chiller for Leaks",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c768"
        },
        {
          "id": "f6xrZj6hB",
          "content": {
            "name": "Review and Evaluate Log Readings",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c769"
        },
        {
          "id": "2rq_39_OQ",
          "content": {
            "name": "Check if Isolation Valves are Operational",
            "isRequired": true
          },
          "_id": "61fbfad491b3061d3f61c76a"
        },
        {
          "id": "cR75mUO_c",
          "content": {
            "name": "New Checklist Test Item",
            "isRequired": true
          },
          "_id": "63bd8705878d2b0b749ab52e"
        }
      ],
      "sections": [
        {
          "name": "Evaporator",
          "items": [
            {
              "design": {
                "id": "J8v3VTHz7",
                "content": {
                  "name": "Tons ",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "m7TC8xMwJ",
                  "content": {
                    "name": "Evaporator Tons",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c76e"
                    },
                    {
                      "type": "Calculation",
                      "variable": "dbtGINq1B",
                      "_id": "61fbfad491b3061d3f61c76f"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c770"
                    },
                    {
                      "type": "Calculation",
                      "variable": "qEz2DzlXU",
                      "_id": "61fbfad491b3061d3f61c771"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c772"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c773"
                    },
                    {
                      "type": "Number",
                      "variable": "24",
                      "_id": "61fbfad491b3061d3f61c774"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c76d"
                },
                {
                  "id": "s1tA2CxCT",
                  "content": {
                    "name": "% of Evaporator Tonnage",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 1,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c776"
                    },
                    {
                      "type": "Calculation",
                      "variable": "m7TC8xMwJ",
                      "_id": "61fbfad491b3061d3f61c777"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c778"
                    },
                    {
                      "type": "Design",
                      "variable": "J8v3VTHz7",
                      "_id": "61fbfad491b3061d3f61c779"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c77a"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c775"
                }
              ],
              "_id": "61fbfad491b3061d3f61c76c"
            },
            {
              "design": {
                "id": "1_G5DsMoCs",
                "content": {
                  "name": "Pressure Drop (Ft/Hd)",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Feet of Head",
                  "decimals": 2,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "eer8pu0qF7",
                "content": {
                  "name": "Pressure Drop (Ft/Hd)",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Feet of Head",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "SLAXfO2aB",
                  "content": {
                    "name": "Water Flow (Ft. Hd. Difference)",
                    "unit": "Feet of Head",
                    "type": "Number",
                    "order": 0,
                    "decimals": 2,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c77d"
                    },
                    {
                      "type": "Design",
                      "variable": "1_G5DsMoCs",
                      "_id": "61fbfad491b3061d3f61c77e"
                    },
                    {
                      "type": "Math",
                      "variable": "+",
                      "_id": "61fbfad491b3061d3f61c77f"
                    },
                    {
                      "type": "Log",
                      "variable": "eer8pu0qF7",
                      "_id": "61fbfad491b3061d3f61c780"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c77c"
                }
              ],
              "_id": "61fbfad491b3061d3f61c77b"
            },
            {
              "design": {
                "id": "PcMpNUJSM",
                "content": {
                  "name": "Entering Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "mklmz4ew6",
                "content": {
                  "name": "Entering Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "52P4tWT63",
                  "content": {
                    "name": "Entering Temperature from Design",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "mklmz4ew6",
                      "_id": "61fbfad491b3061d3f61c783"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c784"
                    },
                    {
                      "type": "Design",
                      "variable": "PcMpNUJSM",
                      "_id": "61fbfad491b3061d3f61c785"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c782"
                }
              ],
              "_id": "61fbfad491b3061d3f61c781"
            },
            {
              "design": {
                "id": "v6_rTWMeY",
                "content": {
                  "name": "Leaving Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "pqqoDeKKJw",
                "content": {
                  "name": "Leaving Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "kfPJrSNc8",
                  "content": {
                    "name": "Leaving Temperature from Design",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "pqqoDeKKJw",
                      "_id": "61fbfad491b3061d3f61c788"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c789"
                    },
                    {
                      "type": "Design",
                      "variable": "v6_rTWMeY",
                      "_id": "61fbfad491b3061d3f61c78a"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c787"
                }
              ],
              "_id": "61fbfad491b3061d3f61c786"
            },
            {
              "design": {
                "id": "B4cqe_YOg",
                "content": {
                  "name": "Delta Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "dbtGINq1B",
                  "content": {
                    "name": "Evaporator Delta Temperature",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "mklmz4ew6",
                      "_id": "61fbfad491b3061d3f61c78d"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c78e"
                    },
                    {
                      "type": "Log",
                      "variable": "pqqoDeKKJw",
                      "_id": "61fbfad491b3061d3f61c78f"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c78c"
                }
              ],
              "_id": "61fbfad491b3061d3f61c78b"
            },
            {
              "design": {
                "id": "Sgnnf0lvf",
                "content": {
                  "name": "Suction Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "xlMukr_tP",
                "content": {
                  "name": "Suction Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "No Unit",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c790"
            },
            {
              "design": {
                "id": "9PqV4XP66",
                "content": {
                  "name": "Refrigerant Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "JxjJBrK6-",
                "content": {
                  "name": "Refrigerant Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c791"
            },
            {
              "design": {
                "id": "rxgfRYGzw2",
                "content": {
                  "name": "Suction Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "xRJbcp8J3",
                "content": {
                  "name": "Suction Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c792"
            },
            {
              "design": {
                "id": "5Y7LX4TAH",
                "content": {
                  "name": "Suction Superheat",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "Rp8ogYg8w",
                  "content": {
                    "name": "Compressor Superheat",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "xRJbcp8J3",
                      "_id": "61fbfad491b3061d3f61c795"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c796"
                    },
                    {
                      "type": "Log",
                      "variable": "JxjJBrK6-",
                      "_id": "61fbfad491b3061d3f61c797"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c794"
                }
              ],
              "_id": "61fbfad491b3061d3f61c793"
            },
            {
              "design": {
                "id": "F7m1B7C18",
                "content": {
                  "name": "Approach",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "FoH-8Zis6",
                  "content": {
                    "name": "Evap. Approach",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "pqqoDeKKJw",
                      "_id": "61fbfad491b3061d3f61c79a"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c79b"
                    },
                    {
                      "type": "Log",
                      "variable": "JxjJBrK6-",
                      "_id": "61fbfad491b3061d3f61c79c"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c799"
                }
              ],
              "_id": "61fbfad491b3061d3f61c798"
            },
            {
              "design": {
                "id": "xGjaiw3LK",
                "content": {
                  "name": "GPM",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "qEz2DzlXU",
                  "content": {
                    "name": "Evap. GPM",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "sqrt",
                      "_id": "61fbfad491b3061d3f61c79f"
                    },
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c7a0"
                    },
                    {
                      "type": "Log",
                      "variable": "eer8pu0qF7",
                      "_id": "61fbfad491b3061d3f61c7a1"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7a2"
                    },
                    {
                      "type": "Design",
                      "variable": "1_G5DsMoCs",
                      "_id": "61fbfad491b3061d3f61c7a3"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c7a4"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c7a5"
                    },
                    {
                      "type": "Design",
                      "variable": "xGjaiw3LK",
                      "_id": "61fbfad491b3061d3f61c7a6"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c79e"
                }
              ],
              "_id": "61fbfad491b3061d3f61c79d"
            }
          ],
          "_id": "61fbfad491b3061d3f61c76b"
        },
        {
          "name": "Condenser",
          "items": [
            {
              "design": {
                "id": "Gr8RL-v8M",
                "content": {
                  "name": "Tons",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "NB6y9WiI7",
                  "content": {
                    "name": "Cond. Tons",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c7aa"
                    },
                    {
                      "type": "Calculation",
                      "variable": "Kzs4dKhiQ",
                      "_id": "61fbfad491b3061d3f61c7ab"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c7ac"
                    },
                    {
                      "type": "Calculation",
                      "variable": "f2TLw5lia",
                      "_id": "61fbfad491b3061d3f61c7ad"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c7ae"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7af"
                    },
                    {
                      "type": "Number",
                      "variable": "23.7",
                      "_id": "61fbfad491b3061d3f61c7b0"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7a9"
                },
                {
                  "id": "Px0ngwZW4",
                  "content": {
                    "name": "% of Condenser Tonnage",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 1,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Calculation",
                      "variable": "NB6y9WiI7",
                      "_id": "61fbfad491b3061d3f61c7b2"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7b3"
                    },
                    {
                      "type": "Design",
                      "variable": "Gr8RL-v8M",
                      "_id": "61fbfad491b3061d3f61c7b4"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7b1"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7a8"
            },
            {
              "design": {
                "id": "8KiL0T6gk",
                "content": {
                  "name": "Pressure Drop (Ft/Hd)",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Feet of Head",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "Cm0vEIVJB",
                "content": {
                  "name": "Pressure Drop (Ft/Hd)",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Feet of Head",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "cqEqc7CwV",
                  "content": {
                    "name": "Water Flow (GPM)",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7b7"
                    },
                    {
                      "type": "Design",
                      "variable": "8KiL0T6gk",
                      "_id": "61fbfad491b3061d3f61c7b8"
                    },
                    {
                      "type": "Math",
                      "variable": "+",
                      "_id": "61fbfad491b3061d3f61c7b9"
                    },
                    {
                      "type": "Log",
                      "variable": "Cm0vEIVJB",
                      "_id": "61fbfad491b3061d3f61c7ba"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7b6"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7b5"
            },
            {
              "design": {
                "id": "KPYrHdkSm",
                "content": {
                  "name": "Entering Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "WsiG2DUnM",
                "content": {
                  "name": "Entering Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "Sq0tERdH9",
                  "content": {
                    "name": "Entering Temperature From Design",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "WsiG2DUnM",
                      "_id": "61fbfad491b3061d3f61c7bd"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7be"
                    },
                    {
                      "type": "Design",
                      "variable": "KPYrHdkSm",
                      "_id": "61fbfad491b3061d3f61c7bf"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7bc"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7bb"
            },
            {
              "design": {
                "id": "5BMu6larZ",
                "content": {
                  "name": "Leaving Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "LF29uYshS",
                "content": {
                  "name": "Leaving Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "mdiSp3Xvi",
                  "content": {
                    "name": "Leaving Temperature From Design",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "LF29uYshS",
                      "_id": "61fbfad491b3061d3f61c7c2"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7c3"
                    },
                    {
                      "type": "Design",
                      "variable": "5BMu6larZ",
                      "_id": "61fbfad491b3061d3f61c7c4"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7c1"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7c0"
            },
            {
              "design": {
                "id": "veTmHMhr8",
                "content": {
                  "name": "Delta Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "Kzs4dKhiQ",
                  "content": {
                    "name": "Condenser Delta Temperature",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "LF29uYshS",
                      "_id": "61fbfad491b3061d3f61c7c7"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7c8"
                    },
                    {
                      "type": "Log",
                      "variable": "WsiG2DUnM",
                      "_id": "61fbfad491b3061d3f61c7c9"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7c6"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7c5"
            },
            {
              "design": {
                "id": "ResO-G3db",
                "content": {
                  "name": "Condenser Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "kX7fgTayi",
                "content": {
                  "name": "Condenser Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c7ca"
            },
            {
              "design": {
                "id": "ynCgkcNF9",
                "content": {
                  "name": "Compressor Discharge Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "8rKJ0dLtd",
                "content": {
                  "name": "Compressor Discharge Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c7cb"
            },
            {
              "design": {
                "id": "_2kSRj4mo",
                "content": {
                  "name": "Compressor Discharge Superheat",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "AVIr4o83H",
                  "content": {
                    "name": "Compressor Discharge Superheat",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "8rKJ0dLtd",
                      "_id": "61fbfad491b3061d3f61c7ce"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7cf"
                    },
                    {
                      "type": "Log",
                      "variable": "RISnpOR21",
                      "_id": "61fbfad491b3061d3f61c7d0"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7cd"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7cc"
            },
            {
              "design": {
                "id": "vMHG3SEmr",
                "content": {
                  "name": "Refrigerant Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "RISnpOR21",
                "content": {
                  "name": "Refrigerant Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "9ggJy-UTf",
                  "content": {
                    "name": "Condenser Heat Rejection Factor",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c7d3"
                    },
                    {
                      "type": "Calculation",
                      "variable": "NB6y9WiI7",
                      "_id": "61fbfad491b3061d3f61c7d4"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7d5"
                    },
                    {
                      "type": "Calculation",
                      "variable": "m7TC8xMwJ",
                      "_id": "61fbfad491b3061d3f61c7d6"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c7d7"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7d8"
                    },
                    {
                      "type": "Number",
                      "variable": "1",
                      "_id": "61fbfad491b3061d3f61c7d9"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7d2"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7d1"
            },
            {
              "design": {
                "id": "lSGJF7tRi",
                "content": {
                  "name": "Approach",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "T4oTHXzyS",
                  "content": {
                    "name": "Cond. Approach",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "RISnpOR21",
                      "_id": "61fbfad491b3061d3f61c7dc"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7dd"
                    },
                    {
                      "type": "Log",
                      "variable": "LF29uYshS",
                      "_id": "61fbfad491b3061d3f61c7de"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7db"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7da"
            },
            {
              "design": {
                "id": "kzbktjvM0",
                "content": {
                  "name": "Liquid Line Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "IRhKhSHjZ",
                "content": {
                  "name": "Liquid Line Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c7df"
            },
            {
              "design": {
                "id": "q3MPtpxzD",
                "content": {
                  "name": "Subcooling Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "5EQqSAOAW",
                  "content": {
                    "name": "Subcooling Temperature",
                    "unit": "Temperature",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Log",
                      "variable": "RISnpOR21",
                      "_id": "61fbfad491b3061d3f61c7e2"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7e3"
                    },
                    {
                      "type": "Log",
                      "variable": "IRhKhSHjZ",
                      "_id": "61fbfad491b3061d3f61c7e4"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7e1"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7e0"
            },
            {
              "design": {
                "id": "IjPUpkk8b",
                "content": {
                  "name": "GPM",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "f2TLw5lia",
                  "content": {
                    "name": "Cond. GPM",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "sqrt",
                      "_id": "61fbfad491b3061d3f61c7e7"
                    },
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c7e8"
                    },
                    {
                      "type": "Log",
                      "variable": "Cm0vEIVJB",
                      "_id": "61fbfad491b3061d3f61c7e9"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7ea"
                    },
                    {
                      "type": "Design",
                      "variable": "8KiL0T6gk",
                      "_id": "61fbfad491b3061d3f61c7eb"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c7ec"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c7ed"
                    },
                    {
                      "type": "Design",
                      "variable": "IjPUpkk8b",
                      "_id": "61fbfad491b3061d3f61c7ee"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7e6"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7e5"
            },
            {
              "design": {
                "id": "oHtbhQB_q",
                "content": {
                  "name": "Cooling Tower Efficiency",
                  "type": "Percentage",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "faPPeLk7A",
                  "content": {
                    "name": "Cooling Tower Efficiency",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Calculation",
                      "variable": "Kzs4dKhiQ",
                      "_id": "61fbfad491b3061d3f61c7f1"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c7f2"
                    },
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c7f3"
                    },
                    {
                      "type": "Log",
                      "variable": "LF29uYshS",
                      "_id": "61fbfad491b3061d3f61c7f4"
                    },
                    {
                      "type": "Math",
                      "variable": "-",
                      "_id": "61fbfad491b3061d3f61c7f5"
                    },
                    {
                      "type": "Log",
                      "variable": "vNnbf6N1G",
                      "_id": "61fbfad491b3061d3f61c7f6"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c7f7"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7f0"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7ef"
            }
          ],
          "_id": "61fbfad491b3061d3f61c7a7"
        },
        {
          "name": "Motor",
          "items": [
            {
              "design": {
                "id": "4z-DEvK3h",
                "content": {
                  "name": "Compressor Volts",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "xFckNZx_u",
                "content": {
                  "name": "Compressor Volts",
                  "type": "Triple Input",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "QF_mLLhFu",
                  "content": {
                    "name": "Compressor Volts",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Preset",
                      "variable": "Electrical Average",
                      "_id": "61fbfad491b3061d3f61c7fb"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7fa"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7f9"
            },
            {
              "design": {
                "id": "gkyJeo8uM",
                "content": {
                  "name": "Compressor Amps",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "gtccLV_6J",
                "content": {
                  "name": "Compressor Amps",
                  "type": "Triple Input",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "71tSUDH1q",
                  "content": {
                    "name": "Compressor Amps",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Preset",
                      "variable": "Electrical Average",
                      "_id": "61fbfad491b3061d3f61c7fe"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c7fd"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7fc"
            },
            {
              "design": {
                "id": "tMQ3rTb2P",
                "content": {
                  "name": "kW Per Ton",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "No Unit",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "DYDW7-5R5",
                  "content": {
                    "name": "kW Per Ton",
                    "unit": "No Unit",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Calculation",
                      "variable": "-qMMv6w8I",
                      "_id": "61fbfad491b3061d3f61c801"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c802"
                    },
                    {
                      "type": "Calculation",
                      "variable": "m7TC8xMwJ",
                      "_id": "61fbfad491b3061d3f61c803"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c800"
                }
              ],
              "_id": "61fbfad491b3061d3f61c7ff"
            },
            {
              "design": {
                "id": "BsSA0USGZ",
                "content": {
                  "name": "% Motor Load",
                  "type": "Percentage",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "jpLpNolUE",
                  "content": {
                    "name": "% Motor Load",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Calculation",
                      "variable": "71tSUDH1q",
                      "_id": "61fbfad491b3061d3f61c806"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c807"
                    },
                    {
                      "type": "Design",
                      "variable": "gkyJeo8uM",
                      "_id": "61fbfad491b3061d3f61c808"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c805"
                }
              ],
              "_id": "61fbfad491b3061d3f61c804"
            },
            {
              "design": {
                "id": "5Ma6wfkSy",
                "content": {
                  "name": "Motor kW",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Kilowatts",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "-qMMv6w8I",
                  "content": {
                    "name": "kW",
                    "unit": "Kilowatts",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Math",
                      "variable": "(",
                      "_id": "61fbfad491b3061d3f61c80b"
                    },
                    {
                      "type": "Calculation",
                      "variable": "71tSUDH1q",
                      "_id": "61fbfad491b3061d3f61c80c"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c80d"
                    },
                    {
                      "type": "Calculation",
                      "variable": "QF_mLLhFu",
                      "_id": "61fbfad491b3061d3f61c80e"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c80f"
                    },
                    {
                      "type": "Number",
                      "variable": "1.73",
                      "_id": "61fbfad491b3061d3f61c810"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c811"
                    },
                    {
                      "type": "Design",
                      "variable": "1MBzbgM8N",
                      "_id": "61fbfad491b3061d3f61c812"
                    },
                    {
                      "type": "Math",
                      "variable": ")",
                      "_id": "61fbfad491b3061d3f61c813"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c814"
                    },
                    {
                      "type": "Number",
                      "variable": "1000",
                      "_id": "61fbfad491b3061d3f61c815"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c80a"
                }
              ],
              "_id": "61fbfad491b3061d3f61c809"
            },
            {
              "design": {
                "id": "H5uEiv_n3",
                "content": {
                  "name": "kW Per Ton Efficiency",
                  "type": "Percentage",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "w3_OlRItC",
                  "content": {
                    "name": "kW Per Ton Efficiency",
                    "unit": "No Unit",
                    "type": "Percentage",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Design",
                      "variable": "tMQ3rTb2P",
                      "_id": "61fbfad491b3061d3f61c818"
                    },
                    {
                      "type": "Math",
                      "variable": "/",
                      "_id": "61fbfad491b3061d3f61c819"
                    },
                    {
                      "type": "Calculation",
                      "variable": "DYDW7-5R5",
                      "_id": "61fbfad491b3061d3f61c81a"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c817"
                }
              ],
              "_id": "61fbfad491b3061d3f61c816"
            },
            {
              "design": {
                "id": "JG7dVobQ9",
                "content": {
                  "name": "Watts",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Watts",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [
                {
                  "id": "kahXEoWSG",
                  "content": {
                    "name": "Watts",
                    "unit": "Watts",
                    "type": "Number",
                    "order": 0,
                    "decimals": 1,
                    "metric": false,
                    "indexed": false
                  },
                  "formula": [
                    {
                      "type": "Calculation",
                      "variable": "-qMMv6w8I",
                      "_id": "61fbfad491b3061d3f61c81d"
                    },
                    {
                      "type": "Math",
                      "variable": "*",
                      "_id": "61fbfad491b3061d3f61c81e"
                    },
                    {
                      "type": "Number",
                      "variable": "1000",
                      "_id": "61fbfad491b3061d3f61c81f"
                    }
                  ],
                  "_id": "61fbfad491b3061d3f61c81c"
                }
              ],
              "_id": "61fbfad491b3061d3f61c81b"
            },
            {
              "design": {
                "id": "1MBzbgM8N",
                "content": {
                  "name": "Power Factor",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "content": {
                  "type": "Blank",
                  "decimals": 3
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c820"
            },
            {
              "design": {
                "id": "JfHtgmVWw",
                "content": {
                  "name": "Megg Ohm Reading",
                  "type": "Text",
                  "isRequired": true,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "ZM9l8vIAu",
                "content": {
                  "name": "Megg Ohm Reading",
                  "type": "Number",
                  "isRequired": false,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c821"
            }
          ],
          "_id": "61fbfad491b3061d3f61c7f8"
        },
        {
          "name": "Other",
          "items": [
            {
              "design": {
                "id": "BSCX9YbJE",
                "content": {
                  "name": "Purge Count",
                  "type": "Blank",
                  "decimals": 3,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "1xQzxpQFy",
                "content": {
                  "name": "Purge Count",
                  "type": "Number",
                  "isRequired": false,
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c823"
            },
            {
              "design": {
                "id": "upWMBjBi1",
                "content": {
                  "name": "Total Purge Hours",
                  "type": "Blank",
                  "decimals": 3,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "TEYRwgoFU",
                "content": {
                  "name": "Total Purge Hours",
                  "type": "Number",
                  "isRequired": false,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c824"
            },
            {
              "design": {
                "id": "PfQt02RcA",
                "content": {
                  "name": "Chiller Run Hours",
                  "type": "Blank",
                  "decimals": 3,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "Hd6C9_NhL",
                "content": {
                  "name": "Chiller Run Hours",
                  "type": "Number",
                  "isRequired": false,
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c825"
            },
            {
              "design": {
                "id": "vwO6mhiIt",
                "content": {
                  "name": "Chiller Number of Starts",
                  "type": "Blank",
                  "decimals": 3,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "EZIvDQGoz",
                "content": {
                  "name": "Chiller Number of Starts",
                  "type": "Number",
                  "isRequired": false,
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c826"
            },
            {
              "design": {
                "id": "_EILXhdJd",
                "content": {
                  "name": "Oil Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "8ujm0BmJ_",
                "content": {
                  "name": "Oil Pressure",
                  "type": "Number",
                  "isRequired": true,
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c827"
            },
            {
              "design": {
                "id": "wtg9EK3qd",
                "content": {
                  "name": "Oil Sump Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "cVfNi1qA_",
                "content": {
                  "name": "Oil Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 0,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c828"
            },
            {
              "design": {
                "id": "oMj-A-4AE",
                "content": {
                  "name": "Oil Temperature Entering Oil Cooler",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "8M8Fvklu8",
                "content": {
                  "name": "Oil Temperature Entering Oil Cooler",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c829"
            },
            {
              "design": {
                "id": "2dwJovx8g",
                "content": {
                  "name": "Oil Temperature Leaving Oil Cooler",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "XGU-J19KH",
                "content": {
                  "name": "Oil Temperature Leaving Oil Cooler",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c82a"
            },
            {
              "design": {
                "id": "XWBp8jF0V",
                "content": {
                  "name": "Outdoor Air Dry Bulb, Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "7zpuN98cD",
                "content": {
                  "name": "Outdoor Air Dry Bulb, Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c82b"
            },
            {
              "design": {
                "id": "MZV7WWd_x",
                "content": {
                  "name": "Outdoor Air Wet Bulb, Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                }
              },
              "log": {
                "id": "vNnbf6N1G",
                "content": {
                  "name": "Outdoor Air Wet Bulb, Temperature",
                  "type": "Number",
                  "isRequired": true,
                  "unit": "Temperature",
                  "decimals": 1,
                  "metric": false,
                  "indexed": false
                },
                "analytics": []
              },
              "calculations": [],
              "_id": "61fbfad491b3061d3f61c82c"
            }
          ],
          "_id": "61fbfad491b3061d3f61c822"
        }
      ],
      "_id": "61fbfad491b3061d3f61c753"
    }
  ],
  "__v": 146,
  "updatedAt": {},
  "createdAt": {},
  "costAnalyses": [
    {
      "id": "HOC-R7k_2",
      "content": {
        "name": "Percent Inefficiency",
        "unit": "No Unit",
        "type": "Percentage",
        "order": 0,
        "decimals": 2,
        "metric": true
      },
      "formula": [
        {
          "type": "Number",
          "variable": "0",
          "_id": "621e2a43a5638e5796a04ea4"
        },
        {
          "type": "Math",
          "variable": "-",
          "_id": "621e2a43a5638e5796a04ea5"
        },
        {
          "type": "Calculation",
          "variable": "w3_OlRItC",
          "_id": "621e2a43a5638e5796a04ea6"
        }
      ],
      "_id": "621e2a19a5638e5796a042a4"
    },
    {
      "id": "19JZo-7mi",
      "content": {
        "name": "kW Differential From Design",
        "unit": "Kilowatts",
        "type": "Number",
        "order": 1,
        "decimals": 2
      },
      "formula": [
        {
          "type": "Math",
          "variable": "(",
          "_id": "621e2a8ba5638e5796a05784"
        },
        {
          "type": "Design",
          "variable": "5Ma6wfkSy",
          "_id": "621e2a8ba5638e5796a05785"
        },
        {
          "type": "Math",
          "variable": "*",
          "_id": "621e2a8ba5638e5796a05786"
        },
        {
          "type": "Calculation",
          "variable": "s1tA2CxCT",
          "_id": "621e2a8ba5638e5796a05787"
        },
        {
          "type": "Math",
          "variable": ")",
          "_id": "621e2a8ba5638e5796a05788"
        },
        {
          "type": "Math",
          "variable": "-",
          "_id": "621e2a8ba5638e5796a05789"
        },
        {
          "type": "Calculation",
          "variable": "-qMMv6w8I",
          "_id": "621e2a8ba5638e5796a0578a"
        }
      ],
      "_id": "621e2a46a5638e5796a0548d"
    },
    {
      "id": "tZLCTWYtE",
      "content": {
        "name": "Raw Inefficiency Cost",
        "unit": "Currency",
        "type": "Number",
        "order": 2,
        "decimals": 2
      },
      "formula": [
        {
          "type": "Customer",
          "variable": "Cost Per kWH",
          "_id": "621e2abaa5638e5796a060b0"
        },
        {
          "type": "Math",
          "variable": "*",
          "_id": "621e2abaa5638e5796a060b1"
        },
        {
          "type": "Customer",
          "variable": "Hours Per Day",
          "_id": "621e2abaa5638e5796a060b2"
        },
        {
          "type": "Math",
          "variable": "*",
          "_id": "621e2abaa5638e5796a060b3"
        },
        {
          "type": "Customer",
          "variable": "Days Per Year",
          "_id": "621e2abaa5638e5796a060b4"
        },
        {
          "type": "Math",
          "variable": "*",
          "_id": "621e2abaa5638e5796a060b5"
        },
        {
          "type": "Cost Analysis",
          "variable": "19JZo-7mi",
          "_id": "621e2abaa5638e5796a060b6"
        }
      ],
      "_id": "621e2a8fa5638e5796a05da1"
    },
    {
      "id": "GUJ02zMue",
      "content": {
        "name": "Inefficiency Cost",
        "unit": "Currency",
        "type": "Number",
        "order": 3,
        "decimals": 2,
        "metric": true
      },
      "formula": [
        {
          "type": "Cost Analysis",
          "variable": "tZLCTWYtE",
          "_id": "621e2ae4a5638e5796a06a24"
        },
        {
          "type": "Math",
          "variable": "<",
          "_id": "621e2ae4a5638e5796a06a25"
        },
        {
          "type": "Number",
          "variable": "0",
          "_id": "621e2ae4a5638e5796a06a26"
        },
        {
          "type": "Math",
          "variable": "?",
          "_id": "621e2ae4a5638e5796a06a27"
        },
        {
          "type": "Cost Analysis",
          "variable": "tZLCTWYtE",
          "_id": "621e2ae4a5638e5796a06a28"
        },
        {
          "type": "Math",
          "variable": ":",
          "_id": "621e2ae4a5638e5796a06a29"
        },
        {
          "type": "Number",
          "variable": "0",
          "_id": "621e2ae4a5638e5796a06a2a"
        }
      ],
      "_id": "621e2abda5638e5796a066fd"
    }
  ],
  "efficiencyConfiguration": {
    "ref": "w3_OlRItC",
    "ranges": [
      {
        "condition": [
          "<",
          "65"
        ],
        "color": "#8a0707",
        "_id": "621d54b5a5638e57969e4af3"
      },
      {
        "condition": [
          "<",
          "80"
        ],
        "color": "#e60707",
        "_id": "621d54b5a5638e57969e4af4"
      },
      {
        "condition": [
          "<",
          "90"
        ],
        "color": "#ffcf33",
        "_id": "621e2a16a5638e5796a03fbf"
      },
      {
        "condition": [
          "<",
          "115"
        ],
        "color": "#8bc34a",
        "_id": "621e2a16a5638e5796a03fc0"
      },
      {
        "condition": [
          "<",
          "125"
        ],
        "color": "#00bcd4",
        "_id": "621e2a16a5638e5796a03fc1"
      },
      {
        "condition": [
          ">",
          "125"
        ],
        "color": "#e60707",
        "_id": "621d54b5a5638e57969e4af5"
      }
    ]
  },
  "defaultVariant": "61fbfad491b3061d3f61c753"
}
```

## Potential Relationships

No obvious foreign key fields detected.
