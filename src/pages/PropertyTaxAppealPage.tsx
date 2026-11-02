import { useState, useMemo } from 'react';
import { HELOC_STATES } from '../data/helocStates';
import { calculatePropertyTaxAppeal } from '../lib/helocCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 미국 재산세 이의신청(Property Tax Appeal) & Homestead 공제 절세 계산기 페이지
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function PropertyTaxAppealPage() {
  usePageSeo({
    title: 'Property Tax Appeal & Homestead Exemption Savings Calculator (2026) | HelocTaxSmart',
    description:
      'Calculate how much money you can save on your annual and 5-year property tax bill by appealing an over-assessed county property valuation and claiming homestead exemptions.',
    path: '/property-tax-appeal',
  });

  const [countyAssessedValue, setCountyAssessedValue] = useState<number>(480000);
  const [comparableFairMarketValue, setComparableFairMarketValue] = useState<number>(415000);
  const [homesteadExemptionAmount, setHomesteadExemptionAmount] = useState<number>(40000);
  const [effectivePropertyTaxRatePct, setEffectivePropertyTaxRatePct] = useState<number>(1.36);
  const [appealServiceContingencyPct, setAppealServiceContingencyPct] = useState<number>(0);

  const result = useMemo(
    () =>
      calculatePropertyTaxAppeal({
        countyAssessedValue,
        comparableFairMarketValue,
        homesteadExemptionAmount,
        effectivePropertyTaxRatePct,
        appealServiceContingencyPct,
      }),
    [
      countyAssessedValue,
      comparableFairMarketValue,
      homesteadExemptionAmount,
      effectivePropertyTaxRatePct,
      appealServiceContingencyPct,
    ]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Property Assessment Protest Tool
        </span>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Property Tax Appeal &amp; Homestead Exemption Savings Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Over 40% of US homes are assessed higher than their true comparable market value. Enter
          your county&apos;s assessed notice value and recent neighborhood comparable sales (Comps)
          to see how much you can save every year by filing a property tax protest.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  County Notice Assessed Value ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={countyAssessedValue}
                  onChange={(e) => setCountyAssessedValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Evidence / Comps Fair Market Value ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={comparableFairMarketValue}
                  onChange={(e) => setComparableFairMarketValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Homestead Exemption ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={homesteadExemptionAmount}
                  onChange={(e) => setHomesteadExemptionAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Property Tax Rate (%)
                </label>
                <input
                  type="number"
                  min={0.1}
                  max={5}
                  step={0.05}
                  value={effectivePropertyTaxRatePct}
                  onChange={(e) => setEffectivePropertyTaxRatePct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Appeal Firm Fee (0% if DIY)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={5}
                  value={appealServiceContingencyPct}
                  onChange={(e) => setAppealServiceContingencyPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Or Quick-Load State Average Property Tax Rate
              </label>
              <select
                value={effectivePropertyTaxRatePct}
                onChange={(e) => setEffectivePropertyTaxRatePct(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {HELOC_STATES.map((s) => (
                  <option key={s.slug} value={s.propertyTaxRatePct}>
                    {s.name} ({s.propertyTaxRatePct}% Avg Property Tax Rate)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-slate-900 p-6 text-white space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Estimated 5-Year Cumulative Tax Savings
              </div>
              <div className="mt-1 text-4xl font-extrabold text-white">
                {usd(result.fiveYearCumulativeSavings)}
              </div>
              <div className="mt-1 text-xs text-blue-300 font-medium">
                Annual Property Tax Saved:{' '}
                <strong>{usd(result.grossAnnualTaxSavings)} / yr</strong>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Annual Tax Bill:</span>
                <span className="font-semibold text-rose-300">
                  {usd(result.currentAnnualPropertyTax)} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Appealed Annual Tax Bill:</span>
                <span className="font-semibold text-emerald-300">
                  {usd(result.proposedAnnualPropertyTax)} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxable Assessment Reduction:</span>
                <span className="font-semibold text-white">-{usd(result.valuationReduction)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Year-1 Savings (After Fee):</span>
                <span className="font-semibold text-emerald-400">
                  {usd(result.netFirstYearSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

