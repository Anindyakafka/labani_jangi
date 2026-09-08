"""Generate local West Bengal geometry from the pinned geoBoundaries source.

Run after downloading the source as map-source.tmp.json (see README).
Output derivatives retain the source ODbL 1.0 license.
"""
import json
import math
from pathlib import Path

names = {
    'Nadia': 'Nadia', 'Dakshin Dinajpur': 'Dakshin Dinajpur',
    'Murshidabad': 'Murshidabad', 'Kolkata': 'Kolkata', 'Maldah': 'Malda',
    'South Twenty Four Parganas': 'South 24 Parganas', 'Darjiling': 'Darjeeling',
    'Jalpaiguri': 'Jalpaiguri', 'Uttar Dinajpur': 'Uttar Dinajpur',
    'Purba Medinipur': 'Purba Medinipur', 'North Twenty Four Parganas': 'North 24 Parganas',
    'Birbhum': 'Birbhum', 'Barddhaman': 'Purba Bardhaman', 'Bankura': 'Bankura',
    'Puruliya': 'Purulia', 'Paschim Medinipur': 'Paschim Medinipur',
    'Alipurduar': 'Alipurduar', 'Jhargram': 'Jhargram',
    'Paschim Barddhaman': 'Paschim Bardhaman', 'Kalimpong': 'Kalimpong',
    'Haora': 'Howrah', 'Koch Bihar': 'Cooch Behar', 'Hugli': 'Hooghly',
}
source = json.loads(Path('map-source.tmp.json').read_text())
features = [f for f in source['features'] if f['properties']['shapeName'] in names]
assert len(features) == 23
def polygons(feature):
    geo = feature['geometry']
    return [geo['coordinates']] if geo['type'] == 'Polygon' else geo['coordinates']
def project(point):
    lon, lat = point[:2]
    assert 85 < lon < 90.5 and 21 < lat < 28
    return lon * math.cos(math.radians(24.5)), -lat
points = [project(p) for f in features for poly in polygons(f) for ring in poly for p in ring]
min_x, max_x = min(p[0] for p in points), max(p[0] for p in points)
min_y, max_y = min(p[1] for p in points), max(p[1] for p in points)
scale = min(400 / (max_x-min_x), 530 / (max_y-min_y))
offset_x = (440 - (max_x-min_x)*scale)/2
offset_y = (570 - (max_y-min_y)*scale)/2
districts = []
for feature in features:
    original = feature['properties']['shapeName']
    name = names[original]
    slug = name.lower().replace(' ', '-')
    feature['properties'].update({'districtId': slug, 'displayName': name})
    rings = []
    for poly in polygons(feature):
        for ring in poly:
            coords = [project(point) for point in ring]
            rings.append('M' + 'L'.join(f'{offset_x+(x-min_x)*scale:.2f},{offset_y+(y-min_y)*scale:.2f}' for x,y in coords) + 'Z')
    districts.append({'id': slug, 'name': name, 'sourceId': feature['properties']['shapeID'], 'path': ''.join(rings)})
Path('public/maps').mkdir(parents=True, exist_ok=True)
Path('public/maps/west-bengal.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')))
Path('src/data/west-bengal.json').write_text(json.dumps(sorted(districts, key=lambda d:d['name']), separators=(',', ':')))
print(f'Generated {len(districts)} district paths and downloadable GeoJSON.')
