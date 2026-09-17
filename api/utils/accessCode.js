import crypto from 'crypto';

export function normalizeAccessCode(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length !== 4) return '';
  return digits;
}

export function accessCodesMatch(stored, input) {
  const a = normalizeAccessCode(stored);
  const b = normalizeAccessCode(input);
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}
