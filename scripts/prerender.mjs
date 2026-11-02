// =========================================================================
// 57개 전체 페이지 정적 HTML 사전 생성(Pre-rendering / SSG) 스크립트 (HelocTaxSmart)
// =========================================================================

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STATES_TS = join(ROOT, 'src', 'data', 'helocStates.ts');

const SITE_ORIGIN = 'https://heloc.bangjang.net';

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

const stateRegex =
  /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*abbr:\s*'([^']+)',\s*propertyTaxRatePct:\s*([0-9.]+),\s*maxCltvPct:\s*([0-9]+),\s*medianHomeValue:\s*([0-9]+),\s*homesteadExemption:\s*([0-9]+),\s*helocRuleNote:\s*'([^']+)'\s*\}/g;

const states = [...readFileSync(STATES_TS, 'utf8').matchAll(stateRegex)].map((m) => ({
  slug: m[1],
  name: m[2],
  abbr: m[3],
  propertyTaxRatePct: Number(m[4]),
  maxCltvPct: Number(m[5]),
  medianHomeValue: Number(m[6]),
  homesteadExemption: Number(m[7]),
  helocRuleNote: m[8],
}));

if (states.length !== 51) {
  console.error(`주 데이터 파싱 실패: ${states.length}개`);
  process.exit(1);
}

function writePageHtml({ routePath, title, description, heading, summaryHtml, faqItems }) {
  const canonical = `${SITE_ORIGIN}${routePath}`;
  let html = baseHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/>/,
    `<meta name="title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${esc(description)}" />`
  );

  if (faqItems && faqItems.length > 0) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
    const scriptTag = `    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>\n  </head>`;
    html = html.replace('</head>', scriptTag);
  }

  const seoBody = `<div id="root"><main class="mx-auto max-w-5xl p-6"><h1 class="text-3xl font-bold text-slate-900">${esc(heading)}</h1>${summaryHtml}</main></div>`;
  html = html.replace('<div id="root"></div>', seoBody);

  const outDir = routePath === '/' ? DIST : join(DIST, ...routePath.replace(/^\//, '').split('/'));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

let count = 0;

const fixedPages = [
  {
    routePath: '/',
    title: 'HELOC Borrowing Limit & Property Tax Appeal Calculator 2026 | HelocTaxSmart',
    description:
      'Free US HELOC borrowing limit (CLTV), interest-only draw vs. repayment payment, and property tax appeal savings calculator across all 50 states and DC.',
    heading: 'HELOC Borrowing Limit & Monthly Payment Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Calculate your maximum borrowable Home Equity Line of Credit (HELOC), interest-only draw payments, amortized repayment schedules, and property tax appeal savings across all 50 US states.</p>',
  },
  {
    routePath: '/heloc-state',
    title: 'HELOC Borrowing Limit & Property Tax Calculator by State (2026) | HelocTaxSmart',
    description:
      'Compare 2026 maximum HELOC CLTV borrowing limits, statewide effective property tax rates, and homestead exemptions across all 50 US states and DC.',
    heading: 'US HELOC Borrowing Limit & Property Tax Appeal Guide by State',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Select your state to estimate your maximum HELOC credit line, CLTV rules, and property tax protest savings.</p>',
  },
  {
    routePath: '/property-tax-appeal',
    title: 'Property Tax Appeal & Homestead Exemption Savings Calculator (2026) | HelocTaxSmart',
    description:
      'Calculate how much money you can save on your annual and 5-year property tax bill by appealing an over-assessed county property valuation and claiming homestead exemptions.',
    heading: 'Property Tax Appeal & Homestead Exemption Savings Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Estimate your annual and 5-year property tax savings when protesting an inflated county property tax assessment.</p>',
  },
  {
    routePath: '/about',
    title: 'About HelocTaxSmart & CLTV / Property Tax Methodology | HelocTaxSmart',
    description:
      'Learn how HelocTaxSmart calculates maximum HELOC borrowing limits (CLTV), interest-only draw vs. repayment schedules, and property tax appeal savings.',
    heading: 'About HelocTaxSmart & Methodology',
    summaryHtml:
      '<p class="mt-2 text-slate-600">HelocTaxSmart combines state-specific CLTV home equity rules with US Census effective property tax data.</p>',
  },
  {
    routePath: '/privacy',
    title: 'Privacy Policy | HelocTaxSmart',
    description:
      'Privacy Policy for HelocTaxSmart. Learn how we protect your homeowner financial data with client-side browser calculations, AES-256 encryption, and cookie disclosures.',
    heading: 'Privacy Policy',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All HELOC and property tax appeal calculations execute locally in your browser with client-side AES-256 encryption.</p>',
  },
  {
    routePath: '/terms',
    title: 'Terms of Use & Financial Disclaimer | HelocTaxSmart',
    description:
      'Terms of Use and Financial Disclaimer for HelocTaxSmart. All HELOC credit limit, interest rate, and property tax appeal figures are estimates for educational purposes only.',
    heading: 'Terms of Use & Financial Disclaimer',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All calculators and tax figures on HelocTaxSmart are estimates for educational purposes only.</p>',
  },
];

for (const p of fixedPages) {
  writePageHtml(p);
  count++;
}

for (const state of states) {
  writePageHtml({
    routePath: `/heloc-state/${state.slug}`,
    title: `${state.name} HELOC Borrowing Limit & Property Tax Appeal Calculator (2026)`,
    description: `Calculate your maximum HELOC credit line (${state.maxCltvPct}% CLTV), monthly draw/repayment payments, and property tax appeal savings in ${state.name} (${state.propertyTaxRatePct.toFixed(2)}% avg property tax).`,
    heading: `${state.name} (${state.abbr}) HELOC Borrowing Limit & Property Tax Calculator`,
    summaryHtml: `<p class="mt-2 text-slate-600">Estimate your maximum HELOC borrowing limit (${state.maxCltvPct}% CLTV) and property tax savings in ${esc(state.name)}. ${esc(state.helocRuleNote)}</p>`,
    faqItems: [
      {
        q: `What is the maximum HELOC CLTV limit in ${state.name}?`,
        a: `In ${state.name}, lenders typically allow homeowners to borrow up to ${state.maxCltvPct}% Combined Loan-to-Value (CLTV) minus their existing first mortgage balance. ${state.helocRuleNote}`,
      },
      {
        q: `What is the average effective property tax rate in ${state.name}?`,
        a: `The statewide average effective property tax rate in ${state.name} is ${state.propertyTaxRatePct.toFixed(2)}%.`,
      },
    ],
  });
  count++;
}

console.log(`정적 HTML 사전 생성(SSG) 완료: 총 ${count}개 페이지 생성됨`);

