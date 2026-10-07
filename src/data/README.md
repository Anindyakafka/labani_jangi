# West Bengal map data

`west-bengal.json` contains the 23 district paths used by the homepage map. Put incoming district statistics in `src/data/west-bengal-stats.json`, using the stable district `id` already used by `src/data/west-bengal.json`, for example:

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

Multiple statistics may share a district. The site can then present a tooltip, comparison, source and year without changing the map IDs.

## Derived map geometry

Run `python3 scripts/prepare-map.py` after downloading the pinned geoBoundaries source to `map-source.tmp.json`; without that temporary file, the generator uses the checked-in `public/maps/west-bengal.geojson`. It regenerates the district paths, each district's projected polygon centroid, and `west-bengal-outline.json`. The latter is one simplified SVG path made by cancelling shared district edges, so the entrance animation can begin with the state's outer boundary alone. These coordinates are computed from the source geometry, not hand-positioned. The source attribution and ODbL 1.0 terms remain applicable.
