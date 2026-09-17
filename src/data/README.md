# West Bengal statistics

Put the incoming district data in `src/data/west-bengal-stats.json`.

Use one record per district and the stable `id` already used by `src/data/west-bengal.json`, for example:

```json
[
  {
    "districtId": "nadia",
    "year": 2026,
    "label": "Example measure",
    "value": 0,
    "unit": "people",
    "source": "Name of source",
    "sourceUrl": "https://example.org"
  }
]
```

Multiple records may share a district. The site can then present a tooltip, comparison, source and year without changing the map IDs.
