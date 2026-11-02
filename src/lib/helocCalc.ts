// =========================================================================
// 미국 HELOC(주택담보 마이너스통장) 한도(CLTV), 거치/상환 월 납입금,
// 고금리 카드빚 대환 절감액, 재산세 이의신청(Property Tax Appeal) 절세 계산 엔진
// =========================================================================

export interface HelocInput {
  homeMarketValue: number;        // 현재 주택 시세 ($)
  firstMortgageBalance: number;   // 현재 남은 1순위 모기지 대출 잔액 ($)
  maxCltvPct: number;             // 금융기관 최대 합산 담보인정비율 (CLTV %, 80 / 85 / 90)
  desiredDrawAmount: number;      // 실제로 인출해서 사용할 금액 ($)
  helocAprPct: number;            // HELOC 연 이자율 (%)
  drawPeriodYears: number;        // 이자만 내는 거치/인출 기간 (보통 10년)
  repaymentPeriodYears: number;   // 원리금 균등 상환 기간 (보통 20년)
  creditCardDebtAprPct: number;   // 대환 비교용 기존 고금리 카드/개인대출 금리 (예: 21.5%)
}

export interface HelocResult {
  totalHomeEquity: number;         // 현재 순수 주택 자본 (집값 - 모기지 잔액, $)
  currentLtvPct: number;           // 현재 1순위 모기지 LTV 비율 (%)
  maxTotalDebtAllowed: number;     // CLTV 한도 기준 총 대출 가능 상한액 ($)
  maxHelocCreditLine: number;      // 개설 가능한 최대 HELOC 한도 ($)
  actualDrawUsed: number;          // 한도 내에서 실제 인출한 금액 ($)
  remainingAvailableLine: number;  // 인출 후 남은 마이너스통장 여유 한도 ($)
  drawPeriodInterestOnlyMo: number;// 거치 기간(Draw Period) 월 이자 납입액 ($)
  repaymentPeriodMonthly: number;  // 상환 기간(Repayment Period) 월 원리금 상환액 ($)
  totalRepaymentInterest: number;  // 상환 기간 동안 발생하는 총 이자 ($)
  annualInterestSavedVsCard: number;// 고금리 카드빚 대환 시 연간 이자 절감액 ($)
}

export function calculateHeloc(input: HelocInput): HelocResult {
  const homeVal = Math.max(0, input.homeMarketValue);
  const mortBal = Math.max(0, input.firstMortgageBalance);
  const cltv = Math.max(50, Math.min(100, input.maxCltvPct)) / 100;

  const totalHomeEquity = Math.max(0, homeVal - mortBal);
  const currentLtvPct = homeVal > 0 ? (mortBal / homeVal) * 100 : 0;

  const maxTotalDebtAllowed = homeVal * cltv;
  const maxHelocCreditLine = Math.max(0, maxTotalDebtAllowed - mortBal);

  const actualDrawUsed = Math.min(maxHelocCreditLine, Math.max(0, input.desiredDrawAmount));
  const remainingAvailableLine = Math.max(0, maxHelocCreditLine - actualDrawUsed);

  const apr = Math.max(0, input.helocAprPct);
  const monthlyRate = apr / 100 / 12;

  // 1. 거치 기간(Draw Period): 사용한 금액에 대해서만 매달 이자만 납부 (Interest-Only)
  const drawPeriodInterestOnlyMo = actualDrawUsed * monthlyRate;

  // 2. 상환 기간(Repayment Period): 남은 잔액을 원리금 균등분할 상환
  const repayMonths = Math.max(12, Math.round(input.repaymentPeriodYears * 12));
  let repaymentPeriodMonthly = 0;

  if (actualDrawUsed <= 0) {
    repaymentPeriodMonthly = 0;
  } else if (monthlyRate === 0) {
    repaymentPeriodMonthly = actualDrawUsed / repayMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, repayMonths);
    repaymentPeriodMonthly = (actualDrawUsed * (monthlyRate * factor)) / (factor - 1);
  }

  const totalRepaymentInterest = Math.max(
    0,
    repaymentPeriodMonthly * repayMonths - actualDrawUsed
  );

  // 3. 고금리 카드론/신용카드 대환 시 연간 이자 절약액
  const cardApr = Math.max(0, input.creditCardDebtAprPct);
  const annualInterestSavedVsCard = Math.max(
    0,
    actualDrawUsed * ((cardApr - apr) / 100)
  );

  return {
    totalHomeEquity,
    currentLtvPct,
    maxTotalDebtAllowed,
    maxHelocCreditLine,
    actualDrawUsed,
    remainingAvailableLine,
    drawPeriodInterestOnlyMo,
    repaymentPeriodMonthly,
    totalRepaymentInterest,
    annualInterestSavedVsCard,
  };
}

// =========================================================================
// 미국 재산세 이의신청(Property Tax Appeal) & Homestead 공제 절세 계산기
// =========================================================================
export interface PropertyTaxAppealInput {
  countyAssessedValue: number;      // 카운티 과세당국이 통보한 공시지가 ($)
  comparableFairMarketValue: number;// 주변 실거래가(Comps) 기준 적정 시세 ($)
  homesteadExemptionAmount: number; // 주/카운티 자가거주 공제액 (Homestead Exemption, $)
  effectivePropertyTaxRatePct: number; // 해당 지역 실효 재산세율 (%)
  appealServiceContingencyPct: number; // 이의신청 대행업체 성공보수 비율 (직접 신청 시 0%, 보통 25%~40%)
}

export interface PropertyTaxAppealResult {
  currentTaxableValue: number;
  proposedTaxableValue: number;
  valuationReduction: number;
  currentAnnualPropertyTax: number;
  proposedAnnualPropertyTax: number;
  grossAnnualTaxSavings: number;
  contingencyFeeCost: number;
  netFirstYearSavings: number;
  fiveYearCumulativeSavings: number;
}

export function calculatePropertyTaxAppeal(
  input: PropertyTaxAppealInput
): PropertyTaxAppealResult {
  const assessed = Math.max(0, input.countyAssessedValue);
  const fairVal = Math.max(0, input.comparableFairMarketValue);
  const homestead = Math.max(0, input.homesteadExemptionAmount);
  const rate = Math.max(0, input.effectivePropertyTaxRatePct) / 100;
  const feePct = Math.max(0, Math.min(100, input.appealServiceContingencyPct)) / 100;

  const currentTaxableValue = Math.max(0, assessed - homestead);
  const proposedTaxableValue = Math.max(0, Math.min(assessed, fairVal) - homestead);
  const valuationReduction = Math.max(0, currentTaxableValue - proposedTaxableValue);

  const currentAnnualPropertyTax = currentTaxableValue * rate;
  const proposedAnnualPropertyTax = proposedTaxableValue * rate;
  const grossAnnualTaxSavings = Math.max(0, currentAnnualPropertyTax - proposedAnnualPropertyTax);

  const contingencyFeeCost = grossAnnualTaxSavings * feePct;
  const netFirstYearSavings = Math.max(0, grossAnnualTaxSavings - contingencyFeeCost);
  const fiveYearCumulativeSavings = netFirstYearSavings + grossAnnualTaxSavings * 4;

  return {
    currentTaxableValue,
    proposedTaxableValue,
    valuationReduction,
    currentAnnualPropertyTax,
    proposedAnnualPropertyTax,
    grossAnnualTaxSavings,
    contingencyFeeCost,
    netFirstYearSavings,
    fiveYearCumulativeSavings,
  };
}

