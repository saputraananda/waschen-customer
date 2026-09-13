import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, AlertCircle } from 'lucide-react';

const SCANNER_ELEMENT_ID = 'waschen-customer-scanner';

/**
 * Ambil nomor nota dari hasil scan.
 * QR nota POS berisi URL: `{origin}/dashboard?trackingNo=WLCG202608310001`
 */
export function extractOrderNo(raw) {
    const text = String(raw || '').trim();
    if (!text) return '';

    try {
        const url = new URL(text);
        const tracking =
            url.searchParams.get('trackingNo') ||
            url.searchParams.get('tracking_no') ||
            url.searchParams.get('orderNo') ||
            url.searchParams.get('order_no') ||
            url.searchParams.get('nota') ||
            url.searchParams.get('barcode');
        if (tracking) return decodeURIComponent(tracking).trim();
    } catch {
        // bukan URL absolut
    }

    const qsMatch = text.match(/[?&#](?:trackingNo|tracking_no|orderNo|order_no|nota|barcode)=([^&#]+)/i);
    if (qsMatch?.[1]) {
        try { return decodeURIComponent(qsMatch[1]).trim(); } catch { return qsMatch[1].trim(); }
    }

    const wlMatch = text.match(/\bWL[A-Z]{0,4}\d{8,}\b/i);
    if (wlMatch) return wlMatch[0].toUpperCase();

    const wsMatch = text.match(/WS-\d+/i);
    if (wsMatch) return wsMatch[0].toUpperCase();

    return text;
}

export default function NotaScanner({ isOpen, onClose, onDetected }) {
    const scannerRef = useRef(null);
    const handledRef = useRef(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return undefined;

        let cancelled = false;
        handledRef.current = false;
        setError('');

        const start = async () => {
            await new Promise((r) => setTimeout(r, 200));
            if (cancelled) return;

            const el = document.getElementById(SCANNER_ELEMENT_ID);
            if (el) el.innerHTML = '';

            const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                verbose: false,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.EAN_13,
                ],
            });
            scannerRef.current = scanner;

            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 12,
                        qrbox: (viewW, viewH) => {
                            const side = Math.floor(Math.min(viewW, viewH) * 0.72);
                            return { width: Math.max(180, side), height: Math.max(180, side) };
                        },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (cancelled || handledRef.current) return;
                        const orderNo = extractOrderNo(decodedText);
                        if (!orderNo) return;
                        handledRef.current = true;
                        onDetected(orderNo);
                    },
                    () => { }
                );
            } catch (err) {
                console.error('Scanner error:', err);
                scannerRef.current = null;
                if (cancelled) return;
                setError(
                    String(err?.message || '').includes('NotAllowed')
                        ? 'Akses kamera ditolak. Izinkan kamera di pengaturan browser lalu coba lagi.'
                        : 'Tidak dapat membuka kamera. Pastikan perangkat punya kamera dan halaman diakses via HTTPS.'
                );
            }
        };

        start();

        return () => {
            cancelled = true;
            const scanner = scannerRef.current;
            scannerRef.current = null;
            if (scanner?.isScanning) {
                scanner.stop().catch(() => { }).finally(() => {
                    try { scanner.clear(); } catch { /* ignore */ }
                });
            }
        };
    }, [isOpen, onDetected]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-2xl p-6 max-w-md w-full flex flex-col gap-4 text-[#313030]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-[#5f1340]" />
                        <h3 className="text-sm font-black text-[#5f1340] uppercase tracking-wider">Scan QR / Barcode Nota</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div
                    id={SCANNER_ELEMENT_ID}
                    className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 min-h-[240px] [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                />

                {error ? (
                    <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl p-3 text-[11px] font-semibold leading-relaxed">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <p className="text-[11px] text-slate-500 font-semibold text-center leading-relaxed">
                        Arahkan kamera ke QR atau barcode pada nota Anda.
                    </p>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 border border-[#e0e0e0] text-[#313030] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                    Batal Scan
                </button>
            </div>
        </div>
    );
}
