import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const archive = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/archive' }),
  schema: z.object({
    title: z.string(), kind: z.enum(['work', 'writing', 'conversation']),
    date: z.coerce.date(), description: z.string(), draft: z.boolean().default(true),
    language: z.enum(['en', 'bn']).default('en'),
    translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    series: z.string().optional(), medium: z.string().optional(),
    image: z.string().optional(), imageAlt: z.string().optional(), credit: z.string().optional(),
    video: z.url().optional(), source: z.url().optional(), sourceName: z.string().optional(),
  }).refine(data => !data.image || Boolean(data.imageAlt && data.credit), {
    message: 'Images need both imageAlt and credit.',
  }),
});
export const collections = { archive };
