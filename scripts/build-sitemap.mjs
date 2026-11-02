// =========================================================================
// 전체 페이지 Sitemap 자동 생성 스크립트 (HelocTaxSmart)
// =========================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATES_TS = join(ROOT, 'src', 'data', 'helocStates.ts');
const OUT_FILE = join(ROOT, 'public', 'sitemap.xml');

const SITE_ORIGIN = 'https://heloc.bangjang.net';
const LASTMOD = '2026-11-01';

const staticPaths = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/heloc-state', priority: '0.9', changefreq: 'monthly' },
  { path: '/property-tax-appeal', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

const stateSlugs = [
  ...readFileSync(STATES_TS, 'utf8').matchAll(/slug:\s*'([a-z-]+)'/g),
].map((m) => m[1]);

const statePaths = stateSlugs.map((slug) => ({
  path: `/heloc-state/${slug}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

const allEntries = [...staticPaths, ...statePaths];

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allEntries.map(
    (u) =>
      `  <url><loc>${SITE_ORIGIN}${u.path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  ),
  '</urlset>',
  '',
];

writeFileSync(OUT_FILE, xmlLines.join('\n'), 'utf8');
console.log(
  `sitemap.xml 생성 완료: 총 ${allEntries.length}개 URL (고정 ${staticPaths.length} + 주 ${statePaths.length})`
);

