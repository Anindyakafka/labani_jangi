import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({ integrations: [react()], site: 'https://labanijangi.com', output: 'static', trailingSlash: 'always' });
