# Website language requirements

- Every public page must support English and Bangla. English URLs remain at `/`; Bangla equivalents use `/bn/`.
- Use `src/i18n.ts` for interface copy, metadata, accessibility labels and district names. Add both translations together; do not bypass the typed translation keys with casts.
- Preserve first-person narration. Translate meaning naturally; do not add biographical claims. “Nadi aar Nadia” changes script only: “নদী আর নদিয়া”.
- Archive translations are separate Markdown files sharing `translationKey`, with `language: en` or `language: bn`. Use `publishedArchive()` to enforce paired publication. Translate title, description, body, alt text and credits where applicable. Do not label English body text as Bangla.
- Use shared components for both locales and `localPath()` for internal links. Preserve matching-page switching, section anchors, canonical/hreflang metadata, Bangla digits/dates and localized missing pages.
- Analytics event IDs, district data IDs, file names and external destination URLs remain language independent.
- Use Astro-aware editing/formatting. Never run generic beautifiers over `.astro` syntax.
- Validate with `npm run build` and relevant English/Bangla desktop/mobile Playwright checks. No paid translation or font services.
