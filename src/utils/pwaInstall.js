/**
 * PWA install prompt capture.
 * beforeinstallprompt bisa fire sebelum komponen mount, jadi disimpan global.
 */

let deferredPrompt = null;
const subscribers = new Set();

const notify = () => subscribers.forEach((fn) => fn(deferredPrompt));

export function isPwaStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  );
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || (/macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function initPwaInstallCapture() {
  if (typeof window === 'undefined' || window.__waschenPwaInstallReady) return;
  window.__waschenPwaInstallReady = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null;
  notify();
}

export function subscribePwaInstall(fn) {
  subscribers.add(fn);
  fn(deferredPrompt);
  return () => subscribers.delete(fn);
}
