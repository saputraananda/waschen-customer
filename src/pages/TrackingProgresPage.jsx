import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Camera,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import Toast from '../components/Toast.jsx';
import NotaScanner, { extractOrderNo } from '../components/NotaScanner.jsx';
import waschenLogo from '../assets/images/waschen.png';

const DEFAULT_STEPS = [
  { name: 'Antrean', label: 'Antrean', percentage: 10 },
  { name: 'Pencucian', label: 'Pencucian', percentage: 25 },
  { name: 'Penyetrikaan', label: 'Penyetrikaan', percentage: 50 },
  { name: 'Pengemasan', label: 'Pengemasan', percentage: 75 },
  { name: 'Siap Diambil', label: 'Siap Diambil', percentage: 90 },
  { name: 'Selesai', label: 'Selesai', percentage: 100 },
];

const STATUS_THEMES = {
  'Antrean': { bg: 'bg-slate-100 border-slate-200 text-slate-500', bar: 'bg-slate-300' },
  'Pencucian': { bg: 'bg-[#5f1340]/10 border-[#5f1340]/15 text-[#5f1340]', bar: 'bg-[#5f1340]' },
  'Penyetrikaan': { bg: 'bg-indigo-50 border-indigo-100 text-indigo-700', bar: 'bg-indigo-600' },
  'Pengemasan': { bg: 'bg-sky-50 border-sky-100 text-sky-700', bar: 'bg-sky-600' },
  'Siap Diambil': { bg: 'bg-amber-50 border-amber-100 text-amber-700', bar: 'bg-amber-600' },
  'Siap Diantar': { bg: 'bg-amber-50 border-amber-100 text-amber-700', bar: 'bg-amber-600' },
  'Selesai': { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', bar: 'bg-emerald-600' },
  'Dibatalkan': { bg: 'bg-rose-50 border-rose-100 text-rose-700', bar: 'bg-rose-500' },
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatQty = (qty, unit) => {
  const n = Number(qty);
  if (Number.isNaN(n)) return `${qty ?? '-'} ${unit || ''}`.trim();
  const pretty = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
  return `${pretty} ${unit || ''}`.trim();
};

function ProgressStepper({ steps, overallStatus, getStepIndex }) {
  const activeIdx = getStepIndex(overallStatus);

  return (
    <>
      <ol className="md:hidden flex flex-col gap-0">
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIdx;
          const isActive = idx === activeIdx;
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.name} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted
                  ? 'bg-[#5f1340] border-[#5f1340] text-white'
                  : 'bg-white border-[#e0e0e0] text-slate-300'
                  } ${isActive ? 'ring-4 ring-[#5f1340]/20' : ''}`}>
                  {isCompleted
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <span className="text-[11px] font-black">{idx + 1}</span>}
                </div>
                {!isLast && (
                  <div className={`w-px grow min-h-[22px] ${idx < activeIdx ? 'bg-[#5f1340]' : 'bg-slate-200'}`} />
                )}
              </div>
              <div className={`min-w-0 pb-4 ${isLast ? 'pb-0' : ''}`}>
                <p className={`text-xs font-extrabold leading-8 ${isCompleted ? 'text-[#5f1340]' : 'text-slate-400'}`}>
                  {step.label || step.name}
                  {isActive ? ` · ${step.percentage ?? 0}%` : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden md:block relative">
        <div className="relative flex justify-between items-start w-full px-2">
          <div className="absolute left-0 right-0 h-1 bg-slate-100 top-[18px] z-0 rounded-full mx-6">
            <div
              className="h-full bg-[#5f1340] transition-all duration-500 rounded-full"
              style={{ width: `${steps.length > 1 ? (Math.max(0, activeIdx) / (steps.length - 1)) * 100 : 0}%` }}
            />
          </div>
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIdx;
            const isActive = idx === activeIdx;
            return (
              <div key={step.name} className="flex flex-col items-center z-10 relative flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                  ? 'bg-[#5f1340] border-[#5f1340] text-white shadow-sm'
                  : 'bg-white border-[#e0e0e0] text-slate-300'
                  } ${isActive ? 'ring-4 ring-[#5f1340]/20 scale-105' : ''}`}>
                  {isCompleted
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <span className="text-xs font-black">{idx + 1}</span>}
                </div>
                <span className={`text-[10px] font-extrabold mt-2.5 text-center leading-tight px-0.5 ${isCompleted ? 'text-[#5f1340]' : 'text-slate-400'}`}>
                  {step.label || step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function CustomerTrackingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [notaNumber, setNotaNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') =>
    setToast({ isOpen: true, title, message, type });

  // Tahapan pengerjaan dari master data (fallback ke default bila gagal)
  useEffect(() => {
    axios.get('/api/tracking/work-statuses')
      .then((res) => {
        const rows = res.data?.data;
        if (res.data?.success && Array.isArray(rows) && rows.length) setSteps(rows);
      })
      .catch(() => { });
  }, []);

  const fetchOrder = useCallback(async (rawKey) => {
    const key = extractOrderNo(rawKey);
    if (!key) {
      showToast('Input Kosong', 'Harap masukkan nomor nota terlebih dahulu.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(`/api/tracking/${encodeURIComponent(key)}`);
      if (res.data?.success && res.data.data) {
        setTrackedOrder(res.data.data);
        setNotaNumber(res.data.data.order_no || key);
        setSearchParams({ trackingNo: res.data.data.order_no || key }, { replace: true });
        showToast('Nota Ditemukan', `Berhasil memuat rincian nota ${res.data.data.order_no}`, 'success');
      } else {
        setTrackedOrder(null);
        showToast('Tidak Ditemukan', `Nota "${key}" tidak terdaftar.`, 'error');
      }
    } catch (err) {
      setTrackedOrder(null);
      showToast('Tidak Ditemukan', err.response?.data?.message || `Nota "${key}" tidak dapat dimuat.`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [setSearchParams]);

  // Auto-lacak jika dibuka dari link/QR: /tracking?trackingNo=WL...
  useEffect(() => {
    const initial = searchParams.get('trackingNo');
    if (initial) {
      setNotaNumber(initial);
      fetchOrder(initial);
    }
    // sengaja hanya sekali saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    fetchOrder(notaNumber);
  };

  const handleScanDetected = useCallback((code) => {
    setIsScannerOpen(false);
    setNotaNumber(code);
    fetchOrder(code);
  }, [fetchOrder]);

  const getStepIndex = (statusName) => steps.findIndex((s) => s.name === statusName);
  const getStepPercentage = (statusName) =>
    steps.find((s) => s.name === statusName)?.percentage ?? 0;

  // Status keseluruhan diturunkan dari item paling belakang progresnya
  const overallStatus = (() => {
    if (!trackedOrder?.items?.length) return 'Antrean';
    let minIdx = Infinity;
    let fallback = trackedOrder.items[0].item_work_status;
    trackedOrder.items.forEach((it) => {
      const idx = getStepIndex(it.item_work_status);
      if (idx >= 0 && idx < minIdx) { minIdx = idx; fallback = it.item_work_status; }
    });
    return fallback;
  })();

  const overallPercent = Number(trackedOrder?.work_status) || getStepPercentage(overallStatus);

  return (
    <div className="relative min-h-screen min-h-dvh bg-[#f8f8f8] text-[#313030] flex flex-col font-sans antialiased overflow-x-hidden">
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      <NotaScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleScanDetected}
      />

      {/* Subtle brand glow elements */}
      <div className="absolute top-[-250px] left-[-250px] w-[500px] h-[500px] rounded-full bg-[#5f1340]/4 filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-250px] right-[-250px] w-[500px] h-[500px] rounded-full bg-[#5f1340]/3 filter blur-[150px] pointer-events-none" />

      {/* Header navbar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#e0e0e0]/60 shadow-sm px-4 md:px-8 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-xl text-slate-400 hover:text-[#5f1340] hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-1.5 font-black text-xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="h-6 w-px bg-[#e0e0e0] shrink-0" />
            <img src={waschenLogo} alt="Waschen Logo" className="h-7 sm:h-8 md:h-9 w-auto max-w-[140px] object-contain object-left" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1400px] w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] grow flex flex-col gap-4 sm:gap-6 min-w-0">

        {/* Search Panel Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5 min-w-0">
          <div className="text-left">
            <h2 className="text-lg sm:text-2xl font-black text-[#5f1340] tracking-tight leading-snug">Lacak Progres Cucian Anda</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Masukkan nomor nota, atau scan QR / barcode pada nota untuk memantau progres.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative grow min-w-0">
              <input
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                value={notaNumber}
                onChange={(e) => setNotaNumber(e.target.value)}
                placeholder="Ketik Nomor Nota..."
                className="w-full min-w-0 bg-white border border-[#e0e0e0] focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] rounded-2xl py-3 sm:py-3.5 pl-11 pr-12 text-sm font-bold text-[#313030] shadow-sm outline-none uppercase font-mono"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#5f1340] transition-colors cursor-pointer"
                title="Scan QR / Barcode Nota"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto py-3 sm:py-3.5 px-6 bg-[#5f1340] hover:bg-[#4d0f33] disabled:bg-slate-400 text-white text-xs font-black rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isLoading
                ? <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                : <span>Lacak Cucian</span>}
            </button>
          </form>
        </div>

        {/* Tracking Details Result Grid */}
        {trackedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">

            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 min-w-0">

              {/* Card 1: Overall Progress Stepper */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 min-w-0">

                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:pb-5">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nomor Nota</span>
                    <span className="text-base sm:text-xl font-black text-[#5f1340] font-mono block mt-0.5 break-all">{trackedOrder.order_no}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Status Keseluruhan</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-xs mt-1 border max-w-full ${STATUS_THEMES[overallStatus]?.bg || 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{overallStatus} · {overallPercent}%</span>
                    </span>
                  </div>
                </div>

                <div className="py-1 sm:py-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-4 sm:mb-6">Timeline Progres Keseluruhan</span>
                  <ProgressStepper steps={steps} overallStatus={overallStatus} getStepIndex={getStepIndex} />
                </div>
              </div>

              {/* Card 2: Items Breakdown */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-5 min-w-0">
                <div>
                  <h3 className="text-base font-black text-[#5f1340] tracking-tight">Rincian Item & Progres Pengerjaan</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Progres detail dari masing-masing item cucian di dalam nota ini.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {(trackedOrder.items || []).map((item, idx) => {
                    const stepIdx = getStepIndex(item.item_work_status);
                    const percentVal = getStepPercentage(item.item_work_status);
                    const theme = STATUS_THEMES[item.item_work_status] || { bar: 'bg-slate-300', bg: 'bg-slate-50 border-slate-200 text-slate-500' };

                    return (
                      <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono shrink-0">
                              #{idx + 1}
                            </span>
                            <h4 className="text-xs font-black text-[#313030] break-words leading-snug">{item.service_name}</h4>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Jumlah</span>
                            <span className="text-xs font-extrabold text-slate-700">{formatQty(item.qty, item.unit)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50">
                          <div className="flex justify-between items-center gap-2 min-w-0">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Progres Item</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border truncate max-w-[60%] ${theme.bg}`}>
                              {item.item_work_status}
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${theme.bar} transition-all duration-500`} style={{ width: `${percentVal}%` }} />
                          </div>

                          <div className="hidden sm:flex text-center mt-1 text-[8px] font-extrabold">
                            {steps.map((s, sIdx) => (
                              <span
                                key={s.name}
                                className={`flex-1 min-w-0 truncate px-0.5 ${sIdx <= stepIdx ? 'text-[#5f1340] font-black' : 'text-slate-300'}`}
                              >
                                {s.label || s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 sm:gap-6 min-w-0">

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm p-4 sm:p-6 flex flex-col gap-4 min-w-0">
                <h4 className="text-xs font-black text-[#5f1340] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar className="h-4 w-4" />
                  Rincian Nota
                </h4>

                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Nama Pelanggan</span>
                    <span className="font-extrabold text-[#313030] text-right break-words min-w-0">{trackedOrder.customer_name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Outlet</span>
                    <span className="font-bold text-[#313030] text-right break-words min-w-0">{trackedOrder.outlet_name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Tanggal Masuk</span>
                    <span className="font-bold text-[#313030] text-right">{formatDateTime(trackedOrder.order_date)}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Estimasi Selesai</span>
                    <span className="font-bold text-[#313030] text-right">{formatDateTime(trackedOrder.estimated_finished_at)}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Durasi / Paket</span>
                    <span className="font-bold text-[#313030] text-right break-words min-w-0">{trackedOrder.speed_name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-slate-400 shrink-0">Parfum</span>
                    <span className="font-bold text-[#313030] text-right break-words min-w-0">{trackedOrder.parfume_name || '-'}</span>
                  </div>

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-400">Status Pembayaran</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${trackedOrder.payment_status === 'Lunas'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                      {trackedOrder.payment_status}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mt-1.5 gap-3 min-w-0">
                    <span className="text-slate-400 text-xs shrink-0">Total</span>
                    <span className="text-base sm:text-lg font-black text-[#5f1340] text-right break-all">
                      Rp {Number(trackedOrder.grand_total || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {(trackedOrder.logs || []).length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm p-4 sm:p-6 flex flex-col gap-4 min-w-0">
                  <h4 className="text-xs font-black text-[#5f1340] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <TrendingUp className="h-4 w-4" />
                    Log Aktivitas
                  </h4>

                  <div className="flex flex-col gap-4 pl-1">
                    {trackedOrder.logs.map((log, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-[#5f1340]" />
                          {idx !== trackedOrder.logs.length - 1 && <div className="w-px bg-slate-200 grow min-h-[22px]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold block text-xs leading-tight text-[#313030]">{log.status}</span>
                          {log.notes && <span className="text-[10px] text-slate-500 block mt-0.5">{log.notes}</span>}
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{formatDateTime(log.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e0e0e0] shadow-sm px-5 py-10 sm:p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-full">
              <Package className="h-10 w-10 text-[#5f1340]" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="text-sm font-black text-[#5f1340] uppercase tracking-wider">Belum Ada Nota Yang Dilacak</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Ketik nomor nota Anda pada form di atas, atau gunakan tombol kamera untuk scan QR / barcode pada nota.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
