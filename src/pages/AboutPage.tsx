import { usePageSeo } from '../lib/seo';

// =========================================================================
// 사이트 소개 및 HELOC·재산세 이의신청 계산 공식 안내 페이지 (/about)
// =========================================================================

export default function AboutPage() {
  usePageSeo({
    title: 'About HelocTaxSmart & CLTV / Property Tax Methodology | HelocTaxSmart',
    description:
      'Learn how HelocTaxSmart calculates maximum HELOC borrowing limits (CLTV), interest-only draw vs. repayment schedules, and property tax appeal savings.',
    path: '/about',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">
        About HelocTaxSmart &amp; Methodology
      </h1>
      <p>
        <strong>HelocTaxSmart</strong> is a free, privacy-first US homeowner equity and property
        tax calculator designed to help homeowners unlock their home equity wisely and lower
        excessive property tax assessments.
      </p>
      <h2 className="text-lg font-bold text-slate-900 pt-2">
        How Our HELOC &amp; Property Tax Appeal Formulas Work
      </h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Combined Loan-to-Value (CLTV) Credit Limit:</strong> Multiply your home&apos;s
          current appraised value by your lender&apos;s maximum CLTV ratio (typically 80% in Texas
          under Article XVI Section 50(a)(6), and 85%–90% in most other states) and subtract your
          existing first mortgage balance.
        </li>
        <li>
          <strong>Two-Phase HELOC Payment Modeling:</strong> Models both the 10-year interest-only
          draw period and the subsequent 10-to-20-year fully amortized principal + interest
          repayment period so you avoid payment shock.
        </li>
        <li>
          <strong>Property Tax Assessment Appeal Savings:</strong> Computes annual and 5-year
          cumulative property tax savings when protesting an over-assessed county valuation using
          recent comparable neighborhood sales and homestead exemptions.
        </li>
      </ul>
    </div>
  );
}

