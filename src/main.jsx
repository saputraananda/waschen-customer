import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { initPwaInstallCapture } from './utils/pwaInstall.js';
import './index.css';

initPwaInstallCapture();

const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_TS_KEY = 'waschen_customer_cache_at';

function refreshIfCacheExpired() {
  if (document.visibilityState !== 'visible') return;
  const now = Date.now();
  const last = Number(localStorage.getItem(CACHE_TS_KEY) || 0);
  if (last > 0 && now - last >= CACHE_TTL_MS) {
    localStorage.setItem(CACHE_TS_KEY, String(now));
    window.location.reload();
    return;
  }
  if (!last) localStorage.setItem(CACHE_TS_KEY, String(now));
}

// iOS PWA standalone tidak reload saat resume dari background -> update SW tak pernah terdeteksi.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (reg) reg.update();
      refreshIfCacheExpired();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    setInterval(() => { if (reg) reg.update(); }, CACHE_TTL_MS);
    refreshIfCacheExpired();
  },
  onNeedRefresh() { updateSW(true); },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
