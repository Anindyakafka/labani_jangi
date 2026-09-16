# Labani media library

This is an **unpublished source archive**, outside Astro's `public/` and `src/content/`. All useful media, crops, extracted portfolio material, catalogues and the local visual browser are kept in the repository and are no longer ignored by Git. Nothing here automatically appears on the website.

## Browse

- [Visual browser](review/index.html): open locally to search descriptions and filter categories.
- [Political](political.csv): 321 images.
- [Palestine](palestine.csv): 26 images.
- [Others](others.csv): 202 images.
- [Portfolio report](portfolio/REVIEW.md): reading map and recommendations for all 72 pages.
- [Catalogue](catalogue.json), [source manifest](source-manifest.json), [verification](verification.json), [deduplication record](deduplication.json).

## Single-copy storage

```text
curated/political/         canonical images and reviewed crops
curated/palestine/
curated/others/
originals/labani_di/       32 original screenshots underlying the crops
portfolio/source/         original PDF and PowerPoint
portfolio/extracted/      unique embedded images and raw text exports
portfolio/*.json           page provenance, image references and PDF comparison
review/                   searchable local browser and small previews
```

The supplied folder contained 691 images, including 142 exact duplicate copies, plus a PDF and PPTX. There are 549 distinct source images. Exact duplicates have been deleted from the working tree. Each uncropped source is stored once in its category folder, with its original bytes intact. Cropped images retain a separate source screenshot because a crop is not an identical copy. Different crops, resolutions, colours and photographs of the same subject remain distinct.

The 693 historical source records in `source-manifest.json` resolve to retained byte-identical canonical files. Multiple historical names can point to one file; those aliases do not represent additional files. The catalogue's `previous_paths` preserves original filenames. Six redundant extracted portfolio pictures were consolidated; all 115 embedded occurrences reference retained files, including 109 files in `portfolio/extracted/`.

665 redundant files were removed: 142 source duplicates, 517 redundant uncropped source/curated copies and six embedded-image copies. This saved 1,797,913,011 bytes before temporary-folder cleanup. The PDF and PPTX remain for reading and editing. Small gallery previews remain for fast browsing. Git history was not rewritten; removals apply to the current working tree and the next commit.

## Review and crops

All 549 distinct images were visually reviewed in inspection sheets, with screenshot/crop and ambiguous document enlargements. All 72 portfolio pages were visually reviewed and their selectable text read. This is not a transcription of every tiny text fragment in artworks or covers.

32 screenshot derivatives use pixel-preserving rectangular crops saved as PNG. No regeneration, sharpening, resizing, colour correction or perspective correction was applied. Rectangles are recorded in [the crop manifest](../scripts/media-crops.json), using EXIF-oriented source pixels and exclusive right/bottom coordinates. Small black margins preserve dark paint. Crop pixels were verified against the sources before temporary processing tools were removed.

Full posters, signatures, handwritten text and quotations remain within crops. Platform attribution remains in source screenshots. Images `img-0460`, `img-0534` and `img-0545` have interface overlays on the image itself; these are flagged, not painted out. Image 545 only loses the phone's outer bars. Sideways photographs and paper edges remain unchanged.

Descriptions are observations, not approved artwork titles, dates, captions or authorship claims. Categories describe material, not the beliefs of people in photographs. Palestine takes precedence where supported by flags, captions, publications or related installation context. Ambiguous images remain in Others unless context establishes more. Photographer and collaborator credits still need confirmation for many files.

## Future use and maintenance

Choose a small selection, confirm details with Labani, and export web-sized files to `public/media/`. Do not copy this entire archive into the deployment directory. Create paired English/Bangla entries with the same `translationKey`; translate body, alt text, descriptions and credits. Preserve first-person narration and “Nadi aar Nadia” / “নদী আর নদিয়া”. Follow the root `AGENTS.md` when publishing.

Manual decisions remain in `scripts/media-review.tsv` and `scripts/media-crops.json`. Run `python scripts/verify-media.py` to check original hashes, canonical images and portfolio references using Python's standard library. Temporary Python packages, inspection sheets and obsolete preparation scripts have been removed. Normal dependency/build folders and secrets remain ignored by Git.
