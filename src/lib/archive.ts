import { getCollection } from 'astro:content';
import type { Locale } from '../i18n';
export async function publishedArchive(locale?: Locale) {
  const entries = await getCollection('archive', ({ data }) => !data.draft);
  const pairs = new Map<string, Set<Locale>>();
  for (const entry of entries) {
    const langs = pairs.get(entry.data.translationKey) ?? new Set<Locale>();
    if (langs.has(entry.data.language)) throw new Error(`Duplicate ${entry.data.language} translation: ${entry.data.translationKey}`);
    langs.add(entry.data.language);
    pairs.set(entry.data.translationKey, langs);
  }
  for (const [key, langs] of pairs) {
    if (langs.size !== 2) throw new Error(`Publish both English and Bangla versions of "${key}", or keep both in draft.`);
  }
  return entries.filter(entry => !locale || entry.data.language === locale);
}
