"""Verify canonical media files and source aliases; standard library only."""
import hashlib, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
library=root/'media-library'
def read(name):return json.loads((library/name).read_text(encoding='utf-8'))
cache={}
def digest(path):
    p=(root/path).resolve()
    assert p.is_relative_to(library.resolve()),p
    if p not in cache:
        with p.open('rb') as f:cache[p]=hashlib.file_digest(f,'sha256').hexdigest()
    return cache[p]
manifest=read('source-manifest.json');catalogue=read('catalogue.json')
for r in manifest:
    assert (root/r['path']).stat().st_size==r['bytes']
    assert digest(r['path'])==r['sha256'],r['path']
for r in catalogue:
    assert digest(r['curated_path'])==r['curated_sha256'],r['id']
    assert len(r['original_paths'])==1
    assert digest(r['original_paths'][0])==r['source_sha256'],r['id']
assert len(manifest)==693 and len(catalogue)==549
assert len(list((library/'curated').rglob('*.*')))==549
for r in read('portfolio/embedded-images.json'):assert digest(r['path'])==r['sha256']
for page in read('portfolio/pages.json'):
    for p in page['images']:assert (root/p).is_file(),p
print('Verified all 693 source records, 549 curated images, and portfolio image references.')
