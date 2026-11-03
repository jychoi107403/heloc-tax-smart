import { useEffect } from 'react';

// =========================================================================
// 동적 검색엔진 최적화(SEO) & GA4 페이지뷰 자동 추적 유틸리티
// - 외부 무거운 라이브러리 없이 브라우저의 <title>, <meta name="description">,
//   <link rel="canonical">, Open Graph 태그를 페이지마다 안전하게 변경하고,
//   SPA 라우트 변경 시 Google Analytics 4 (gtag) 이벤트를 자동 전송합니다.
// =========================================================================

export const SITE_ORIGIN = 'https://heloc.bangjang.net';
export const SITE_NAME = 'HelocTaxSmart';

export interface PageSeoInput {
  title: string;       // 브라우저 탭 및 검색 결과 제목
  description: string; // 검색 결과 요약 설명문
  path: string;        // 현재 페이지 경로 (예: "/state/new-jersey")
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonicalLink(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function usePageSeo({ title, description, path }: PageSeoInput) {
  useEffect(() => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath}`;

    document.title = title;

    setMetaTag('name', 'title', title);
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'twitter:title', title);
    setMetaTag('property', 'twitter:description', description);

    setCanonicalLink(canonicalUrl);

    // GA4 페이지 이동(SPA 라우팅) 이벤트 전송
    if (typeof window !== 'undefined' && typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === 'function') {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'page_view', {
        page_title: title,
        page_location: canonicalUrl,
        page_path: cleanPath,
      });
    }
  }, [title, description, path]);
}
