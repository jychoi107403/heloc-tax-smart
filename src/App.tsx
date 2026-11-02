import { Link, Route, Routes } from 'react-router-dom';
import HelocCalculator from './components/HelocCalculator';
import { SisterSitesTopBar, SisterSitesFooterHub } from './components/SisterSitesBar';
import StateIndex from './pages/StateIndex';
import StateHelocPage from './pages/StateHelocPage';
import PropertyTaxAppealPage from './pages/PropertyTaxAppealPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { HELOC_STATES } from './data/helocStates';
import { usePageSeo } from './lib/seo';

// =========================================================================
// 홈 화면 컴포넌트 (SEO 메타태그 + 메인 HELOC 계산기 + 51개 주 빠른 이동 그리드)
// =========================================================================
function HomePage() {
  usePageSeo({
    title: 'HELOC Borrowing Limit & Property Tax Appeal Calculator 2026 | HelocTaxSmart',
    description:
      'Free US HELOC borrowing limit (CLTV), interest-only draw vs. repayment payment, and property tax appeal savings calculator across all 50 states and DC.',
    path: '/',
  });

  return (
    <div className="space-y-8">
      <HelocCalculator />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              HELOC Borrowing Limit &amp; Property Tax Calculator by State
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Click your state to load 2026 state CLTV limits, median home values, homestead
              exemptions, and effective property tax rates:
            </p>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <Link to="/heloc-state" className="text-blue-600 underline">
              Compare All 50 States &rarr;
            </Link>
            <Link to="/property-tax-appeal" className="text-emerald-700 underline">
              Property Tax Appeal Calculator &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 text-xs">
          {HELOC_STATES.map((st) => (
            <Link
              key={st.slug}
              to={`/heloc-state/${st.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-800 hover:border-blue-500 hover:bg-white hover:text-blue-600"
            >
              <span>
                {st.name} ({st.abbr})
              </span>
              <span className="font-bold text-slate-600">{st.propertyTaxRatePct}% Tax</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 전체 앱 레이아웃 (상단 7개 자매 사이트 네트워크 바 + 헤더 + 라우터 + 하단 푸터 허브)
// =========================================================================
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 최상단 7개 자매 사이트 상호 이동 네트워크 바 */}
      <SisterSitesTopBar currentSiteId="heloc-tax-smart" />

      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-blue-600">
            🔑 HelocTax<span className="text-slate-900">Smart</span>
          </Link>
          <nav className="flex flex-wrap gap-5 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-blue-600">
              HELOC Limit Calculator
            </Link>
            <Link to="/heloc-state" className="hover:text-blue-600">
              By State
            </Link>
            <Link to="/property-tax-appeal" className="hover:text-blue-600">
              Property Tax Appeal
            </Link>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/heloc-state" element={<StateIndex />} />
          <Route path="/heloc-state/:state" element={<StateHelocPage />} />
          <Route path="/property-tax-appeal" element={<PropertyTaxAppealPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="*"
            element={
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
                <Link to="/" className="mt-4 inline-block text-blue-600 underline">
                  Back to HELOC Calculator
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* 하단 푸터 (면책 문구 + 7개 자매 사이트 전체 링크 허브 + 법적 고지) */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-slate-500 space-y-4">
          <p>
            Disclaimer: For informational and educational purposes only. Estimates do not constitute
            financial, lending, appraisal, or legal advice. Actual HELOC credit limits, CLTV rules,
            and property tax assessments vary by lender and county jurisdiction.
          </p>

          {/* 7개 자매 사이트 전체 네트워크 허브 */}
          <SisterSitesFooterHub currentSiteId="heloc-tax-smart" />

          <div className="flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-4">
            <span>&copy; {new Date().getFullYear()} HelocTaxSmart. All rights reserved.</span>
            <nav className="flex flex-wrap gap-4 font-medium">
              <Link to="/about" className="underline hover:text-slate-800">
                About &amp; Methodology
              </Link>
              <Link to="/privacy" className="underline hover:text-slate-800">
                Privacy Policy
              </Link>
              <Link to="/terms" className="underline hover:text-slate-800">
                Terms &amp; Disclaimer
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

