// Lightweight GA4 wrapper. No-ops when no measurement ID is configured.

let initialized = false;
let measurementId = null;
let lastPath = null;
let lastTs = 0;

export function initAnalytics(id) {
  if (!id || initialized) return;
  measurementId = id;
  // Inject gtag script
  const existing = document.querySelector(`script[src^="https://www.googletagmanager.com/gtag/js"]`);
  if (!existing) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }
  // Init dataLayer and config
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  // expose for debugging
  // eslint-disable-next-line no-undef
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  // Disable auto page_view to control SPA page views manually
  window.gtag('config', id, { send_page_view: false });
  initialized = true;
}

export function trackPageView(path) {
  if (!initialized || !measurementId || typeof window.gtag !== 'function') return;
  const now = Date.now();
  // Simple de-dupe: avoid duplicate pageviews for the same path within 1500ms (helps with StrictMode double-invoke in dev)
  if (path === lastPath && (now - lastTs) < 1500) return;
  lastPath = path; lastTs = now;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
  });
}

export function trackEvent(action, params = {}) {
  if (!initialized || !measurementId || typeof window.gtag !== 'function') return;
  window.gtag('event', action, params);
}

export function isAnalyticsEnabled() {
  return initialized && !!measurementId;
}
