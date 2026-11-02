import { usePageSeo } from '../lib/seo';

// =========================================================================
// 이용약관 및 금융 면책조항 페이지 (/terms)
// =========================================================================

export default function TermsPage() {
  usePageSeo({
    title: 'Terms of Use & Financial Disclaimer | HelocTaxSmart',
    description:
      'Terms of Use and Financial Disclaimer for HelocTaxSmart. All HELOC credit limit, interest rate, and property tax appeal figures are estimates for educational purposes only.',
    path: '/terms',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">
        Terms of Use &amp; Financial Disclaimer
      </h1>
      <p>
        All figures produced by <strong>HelocTaxSmart</strong>—including maximum HELOC borrowing
        limits, CLTV ratios, variable interest payments, and property tax appeal savings—are
        estimates for informational and educational purposes only.
      </p>
      <p>
        HelocTaxSmart is not a mortgage lender, bank, real estate appraiser, or property tax law
        firm. Always verify loan terms with a licensed mortgage lender and consult your local
        county assessor or tax professional regarding formal property tax protests.
      </p>
    </div>
  );
}

