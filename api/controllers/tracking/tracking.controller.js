import { myWaschenPool } from '../../db/pool.js';
import { accessCodesMatch, normalizeAccessCode } from '../../utils/accessCode.js';

/**
 * Pelacakan nota untuk PELANGGAN (publik, tanpa login).
 * Detail nota HANYA dikirim jika kode akses 4 digit cocok.
 */

const MAX_KEY_LENGTH = 60;

/** Ambil nomor nota dari hasil scan QR/barcode (QR nota POS berisi URL ?trackingNo=). */
const extractOrderNo = (raw) => {
  const text = String(raw || '').trim();
  if (!text) return '';

  const qsMatch = text.match(
    /[?&#](?:trackingNo|tracking_no|orderNo|order_no|nota|barcode)=([^&#\s]+)/i
  );
  if (qsMatch?.[1]) {
    try {
      return decodeURIComponent(qsMatch[1]).trim();
    } catch {
      return qsMatch[1].trim();
    }
  }

  const wlMatch = text.match(/\bWL[A-Z]{0,4}\d{8,}\b/i);
  if (wlMatch) return wlMatch[0].toUpperCase();

  const wsMatch = text.match(/WS-\d+/i);
  if (wsMatch) return wsMatch[0].toUpperCase();

  return text;
};

/** Bersihkan catatan teknis QC agar ramah pelanggan */
const sanitizeLogNotes = (notes) => {
  const raw = String(notes || '').trim();
  if (!raw) return null;
  const m = raw.match(/^\[\w+\]\s*QC\s+\w+\s*[—–-]\s*\w+(?:\s*:\s*(.+))?$/i);
  if (m) return m[1]?.trim() || null;
  if (/^\[(\w+)\]/.test(raw)) return null;
  return raw;
};

const loadTrackingPayload = async (trx) => {
  const [items] = await myWaschenPool.query(
    `SELECT id, service_name, qty, unit, item_work_status, item_completed_at, fulfillment_type
     FROM tr_transaction_detail
     WHERE transaction_id = ?
     ORDER BY id ASC`,
    [trx.id]
  );

  const [logs] = await myWaschenPool.query(
    `SELECT status, notes, created_at
     FROM tr_transaction_status_log
     WHERE transaction_id = ?
     ORDER BY created_at ASC, id ASC`,
    [trx.id]
  );

  const hasDeliveryItem = (items || []).some(
    (it) => it.fulfillment_type === 'Delivery_Kurir' && it.item_work_status !== 'Dibatalkan'
  );
  const isDelivery = Number(trx.is_delivery) === 1 || hasDeliveryItem;

  const { id, access_code, ...safeTrx } = trx;

  return {
    ...safeTrx,
    work_status: Number(trx.work_status) || 0,
    is_delivery: isDelivery ? 1 : 0,
    journey: isDelivery ? 'delivery' : 'pickup',
    items: (items || []).map(({ fulfillment_type, ...rest }) => ({
      ...rest,
      fulfillment_type: fulfillment_type || (isDelivery ? 'Delivery_Kurir' : 'Ambil_Di_Outlet'),
      is_delivery_item: fulfillment_type === 'Delivery_Kurir' || (!fulfillment_type && isDelivery),
    })),
    logs: (logs || []).map((l) => ({
      status: l.status,
      notes: sanitizeLogNotes(l.notes),
      created_at: l.created_at,
    })),
  };
};

const findTransaction = async (key) => {
  try {
    const [rows] = await myWaschenPool.query(
      `SELECT
          t.id,
          t.order_no,
          t.order_category,
          t.total_weight_kg,
          t.total_pcs,
          t.speed_name,
          t.parfume_name,
          t.grand_total,
          t.payment_status,
          t.work_status,
          t.is_delivery,
          t.order_date,
          t.estimated_finished_at,
          t.picked_up_at,
          t.access_code,
          c.name          AS customer_name,
          o.full_name     AS outlet_name
       FROM tr_transaction t
       LEFT JOIN mst_customer c ON c.id = t.customer_id
       LEFT JOIN mst_outlet   o ON o.id = t.outlet_id
       WHERE t.order_no = ? OR t.barcode = ?
       ORDER BY CASE WHEN t.order_no = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [key, key, key]
    );
    return rows[0] || null;
  } catch (err) {
    if (!/Unknown column.*access_code/i.test(err.message || '')) throw err;
    const [rows] = await myWaschenPool.query(
      `SELECT
          t.id,
          t.order_no,
          t.order_category,
          t.total_weight_kg,
          t.total_pcs,
          t.speed_name,
          t.parfume_name,
          t.grand_total,
          t.payment_status,
          t.work_status,
          t.is_delivery,
          t.order_date,
          t.estimated_finished_at,
          t.picked_up_at,
          c.name          AS customer_name,
          o.full_name     AS outlet_name
       FROM tr_transaction t
       LEFT JOIN mst_customer c ON c.id = t.customer_id
       LEFT JOIN mst_outlet   o ON o.id = t.outlet_id
       WHERE t.order_no = ? OR t.barcode = ?
       ORDER BY CASE WHEN t.order_no = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [key, key, key]
    );
    return rows[0] ? { ...rows[0], access_code: null } : null;
  }
};

/**
 * GET /api/tracking/:orderNo
 * Wajib ?code=XXXX — tanpa kode, detail tidak dikirim.
 */
export const trackOrder = async (req, res) => {
  const key = extractOrderNo(req.params.orderNo);
  const code = normalizeAccessCode(req.query.code || req.headers['x-access-code']);

  if (!key || key.length > MAX_KEY_LENGTH) {
    return res.status(400).json({ success: false, message: 'Nomor nota tidak valid.' });
  }

  if (!code) {
    return res.status(401).json({
      success: false,
      needsAccessCode: true,
      message: 'Masukkan kode akses 4 digit dari nota digital WhatsApp Anda.',
    });
  }

  try {
    const trx = await findTransaction(key);
    if (!trx) {
      return res.status(404).json({ success: false, message: `Nota "${key}" tidak ditemukan.` });
    }

    if (!trx.access_code) {
      return res.status(503).json({
        success: false,
        message: 'Nota ini belum memiliki kode akses. Minta kasir kirim ulang nota digital.',
      });
    }

    if (!accessCodesMatch(trx.access_code, code)) {
      return res.status(403).json({
        success: false,
        message: 'Kode akses salah. Cek kembali pesan WhatsApp nota digital Anda.',
      });
    }

    const data = await loadTrackingPayload(trx);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[tracking] trackOrder error:', err);
    if (err?.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        success: false,
        message: 'Skema database belum lengkap. Hubungi outlet Waschen.',
      });
    }
    return res.status(500).json({ success: false, message: 'Gagal memuat data nota.' });
  }
};

/** Daftar tahapan pengerjaan untuk stepper di UI. */
export const getWorkStatuses = async (_req, res) => {
  try {
    const [rows] = await myWaschenPool.query(
      `SELECT name, label, description, percentage
       FROM mst_work_status
       WHERE is_active = 1
         AND name IN (
           'Antrean','Pencucian','Penyetrikaan','Pengemasan',
           'Siap Diambil','Siap Diantar','Sedang Diantar','Selesai'
         )
       ORDER BY percentage ASC, id ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[tracking] getWorkStatuses error:', err);
    return res.status(500).json({ success: false, message: 'Gagal memuat tahapan pengerjaan.' });
  }
};
