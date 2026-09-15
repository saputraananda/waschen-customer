/**
 * Status journey & copy ramah pelanggan untuk Waschen Customer tracking.
 */

export const STATUS_PERCENT = {
  Antrean: 10,
  Pencucian: 25,
  Penyetrikaan: 50,
  Pengemasan: 75,
  'Siap Diambil': 90,
  'Siap Diantar': 90,
  'Sedang Diantar': 95,
  Selesai: 100,
  Dibatalkan: 0,
};

/** Label singkat di chip / timeline */
export const CUSTOMER_LABEL = {
  Antrean: 'Diterima',
  Pencucian: 'Dicuci',
  Penyetrikaan: 'Disetrika',
  Pengemasan: 'Dikemas',
  'Siap Diambil': 'Siap diambil',
  'Siap Diantar': 'Siap diantar',
  'Sedang Diantar': 'Sedang diantar',
  Selesai: 'Selesai',
  Dibatalkan: 'Dibatalkan',
};

/** Kalimat penjelasan di kartu hero */
export const CUSTOMER_MESSAGE = {
  Antrean: 'Cucian Anda sudah kami terima dan masuk antrean.',
  Pencucian: 'Tim kami sedang mencuci cucian Anda dengan teliti.',
  Penyetrikaan: 'Cucian sedang dalam proses penyetrikaan.',
  Pengemasan: 'Cucian sedang dikemas rapi sebelum siap diambil/diantar.',
  'Siap Diambil': 'Cucian siap! Silakan ambil di outlet Waschen.',
  'Siap Diantar': 'Cucian siap diantar. Menunggu kurir berangkat.',
  'Sedang Diantar': 'Kurir sedang mengantar cucian ke alamat Anda.',
  Selesai: 'Cucian sudah selesai dan diterima. Terima kasih!',
  Dibatalkan: 'Nota ini dibatalkan. Hubungi outlet jika ada pertanyaan.',
};

export const PICKUP_STEPS = [
  'Antrean',
  'Pencucian',
  'Penyetrikaan',
  'Pengemasan',
  'Siap Diambil',
  'Selesai',
];

export const DELIVERY_STEPS = [
  'Antrean',
  'Pencucian',
  'Penyetrikaan',
  'Pengemasan',
  'Siap Diantar',
  'Sedang Diantar',
  'Selesai',
];

export function normalizeStatus(name) {
  const s = String(name || '').trim();
  if (s === 'Delivery' || s === 'Delivery_Kurir') return 'Sedang Diantar';
  return s || 'Antrean';
}

export function customerLabel(name) {
  const key = normalizeStatus(name);
  return CUSTOMER_LABEL[key] || key;
}

export function customerMessage(name) {
  const key = normalizeStatus(name);
  return CUSTOMER_MESSAGE[key] || 'Progres cucian Anda sedang diperbarui.';
}

export function statusPercent(name) {
  const key = normalizeStatus(name);
  return STATUS_PERCENT[key] ?? 0;
}

/**
 * Bangun langkah journey sesuai tipe pengambilan.
 * @param {'pickup'|'delivery'} journey
 * @param {Array<{name:string,label?:string,percentage?:number}>} [master]
 */
export function buildJourneySteps(journey, master = []) {
  const names = journey === 'delivery' ? DELIVERY_STEPS : PICKUP_STEPS;
  const masterMap = Object.fromEntries(
    (master || []).map((s) => [s.name, s])
  );
  return names.map((name) => ({
    name,
    label: CUSTOMER_LABEL[name] || masterMap[name]?.label || name,
    percentage: Number(masterMap[name]?.percentage) || STATUS_PERCENT[name] || 0,
    hint: CUSTOMER_MESSAGE[name] || '',
  }));
}

export function getStepIndex(steps, statusName) {
  const key = normalizeStatus(statusName);
  return steps.findIndex((s) => s.name === key);
}
