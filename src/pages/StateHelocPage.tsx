import { Link, useParams } from 'react-router-dom';
import HelocCalculator from '../components/HelocCalculator';
import { HELOC_STATES, findHelocStateBySlug } from '../data/helocStates';
import { calculateHeloc } from '../lib/helocCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 주(State)별 HELOC 한도 & 재산세 이의신청 전용 SEO 페이지 (/heloc-state/:state)
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function StateHelocPage() {
  const { state = '' } = useParams<{ state: string }>();
  const stateInfo = findHelocStateBySlug(state);

  usePageSeo({
    title: stateInfo
      ? `${stateInfo.name} HELOC Borrowing Limit & Property Tax Appeal Calculator (2026)`
      : 'State HELOC Calculator | HelocTaxSmart',
    description: stateInfo
      ? `Calculate your maximum HELOC credit line (${stateInfo.maxCltvPct}% CLTV), monthly draw/repayment payments, and property tax appeal savings in ${stateInfo.name} (${stateInfo.propertyTaxRatePct.toFixed(2)}% avg property tax).`
      : 'State HELOC borrowing limit and property tax appeal calculator.',
    path: stateInfo ? `/heloc-state/${stateInfo.slug}` : '/heloc-state',
  });

  if (!stateInfo) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">State Not Found</h1>
        <Link to="/heloc-state" className="mt-4 inline-block font-semibold text-blue-600 underline">
          Browse all 50 US states &rarr;
        </Link>
      </div>
    );
  }

  const sampleDraws = [25000, 50000, 75000, 100000];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs text-slate-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          &rsaquo;{' '}
          <Link to="/heloc-state" className="hover:underline">
            States
          </Link>{' '}
          &rsaquo; <span className="font-semibold text-slate-700">{stateInfo.name}</span>
        </div>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {stateInfo.name} ({stateInfo.abbr}) HELOC Borrowing Limit &amp; Property Tax Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Homeowners in <strong>{stateInfo.name}</strong> can typically borrow up to{' '}
          <strong>{stateInfo.maxCltvPct}% Combined Loan-to-Value (CLTV)</strong> through a Home
          Equity Line of Credit (HELOC). {stateInfo.helocRuleNote}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Max {stateInfo.abbr} CLTV Cap</div>
            <div className="mt-1 text-xl font-bold text-blue-600">{stateInfo.maxCltvPct}%</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Avg Property Tax Rate</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {stateInfo.propertyTaxRatePct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Median Home Value</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {usd(stateInfo.medianHomeValue)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Homestead Exemption</div>
            <div className="mt-1 text-xl font-bold text-emerald-700">
              {stateInfo.homesteadExemption > 0
                ? usd(stateInfo.homesteadExemption)
                : 'Local Rules'}
            </div>
          </div>
        </div>
      </div>

      <HelocCalculator key={stateInfo.slug} initialState={stateInfo} />

      {/* 인출 금액별 거치 기간 vs 상환 기간 월 납입금 비교표 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} HELOC Monthly Payment Examples (Draw vs. Repayment Period)
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Estimated monthly payments at 8.25% APR (10-year interest-only draw period followed by a
          20-year principal + interest repayment period):
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">HELOC Draw Amount</th>
                <th className="p-3">Interest-Only Draw Payment (Yrs 1–10)</th>
                <th className="p-3">Amortized Repayment (Next 20 Yrs)</th>
                <th className="p-3">Annual Savings vs 21.5% Credit Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sampleDraws.map((draw) => {
                const sample = calculateHeloc({
                  homeMarketValue: 600000,
                  firstMortgageBalance: 250000,
                  maxCltvPct: stateInfo.maxCltvPct,
                  desiredDrawAmount: draw,
                  helocAprPct: 8.25,
                  drawPeriodYears: 10,
                  repaymentPeriodYears: 20,
                  creditCardDebtAprPct: 21.5,
                });
                return (
                  <tr key={draw} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{usd(draw)}</td>
                    <td className="p-3 font-bold text-emerald-700">
                      {usd(sample.drawPeriodInterestOnlyMo)} / mo
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {usd(sample.repaymentPeriodMonthly)} / mo
                    </td>
                    <td className="p-3 text-blue-600 font-semibold">
                      Save {usd(sample.annualInterestSavedVsCard)} / yr
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주별 자주 묻는 질문 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} HELOC &amp; Property Tax Appeal FAQs
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              How much equity can I borrow with a HELOC in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Most lenders in {stateInfo.name} allow a Combined Loan-to-Value (CLTV) ratio of up to{' '}
              <strong>{stateInfo.maxCltvPct}%</strong> of your home&apos;s appraised value minus
              your remaining first mortgage balance. {stateInfo.helocRuleNote}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              How can I lower my property tax bill in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Homeowners in {stateInfo.name} pay an average effective property tax rate of{' '}
              <strong>{stateInfo.propertyTaxRatePct.toFixed(2)}%</strong>. You can reduce your bill
              by applying for your primary residence Homestead Exemption and filing a County Board
              of Equalization appeal with comparable recent sales if your assessed value exceeds
              fair market value. Use our{' '}
              <Link to="/property-tax-appeal" className="font-semibold text-blue-600 underline">
                Property Tax Appeal Calculator
              </Link>{' '}
              or check county-level rates on{' '}
              <a
                href={`https://mortgage.bangjang.net/mortgage/${stateInfo.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 underline"
              >
                MortgageSmart {stateInfo.name} County Tax Guide &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 다른 주 빠른 이동 링크 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Compare HELOC &amp; Property Tax Rules in Other US States
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {HELOC_STATES.map((s) => (
            <Link
              key={s.slug}
              to={`/heloc-state/${s.slug}`}
              className={`rounded-md border px-2.5 py-1 font-medium ${
                s.slug === stateInfo.slug
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400'
              }`}
            >
              {s.name} ({s.maxCltvPct}% CLTV)
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

