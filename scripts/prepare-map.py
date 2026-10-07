"""Generate local West Bengal geometry from the pinned geoBoundaries source.

Run after downloading the source as map-source.tmp.json (see README), or use the
checked-in public/maps/west-bengal.geojson as the source. Output derivatives retain
the source ODbL 1.0 license. Centroids and the unified state outline are derived
from the same district polygons; no manually chosen map coordinates are used.
"""
import json
import math
from collections import Counter, defaultdict
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
source_path = Path('map-source.tmp.json')
if not source_path.exists():
    source_path = Path('public/maps/west-bengal.geojson')
source = json.loads(source_path.read_text())
features = [feature for feature in source['features'] if feature['properties']['shapeName'] in names]
assert len(features) == 23, f'Expected 23 districts, found {len(features)}'


def polygons(feature):
    geometry = feature['geometry']
    if geometry['type'] == 'Polygon':
        return [geometry['coordinates']]
    if geometry['type'] == 'MultiPolygon':
        return geometry['coordinates']
    raise ValueError(f"Unsupported geometry type: {geometry['type']}")


def project(point):
    lon, lat = point[:2]
    assert 85 < lon < 90.5 and 21 < lat < 28
    return lon * math.cos(math.radians(24.5)), -lat


def ring_area_centroid(points):
    projected = [project(point) for point in points]
    if projected[0] == projected[-1]:
        projected.pop()
    cross_sum = 0.0
    x_sum = 0.0
    y_sum = 0.0
    for (x1, y1), (x2, y2) in zip(projected, projected[1:] + projected[:1]):
        cross = x1 * y2 - x2 * y1
        cross_sum += cross
        x_sum += (x1 + x2) * cross
        y_sum += (y1 + y2) * cross
    if abs(cross_sum) < 1e-12:
        raise ValueError('Encountered a degenerate GeoJSON ring')
    return abs(cross_sum) / 2, (x_sum / (3 * cross_sum), y_sum / (3 * cross_sum))


def geometry_area_centroid(feature):
    area_total = x_total = y_total = 0.0
    for polygon in polygons(feature):
        for ring_index, ring in enumerate(polygon):
            area, (cx, cy) = ring_area_centroid(ring)
            signed_area = area if ring_index == 0 else -area
            area_total += signed_area
            x_total += cx * signed_area
            y_total += cy * signed_area
    if area_total <= 0:
        raise ValueError(f"Invalid area for {feature['properties']['shapeName']}")
    return area_total, (x_total / area_total, y_total / area_total)


source_points = [point for feature in features for polygon in polygons(feature) for ring in polygon for point in ring]
projected_points = [project(point) for point in source_points]
min_x, max_x = min(point[0] for point in projected_points), max(point[0] for point in projected_points)
min_y, max_y = min(point[1] for point in projected_points), max(point[1] for point in projected_points)
scale = min(400 / (max_x - min_x), 530 / (max_y - min_y))
offset_x = (440 - (max_x - min_x) * scale) / 2
offset_y = (570 - (max_y - min_y) * scale) / 2


def map_point(point):
    x, y = project(point)
    return offset_x + (x - min_x) * scale, offset_y + (y - min_y) * scale


def svg_point(point):
    x, y = map_point(point)
    return f'{x:.2f},{y:.2f}'


def simplify_open(points, tolerance):
    if len(points) <= 2:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    denominator = dx * dx + dy * dy
    max_distance = -1.0
    split_index = 0
    for index, (x, y) in enumerate(points[1:-1], 1):
        if denominator == 0:
            distance = math.hypot(x - x1, y - y1)
        else:
            t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / denominator))
            distance = math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
        if distance > max_distance:
            max_distance = distance
            split_index = index
    if max_distance <= tolerance:
        return [points[0], points[-1]]
    left = simplify_open(points[:split_index + 1], tolerance)
    right = simplify_open(points[split_index:], tolerance)
    return left[:-1] + right


