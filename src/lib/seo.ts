import { useEffect } from 'react';

// =========================================================================
// 동적 검색엔진 최적화(SEO) 유틸리티 (HelocTaxSmart)
// =========================================================================

export const SITE_ORIGIN = 'https://heloc.bangjang.net';
export const SITE_NAME = 'HelocTaxSmart';

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
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
  }, [title, description, path]);
}

