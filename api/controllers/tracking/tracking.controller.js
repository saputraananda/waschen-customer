import { myWaschenPool } from '../../db/pool.js';

/**
 * Pelacakan nota untuk PELANGGAN (publik, tanpa login).
 * Hanya expose field yang aman — tanpa no. HP, alamat, saldo member,
 * bukti bayar, atau data kasir.
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
  // [handover] QC aman — lanjut : diterima satpam
  const m = raw.match(/^\[\w+\]\s*QC\s+\w+\s*[—–-]\s*\w+(?:\s*:\s*(.+))?$/i);
  if (m) return m[1]?.trim() || null;
  if (/^\[(\w+)\]/.test(raw)) return null;
  return raw;
};

export const trackOrder = async (req, res) => {
  const key = extractOrderNo(req.params.orderNo);

  if (!key || key.length > MAX_KEY_LENGTH) {
    return res.status(400).json({ success: false, message: 'Nomor nota tidak valid.' });
  }

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

    const trx = rows[0];
    if (!trx) {
      return res.status(404).json({ success: false, message: `Nota "${key}" tidak ditemukan.` });
    }

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

    const { id, ...safeTrx } = trx;

    return res.json({
      success: true,
      data: {
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
      },
    });
  } catch (err) {
    console.error('[tracking] trackOrder error:', err);
    // Fallback jika kolom fulfillment_type belum ada
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
