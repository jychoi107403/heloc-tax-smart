import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HELOC_STATES, HelocStateInfo } from '../data/helocStates';
import { calculateHeloc } from '../lib/helocCalc';
import { saveHelocScenario } from '../lib/supabase';

// =========================================================================
// 미국 HELOC(주택담보 마이너스통장) 최대 한도(CLTV) & 월 상환액 메인 계산기
// - 주별 CLTV 규정(예: 텍사스 80% 한도), 거치 기간(Draw Period) 이자 납입액,
//   상환 기간(Repayment Period) 원리금 납입액, 고금리 카드 대환 절감액을 계산합니다.
// =========================================================================

interface HelocCalculatorProps {
  initialState?: HelocStateInfo;
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function HelocCalculator({ initialState }: HelocCalculatorProps) {
  const defaultState =
    initialState || HELOC_STATES.find((s) => s.slug === 'texas') || HELOC_STATES[0];

  const [selectedStateSlug, setSelectedStateSlug] = useState<string>(defaultState.slug);
  const [homeMarketValue, setHomeMarketValue] = useState<number>(defaultState.medianHomeValue || 450000);
  const [firstMortgageBalance, setFirstMortgageBalance] = useState<number>(220000);
  const [maxCltvPct, setMaxCltvPct] = useState<number>(defaultState.maxCltvPct);
  const [desiredDrawAmount, setDesiredDrawAmount] = useState<number>(50000);
  const [helocAprPct, setHelocAprPct] = useState<number>(8.25);
  const [drawPeriodYears] = useState<number>(10);
  const [repaymentPeriodYears, setRepaymentPeriodYears] = useState<number>(20);
  const [creditCardDebtAprPct, setCreditCardDebtAprPct] = useState<number>(21.5);

  const [scenarioNote, setScenarioNote] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentStateInfo = useMemo(
    () => HELOC_STATES.find((s) => s.slug === selectedStateSlug) || defaultState,
    [selectedStateSlug, defaultState]
  );

  const handleStateChange = (newSlug: string) => {
    setSelectedStateSlug(newSlug);
    const st = HELOC_STATES.find((s) => s.slug === newSlug);
    if (st) {
      setMaxCltvPct(st.maxCltvPct);
      setHomeMarketValue(st.medianHomeValue);
      setFirstMortgageBalance(Math.round(st.medianHomeValue * 0.55));
    }
  };

  const result = useMemo(
    () =>
      calculateHeloc({
        homeMarketValue,
        firstMortgageBalance,
        maxCltvPct,
        desiredDrawAmount,
        helocAprPct,
        drawPeriodYears,
        repaymentPeriodYears,
        creditCardDebtAprPct,
      }),
    [
      homeMarketValue,
      firstMortgageBalance,
      maxCltvPct,
      desiredDrawAmount,
      helocAprPct,
      drawPeriodYears,
      repaymentPeriodYears,
      creditCardDebtAprPct,
    ]
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const res = await saveHelocScenario({
      state_slug: selectedStateSlug,
      home_value: homeMarketValue,
      mortgage_balance: firstMortgageBalance,
      max_cltv_pct: maxCltvPct,
      max_heloc_limit: result.maxHelocCreditLine,
      draw_amount: result.actualDrawUsed,
      interest_only_payment: result.drawPeriodInterestOnlyMo,
      repayment_monthly: result.repaymentPeriodMonthly,
      note: scenarioNote,
    });
    setIsSaving(false);
    if (res.success) {
      setSaveMessage('HELOC scenario encrypted & saved!');
      setScenarioNote('');
    } else {
      setSaveMessage('Saved locally to browser.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              2026 Home Equity CLTV &amp; Property Tax Rules
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              HELOC Borrowing Limit &amp; Monthly Payment Calculator
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500">Selected State Equity Rules</div>
            <Link
              to={`/heloc-state/${currentStateInfo.slug}`}
              className="text-sm font-bold text-blue-600 underline hover:text-blue-800"
            >
              {currentStateInfo.name} (Max {currentStateInfo.maxCltvPct}% CLTV |{' '}
              {currentStateInfo.propertyTaxRatePct}% Prop Tax) &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 왼쪽 입력 폼 (7칸) */}
          <div className="space-y-5 lg:col-span-7">
            {/* 1. 주 선택 */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-800">
                1. Select Your State (Loads State Max CLTV Cap &amp; Median Home Value)
              </label>
              <select
                value={selectedStateSlug}
                onChange={(e) => handleStateChange(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
              >
                {HELOC_STATES.map((st) => (
                  <option key={st.slug} value={st.slug}>
                    {st.name} ({st.abbr}) — Max {st.maxCltvPct}% CLTV | Avg Prop Tax:{' '}
                    {st.propertyTaxRatePct}%
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-600">
                <strong>{currentStateInfo.name} Note:</strong> {currentStateInfo.helocRuleNote}
              </p>
            </div>

            {/* 2. 현재 주택 가치 및 1순위 모기지 잔액 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Estimated Home Market Value ($)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  value={homeMarketValue}
                  onChange={(e) => setHomeMarketValue(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Current 1st Mortgage Balance ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={firstMortgageBalance}
                  onChange={(e) => setFirstMortgageBalance(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* 3. 최대 CLTV 한도 비율 및 희망 인출 금액 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Lender Max Combined LTV (CLTV %)
                </label>
                <div className="mt-1 grid grid-cols-4 gap-1.5">
                  {[75, 80, 85, 90].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMaxCltvPct(pct)}
                      className={`rounded-lg border py-2 text-xs font-bold transition ${
                        maxCltvPct === pct
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Desired HELOC Draw Amount ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={2500}
                  value={desiredDrawAmount}
                  onChange={(e) => setDesiredDrawAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* 4. HELOC 금리, 상환 기간, 카드 대환 비교 금리 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  HELOC Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.1}
                  value={helocAprPct}
                  onChange={(e) => setHelocAprPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Repayment Term (Years)
                </label>
                <select
                  value={repaymentPeriodYears}
                  onChange={(e) => setRepaymentPeriodYears(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                >
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Compare vs Credit Card APR (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={35}
                  step={0.5}
                  value={creditCardDebtAprPct}
                  onChange={(e) => setCreditCardDebtAprPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 오른쪽 실시간 결과 영역 (5칸) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Maximum Borrowable HELOC Credit Line
                </div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                  {usd(result.maxHelocCreditLine)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Total Home Equity: <strong>{usd(result.totalHomeEquity)}</strong> (1st Mortgage
                  LTV: {result.currentLtvPct.toFixed(1)}%)
                </div>
              </div>

              {/* 거치 기간 vs 상환 기간 월 납입금 비교 */}
              <div className="rounded-xl bg-slate-800/90 p-4 space-y-2.5 text-xs">
                <div className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-700 pb-1.5">
                  Monthly Payment on {usd(result.actualDrawUsed)} Draw
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">
                    Years 1–{drawPeriodYears} (Interest-Only Draw):
                  </span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {usd(result.drawPeriodInterestOnlyMo)} / mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">
                    Next {repaymentPeriodYears} Yrs (Principal + Interest):
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    {usd(result.repaymentPeriodMonthly)} / mo
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2">
                  <span className="text-slate-400">Remaining Unused Credit Line:</span>
                  <span className="font-semibold text-white">
                    {usd(result.remainingAvailableLine)}
                  </span>
                </div>
              </div>

              {/* 고금리 부채 통합(Debt Consolidation) 절감 효과 */}
              {result.annualInterestSavedVsCard > 0 && (
                <div className="rounded-xl bg-emerald-950/60 border border-emerald-700/60 p-3.5 text-xs space-y-1">
                  <div className="font-bold text-emerald-300 uppercase tracking-wider">
                    Debt Consolidation Savings
                  </div>
                  <p className="text-slate-300">
                    Paying off {usd(result.actualDrawUsed)} of {creditCardDebtAprPct}% credit card
                    debt with an {helocAprPct}% HELOC saves approximately{' '}
                    <strong className="text-white text-sm">
                      {usd(result.annualInterestSavedVsCard)} / year
                    </strong>{' '}
                    in interest!
                  </p>
                </div>
              )}
            </div>

            {/* Supabase 암호화 저장 */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <label className="block text-[11px] font-medium text-slate-400">
                Save HELOC Scenario (Client-Side AES-256 Encrypted)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Kitchen Remodel $50k Draw"
                  value={scenarioNote}
                  onChange={(e) => setScenarioNote(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              {saveMessage && (
                <p className="mt-1.5 text-[11px] font-medium text-emerald-400">{saveMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
