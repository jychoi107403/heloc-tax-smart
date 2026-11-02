import { usePageSeo } from '../lib/seo';

// =========================================================================
// 개인정보처리방침 페이지 (/privacy) - Google AdSense 필수 요구사항 준수
// =========================================================================

export default function PrivacyPage() {
  usePageSeo({
    title: 'Privacy Policy | HelocTaxSmart',
    description:
      'Privacy Policy for HelocTaxSmart. Learn how we protect your homeowner financial data with client-side browser calculations, AES-256 encryption, and cookie disclosures.',
    path: '/privacy',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p>
        At <strong>HelocTaxSmart</strong>, your financial privacy is protected by design. All home
        equity, HELOC payment, and property tax appeal calculations run locally inside your web
        browser.
      </p>
      <h2 className="text-lg font-bold text-slate-900 pt-2">Client-Side Encryption</h2>
      <p>
        When you save a custom HELOC scenario note, your note is encrypted in your browser using
        the Web Crypto API (AES-256-GCM / SHA-256) prior to storage.
      </p>
      <h2 className="text-lg font-bold text-slate-900 pt-2">
        Cookies &amp; Google AdSense Advertising
      </h2>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
        prior visits to this website or other websites. Users may opt out of personalized
        advertising by visiting{' '}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google Ads Settings
        </a>
        .
      </p>
    </div>
  );
}