def simplify_closed(points, tolerance):
    if points[0] == points[-1]:
        points = points[:-1]
    if len(points) <= 3:
        return points
    split = max(range(1, len(points)), key=lambda i: (points[i][0] - points[0][0]) ** 2 + (points[i][1] - points[0][1]) ** 2)
    first_arc = simplify_open(points[:split + 1], tolerance)
    second_arc = simplify_open(points[split:] + [points[0]], tolerance)
    result = first_arc[:-1] + second_arc[:-1]
    return result if len(result) >= 3 else points


# Project all district rings once; even-odd fill in SVG preserves any holes.
districts = []
state_area = state_x = state_y = 0.0
for feature in features:
    original = feature['properties']['shapeName']
    name = names[original]
    slug = name.lower().replace(' ', '-')
    feature['properties'].update({'districtId': slug, 'displayName': name})
    path_rings = []
    for polygon in polygons(feature):
        for ring in polygon:
            path_rings.append('M' + 'L'.join(svg_point(point) for point in ring) + 'Z')
    area, (centroid_x, centroid_y) = geometry_area_centroid(feature)
    state_area += area
    state_x += centroid_x * area
    state_y += centroid_y * area
    district_centroid = map_point((centroid_x / math.cos(math.radians(24.5)), -centroid_y))
    districts.append({
        'id': slug,
        'name': name,
        'sourceId': feature['properties']['shapeID'],
        'path': ''.join(path_rings),
        'centroid': [round(district_centroid[0], 3), round(district_centroid[1], 3)],
    })

# Cancel the exact shared edges between adjacent district polygons. The remaining
# graph is the outer perimeter of the combined state, rather than 23 internal rings.
edge_counts = Counter()
for feature in features:
    for polygon in polygons(feature):
        for ring in polygon[:1]:
            keys = []
            for point in ring:
                key = (round(float(point[0]), 7), round(float(point[1]), 7))
                keys.append(key)
            for first, second in zip(keys, keys[1:]):
                edge_counts[tuple(sorted((first, second)))] += 1
if any(count > 2 for count in edge_counts.values()):
    raise ValueError('Unexpected overlapping district boundaries in GeoJSON')
boundary_edges = {edge for edge, count in edge_counts.items() if count == 1}
adjacency = defaultdict(list)
for first, second in boundary_edges:
    adjacency[first].append(second)
    adjacency[second].append(first)
if any(len(neighbors) != 2 for neighbors in adjacency.values()):
    raise ValueError('State outline boundary is not a collection of closed polygon loops')

remaining = set(boundary_edges)
loops = []
while remaining:
    first, second = min(remaining)
    remaining.remove(tuple(sorted((first, second))))
    ring = [first, second]
    current = second
    while current != first:
        candidates = sorted(neighbor for neighbor in adjacency[current]
                            if tuple(sorted((current, neighbor))) in remaining)
        if len(candidates) != 1:
            raise ValueError('Could not unambiguously trace the unified state outline')
        following = candidates[0]
        remaining.remove(tuple(sorted((current, following))))
        ring.append(following)
        current = following
    projected_ring = [map_point(point) for point in ring]
    simplified_ring = simplify_closed(projected_ring, tolerance=0.34)
    loops.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in simplified_ring) + 'Z')

state_centroid = map_point((state_x / state_area / math.cos(math.radians(24.5)), -(state_y / state_area)))
outline = {
    'path': ''.join(loops),
    'centroid': [round(state_centroid[0], 3), round(state_centroid[1], 3)],
}
Path('src/data').mkdir(parents=True, exist_ok=True)
Path('src/data/west-bengal.json').write_text(json.dumps(sorted(districts, key=lambda district: district['name']), separators=(',', ':')) + '\n')
Path('src/data/west-bengal-outline.json').write_text(json.dumps(outline, separators=(',', ':')) + '\n')
Path('public/maps').mkdir(parents=True, exist_ok=True)
Path('public/maps/west-bengal.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')) + '\n')
print(f'Generated {len(districts)} district paths with centroids and a {len(loops)}-loop simplified state outline.')
