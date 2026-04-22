import { useEffect } from 'react';

/**
 * Inject JSON-LD structured data into <head> with auto-cleanup.
 * Pass a stable `id` per logical schema (e.g. "faq-how-it-works").
 * Passing `data = null` removes the script (useful on unmount / guard).
 */
export default function useJsonLd(id, data) {
  useEffect(() => {
    if (!id) return undefined;
    if (data == null) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      return undefined;
    }
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    try {
      script.textContent = JSON.stringify(data);
    } catch {
      /* ignore circular refs */
    }
    return () => {
      const s = document.getElementById(id);
      if (s) s.remove();
    };
  }, [id, JSON.stringify(data)]); // eslint-disable-line react-hooks/exhaustive-deps
}
