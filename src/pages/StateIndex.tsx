import { Link } from 'react-router-dom';
import { HELOC_STATES } from '../data/helocStates';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 51개 주(50개 주 + DC) HELOC 최대 CLTV 한도 및 실효 재산세율 비교 목록 페이지
// =========================================================================

export default function StateIndex() {
  usePageSeo({
    title: 'HELOC Borrowing Limit & Property Tax Calculator by State (2026) | HelocTaxSmart',
    description:
      'Compare 2026 maximum HELOC CLTV borrowing limits, statewide effective property tax rates, and homestead exemptions across all 50 US states and DC.',
    path: '/heloc-state',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900">
          US HELOC Borrowing Limit &amp; Property Tax Appeal Guide by State (2026)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Select your state below to calculate your maximum borrowable Home Equity Line of Credit
          (HELOC), interest-only vs. amortized monthly payments, and property tax appeal savings.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">State</th>
                <th className="p-3">Max HELOC CLTV</th>
                <th className="p-3">Avg Property Tax Rate</th>
                <th className="p-3">Median Home Value</th>
                <th className="p-3">Sample Homestead Exemption</th>
                <th className="p-3">Calculator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {HELOC_STATES.map((st) => (
                <tr key={st.slug} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    <Link to={`/heloc-state/${st.slug}`} className="text-blue-600 hover:underline">
                      {st.name} ({st.abbr})
                    </Link>
                  </td>
                  <td className="p-3 font-semibold text-blue-600">{st.maxCltvPct}% CLTV</td>
                  <td className="p-3 font-semibold text-slate-900">
                    {st.propertyTaxRatePct.toFixed(2)}%
                  </td>
                  <td className="p-3 text-slate-700">${st.medianHomeValue.toLocaleString()}</td>
                  <td className="p-3 text-slate-700">
                    {st.homesteadExemption > 0
                      ? `$${st.homesteadExemption.toLocaleString()}`
                      : 'Varies locally'}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/heloc-state/${st.slug}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Calculate HELOC &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

