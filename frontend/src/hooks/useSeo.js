import { useEffect } from 'react';

/**
 * Lightweight SEO hook — no dependencies.
 * Sets <title>, meta description, canonical link, Open Graph and Twitter tags.
 * Also emits a `robots` meta override (useful for noindexing auth pages).
 *
 * Usage: useSeo({ title, description, path, image, noIndex });
 * - `path` is a route path like "/services" (leading slash). Canonical will be
 *   `${window.location.origin}${path}`. Pass null to skip canonical.
 */
export default function useSeo({
  title,
  description,
  path,
  image,
  noIndex = false,
  type = 'website',
}) {
  useEffect(() => {
    const origin = (typeof window !== 'undefined' && window.location.origin) || '';
    const canonical = path ? `${origin}${path}` : null;
    const absImage = image
      ? (/^https?:\/\//i.test(image) ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
      : `${origin}/logo-horizontal.png`;

    if (title) document.title = title;

    const setMeta = (selector, attrs) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs.identify || {}).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
      }
      if (attrs.content != null) el.setAttribute('content', attrs.content);
    };

    if (description) {
      setMeta('meta[name="description"]', { identify: { name: 'description' }, content: description });
      setMeta('meta[property="og:description"]', { identify: { property: 'og:description' }, content: description });
      setMeta('meta[name="twitter:description"]', { identify: { name: 'twitter:description' }, content: description });
    }
    if (title) {
      setMeta('meta[property="og:title"]', { identify: { property: 'og:title' }, content: title });
      setMeta('meta[name="twitter:title"]', { identify: { name: 'twitter:title' }, content: title });
    }
    setMeta('meta[property="og:type"]', { identify: { property: 'og:type' }, content: type });
    setMeta('meta[property="og:image"]', { identify: { property: 'og:image' }, content: absImage });
    setMeta('meta[name="twitter:image"]', { identify: { name: 'twitter:image' }, content: absImage });
    setMeta('meta[name="twitter:card"]', { identify: { name: 'twitter:card' }, content: 'summary_large_image' });

    if (canonical) {
      setMeta('meta[property="og:url"]', { identify: { property: 'og:url' }, content: canonical });
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    setMeta('meta[name="robots"]', {
      identify: { name: 'robots' },
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
  }, [title, description, path, image, noIndex, type]);
}
