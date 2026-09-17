import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Truck,
  MapPin,
  Shirt,
  Sparkles,
  Box,
  Home,
  PartyPopper,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import Toast from '../components/Toast.jsx';
import NotaScanner, { extractOrderNo } from '../components/NotaScanner.jsx';
import waschenLogo from '../assets/images/waschen.png';
import {
  buildJourneySteps,
  customerLabel,
  customerMessage,
  getStepIndex,
  normalizeStatus,
  statusPercent,
} from '../utils/trackingStatus.js';

const STATUS_ICONS = {
  Antrean: Package,
  Pencucian: Sparkles,
  Penyetrikaan: Shirt,
  Pengemasan: Box,
  'Siap Diambil': Home,
  'Siap Diantar': Truck,
  'Sedang Diantar': Truck,
  Selesai: PartyPopper,
  Dibatalkan: Clock,
};

const STATUS_THEMES = {
  Antrean: {
    chip: 'bg-slate-100 border-slate-200 text-slate-600',
    bar: 'bg-slate-400',
    glow: 'from-slate-500/15 to-transparent',
    accent: '#64748b',
  },
  Pencucian: {
    chip: 'bg-[#5f1340]/10 border-[#5f1340]/20 text-[#5f1340]',
    bar: 'bg-[#5f1340]',
    glow: 'from-[#5f1340]/20 to-transparent',
    accent: '#5f1340',
  },
  Penyetrikaan: {
    chip: 'bg-violet-50 border-violet-100 text-violet-700',
    bar: 'bg-violet-500',
    glow: 'from-violet-500/15 to-transparent',
    accent: '#7c3aed',
  },
  Pengemasan: {
    chip: 'bg-sky-50 border-sky-100 text-sky-700',
    bar: 'bg-sky-500',
    glow: 'from-sky-500/15 to-transparent',
    accent: '#0ea5e9',
  },
  'Siap Diambil': {
    chip: 'bg-amber-50 border-amber-200 text-amber-800',
    bar: 'bg-amber-500',
    glow: 'from-amber-400/20 to-transparent',
    accent: '#d97706',
  },
  'Siap Diantar': {
    chip: 'bg-orange-50 border-orange-200 text-orange-800',
    bar: 'bg-orange-500',
    glow: 'from-orange-400/20 to-transparent',
    accent: '#ea580c',
  },
  'Sedang Diantar': {
    chip: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    bar: 'bg-cyan-500',
    glow: 'from-cyan-400/25 to-transparent',
    accent: '#0891b2',
  },
  Selesai: {
    chip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    bar: 'bg-emerald-500',
    glow: 'from-emerald-400/20 to-transparent',
    accent: '#059669',
  },
  Dibatalkan: {
    chip: 'bg-rose-50 border-rose-200 text-rose-700',
    bar: 'bg-rose-500',
    glow: 'from-rose-400/15 to-transparent',
    accent: '#e11d48',
  },
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatQty = (qty, unit) => {
  const n = Number(qty);
  if (Number.isNaN(n)) return `${qty ?? '—'} ${unit || ''}`.trim();
  const pretty = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
  return `${pretty} ${unit || ''}`.trim();
};

function ProgressStepper({ steps, overallStatus }) {
  const activeIdx = Math.max(0, getStepIndex(steps, overallStatus));

  return (
    <>
      {/* Mobile: vertical story */}
      <ol className="md:hidden flex flex-col gap-0">
        {steps.map((step, idx) => {
          const done = idx < activeIdx;
          const active = idx === activeIdx;
          const Icon = STATUS_ICONS[step.name] || Clock;
          const isLast = idx === steps.length - 1;
          return (
            <li key={step.name} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    done || active
                      ? 'bg-[#5f1340] border-[#5f1340] text-white shadow-md shadow-[#5f1340]/25'
                      : 'bg-white border-slate-200 text-slate-300'
                  } ${active ? 'ring-4 ring-[#5f1340]/15 scale-105' : ''}`}
                >
                  {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Icon className="h-4 w-4" />}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 grow min-h-[28px] rounded-full ${
                      idx < activeIdx ? 'bg-[#5f1340]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
              <div className={`min-w-0 pt-1.5 ${isLast ? 'pb-0' : 'pb-5'}`}>
                <p
                  className={`text-[13px] font-bold leading-tight ${
                    done || active ? 'text-[#5f1340]' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                  {active ? (
                    <span className="ml-1.5 text-[11px] font-semibold text-[#5f1340]/70">
                      {step.percentage}%
                    </span>
                  ) : null}
                </p>
                {active && step.hint ? (
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {step.hint}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal */}
      <div className="hidden md:block relative pt-1">
        <div className="relative flex justify-between items-start w-full">
          <div className="absolute left-[6%] right-[6%] h-1.5 bg-slate-100 top-[22px] z-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5f1340] to-[#8a1c5d] transition-all duration-700 ease-out rounded-full"
              style={{
                width: `${
                  steps.length > 1
                    ? (Math.max(0, activeIdx) / (steps.length - 1)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          {steps.map((step, idx) => {
            const done = idx < activeIdx;
            const active = idx === activeIdx;
            const Icon = STATUS_ICONS[step.name] || Clock;
            return (
              <div
                key={step.name}
                className="flex flex-col items-center z-10 relative flex-1 min-w-0 px-1"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    done || active
                      ? 'bg-[#5f1340] border-[#5f1340] text-white shadow-lg shadow-[#5f1340]/20'
                      : 'bg-white border-slate-200 text-slate-300'
                  } ${active ? 'ring-4 ring-[#5f1340]/20 scale-110' : ''}`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4.5 w-4.5" />}
                </div>
                <span
                  className={`text-[11px] font-bold mt-3 text-center leading-snug ${
                    done || active ? 'text-[#5f1340]' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function AccessCodeBoxes({ value, onChange, disabled }) {
  const digits = String(value || '').padEnd(4, ' ').slice(0, 4).split('');
  const refs = useRef([]);

  const commit = (next) => {
    onChange(String(next).replace(/\D/g, '').slice(0, 4));
  };

  const handleChange = (idx, raw) => {
    const only = raw.replace(/\D/g, '');
    if (!only) {
      const arr = digits.map((d) => (d === ' ' ? '' : d));
      arr[idx] = '';
      commit(arr.join(''));
      return;
    }
    const chars = only.slice(0, 4 - idx).split('');
    const arr = digits.map((d) => (d === ' ' ? '' : d));
    chars.forEach((ch, i) => {
      arr[idx + i] = ch;
    });
    commit(arr.join(''));
    refs.current[Math.min(idx + chars.length, 3)]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx]?.trim() && idx > 0) {
      e.preventDefault();
      const arr = digits.map((d) => (d === ' ' ? '' : d));
      arr[idx - 1] = '';
      commit(arr.join(''));
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    commit(pasted);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((idx) => {
        const filled = Boolean(digits[idx]?.trim());
        return (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            value={digits[idx]?.trim() || ''}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            aria-label={`Digit kode akses ${idx + 1}`}
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-center text-xl sm:text-2xl font-black font-mono tabular-nums outline-none transition-all duration-200
              ${filled
                ? 'bg-[#5f1340] text-white border-2 border-[#5f1340] shadow-md shadow-[#5f1340]/25'
                : 'bg-white text-[#5f1340] border-2 border-[#e8dfe4] focus:border-[#5f1340] focus:ring-4 focus:ring-[#5f1340]/12'
              }
              disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}

function StatusHero({ status, percent, isDelivery }) {
  const key = normalizeStatus(status);
  const theme = STATUS_THEMES[key] || STATUS_THEMES.Antrean;
  const Icon = STATUS_ICONS[key] || Clock;
  const label = customerLabel(key);
  const message = customerMessage(key);

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#210415] via-[#450d2e] to-[#5f1340] text-white p-5 sm:p-7 shadow-[0_16px_48px_rgba(95,19,64,0.28)]`}
    >
      <div
        className={`absolute -top-16 -right-10 w-56 h-56 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl pointer-events-none`}
      />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative z-[1] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-white/15 border border-white/20 grid place-items-center backdrop-blur-md shrink-0 shadow-inner">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-100/70">
              Status cucian
            </span>
            {isDelivery ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-400/20 border border-orange-300/30 text-orange-100">
                <Truck className="w-3 h-3" /> Antar ke rumah
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-pink-50">
                <MapPin className="w-3 h-3" /> Ambil di outlet
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            {label}
          </h2>
          <p className="text-[13px] sm:text-[14px] text-pink-50/85 font-medium mt-1.5 leading-relaxed max-w-xl">
            {message}
          </p>
        </div>
        <div className="sm:text-right shrink-0">
          <div className="inline-flex flex-col items-start sm:items-end bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-md">
            <span className="text-[10px] font-bold text-pink-100/70 uppercase tracking-wider">
              Progres
            </span>
            <span className="text-2xl sm:text-3xl font-black tabular-nums leading-none mt-0.5">
              {Math.round(percent)}%
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-[1] mt-5 h-2 rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-white via-pink-100 to-amber-100 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export default function CustomerTrackingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [notaNumber, setNotaNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [masterSteps, setMasterSteps] = useState([]);
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') =>
    setToast({ isOpen: true, title, message, type });

  useEffect(() => {
    document.title = 'Lacak Cucian | Waschen';
    axios
      .get('/api/tracking/work-statuses')
      .then((res) => {
        const rows = res.data?.data;
        if (res.data?.success && Array.isArray(rows) && rows.length) setMasterSteps(rows);
      })
      .catch(() => {});
  }, []);

  const fetchOrder = useCallback(
    async (rawKey, rawCode) => {
      const key = extractOrderNo(rawKey);
      const code = String(rawCode ?? '').replace(/\D/g, '').slice(0, 4);
      if (!key) {
        showToast('Input Kosong', 'Harap masukkan nomor nota terlebih dahulu.', 'error');
        return;
      }
      if (code.length !== 4) {
        showToast('Kode Akses', 'Masukkan kode akses 4 digit dari pesan WhatsApp nota digital.', 'error');
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get(`/api/tracking/${encodeURIComponent(key)}`, {
          params: { code },
        });
        if (res.data?.success && res.data.data) {
          setTrackedOrder(res.data.data);
          setNotaNumber(res.data.data.order_no || key);
          setSearchParams({ trackingNo: res.data.data.order_no || key }, { replace: true });
          try {
            sessionStorage.setItem(
              `waschen_track_${res.data.data.order_no || key}`,
              code
            );
          } catch { /* ignore */ }
          showToast('Nota Ditemukan', `Berhasil memuat nota ${res.data.data.order_no}`, 'success');
        } else {
          setTrackedOrder(null);
          showToast('Tidak Ditemukan', `Nota "${key}" tidak terdaftar.`, 'error');
        }
      } catch (err) {
        setTrackedOrder(null);
        showToast(
          err.response?.status === 403 ? 'Kode Salah' : 'Tidak Ditemukan',
          err.response?.data?.message || `Nota "${key}" tidak dapat dimuat.`,
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    const initial = searchParams.get('trackingNo');
    if (!initial) return;
    setNotaNumber(initial);
    // Prefill nomor dari link; jangan auto-load detail tanpa kode akses
    try {
      const saved = sessionStorage.getItem(`waschen_track_${initial}`);
      if (saved && /^\d{4}$/.test(saved)) {
        setAccessCode(saved);
        fetchOrder(initial, saved);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    fetchOrder(notaNumber, accessCode);
  };

  const handleScanDetected = useCallback(
    (code) => {
      setIsScannerOpen(false);
      setNotaNumber(code);
      // Setelah scan, user masih wajib isi kode akses
      showToast('Nota Terbaca', 'Masukkan kode akses 4 digit, lalu klik Lacak.', 'success');
    },
    []
  );

  const isDelivery =
    Number(trackedOrder?.is_delivery) === 1 || trackedOrder?.journey === 'delivery';

  const journeySteps = useMemo(
    () => buildJourneySteps(isDelivery ? 'delivery' : 'pickup', masterSteps),
    [isDelivery, masterSteps]
  );

  const overallStatus = useMemo(() => {
    if (!trackedOrder?.items?.length) return 'Antrean';
    let minIdx = Infinity;
    let fallback = normalizeStatus(trackedOrder.items[0].item_work_status);
    trackedOrder.items.forEach((it) => {
      if (it.item_work_status === 'Dibatalkan') return;
      const idx = getStepIndex(journeySteps, it.item_work_status);
      const name = normalizeStatus(it.item_work_status);
      if (idx >= 0 && idx < minIdx) {
        minIdx = idx;
        fallback = name;
      } else if (idx < 0 && statusPercent(name) < statusPercent(fallback)) {
        fallback = name;
      }
    });
    return fallback;
  }, [trackedOrder, journeySteps]);

  const overallPercent =
    Number(trackedOrder?.work_status) || statusPercent(overallStatus);

  return (
    <div className="relative min-h-screen min-h-dvh bg-[#f6f3f5] text-[#2a2428] flex flex-col font-sans antialiased overflow-x-hidden">
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      <NotaScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleScanDetected}
      />

      <div className="pointer-events-none absolute top-[-200px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#5f1340]/6 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-100px] w-[380px] h-[380px] rounded-full bg-rose-300/20 blur-[90px]" />

      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-[#e8e0e4]/80 px-4 md:px-8 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-[1100px] w-full mx-auto flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(localStorage.getItem('token') ? '/dashboard' : '/login')}
              className="p-2 rounded-xl text-slate-400 hover:text-[#5f1340] hover:bg-[#5f1340]/5 border border-transparent hover:border-[#5f1340]/10 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="h-6 w-px bg-[#e8e0e4] shrink-0" />
            <img
              src={waschenLogo}
              alt="Waschen"
              className="h-7 sm:h-8 w-auto max-w-[140px] object-contain object-left"
            />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#5f1340]/70 tracking-wide">
            Lacak Cucian
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-[1100px] w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] grow flex flex-col gap-4 sm:gap-5 min-w-0">
        {/* Search — form lacak nota */}
        <section className="relative overflow-hidden rounded-[28px] border border-[#5f1340]/10 bg-white shadow-[0_20px_50px_-24px_rgba(95,19,64,0.35)] min-w-0">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#5f1340] via-[#8a1c5d] to-[#c45a8a]" />
          <div className="absolute -top-24 -right-16 w-56 h-56 rounded-full bg-[#5f1340]/[0.06] blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5f1340] to-[#3d0c29] text-white grid place-items-center shadow-lg shadow-[#5f1340]/30 shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0 pt-0.5">
                <h1 className="text-[1.35rem] sm:text-2xl font-extrabold text-[#2a1420] tracking-tight leading-tight">
                  Di mana cucian saya?
                </h1>
                <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Pakai nomor nota dan kode akses dari WhatsApp — aman, cepat, tanpa login.
                </p>
              </div>
            </div>

            <form onSubmit={handleTrack} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-[#5f1340]/80 px-0.5">
                  Nomor nota
                </label>
                <div className="flex gap-2.5">
                  <div className="relative grow min-w-0">
                    <input
                      type="text"
                      inputMode="text"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      value={notaNumber}
                      onChange={(e) => setNotaNumber(e.target.value)}
                      placeholder="WLCG202609150001"
                      className="w-full min-w-0 bg-[#faf6f8] border border-[#eadfe5] focus:border-[#5f1340] focus:bg-white focus:ring-4 focus:ring-[#5f1340]/10 rounded-2xl py-3.5 pl-11 pr-4 text-[13px] sm:text-sm font-bold text-[#2a1420] outline-none uppercase font-mono transition"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f1340]/45 pointer-events-none">
                      <Package className="h-4 w-4" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="shrink-0 px-3.5 sm:px-4 rounded-2xl border border-[#eadfe5] bg-[#faf6f8] hover:bg-[#5f1340] hover:border-[#5f1340] hover:text-white text-[#5f1340] transition-all cursor-pointer flex items-center gap-2 font-bold text-xs"
                    title="Scan QR / Barcode"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="hidden sm:inline">Scan</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <label className="text-[11px] font-bold text-[#5f1340]/80 inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Kode akses
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    4 digit dari WhatsApp
                  </span>
                </div>
                <AccessCodeBoxes
                  value={accessCode}
                  onChange={setAccessCode}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || accessCode.length !== 4 || !notaNumber.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#5f1340] to-[#7a1852] hover:from-[#4d0f33] hover:to-[#5f1340] disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white text-[14px] font-extrabold rounded-2xl shadow-[0_12px_28px_-8px_rgba(95,19,64,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.985]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Mencari nota...
                  </>
                ) : (
                  <>
                    <Search className="w-4.5 h-4.5" />
                    Lacak sekarang
                  </>
                )}
              </button>

              <div className="flex items-start gap-2.5 rounded-2xl bg-[#5f1340]/[0.04] border border-[#5f1340]/10 px-3.5 py-3">
                <ShieldCheck className="h-4 w-4 text-[#5f1340] shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                  Rincian cucian hanya terbuka jika nomor nota dan kode akses cocok. Link saja tidak cukup.
                </p>
              </div>
            </form>
          </div>
        </section>

        {trackedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-4 sm:gap-5 min-w-0">
            <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
              <StatusHero
                status={overallStatus}
                percent={overallPercent}
                isDelivery={isDelivery}
              />

              <section className="bg-white rounded-[22px] border border-[#ebe4e8] shadow-[0_8px_30px_rgba(95,19,64,0.04)] p-4 sm:p-6 flex flex-col gap-4 min-w-0">
                <div className="flex items-end justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nomor nota
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-[#5f1340] font-mono break-all">
                      {trackedOrder.order_no}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-4">
                    Perjalanan cucian Anda
                  </p>
                  <ProgressStepper steps={journeySteps} overallStatus={overallStatus} />
                </div>
              </section>

              <section className="bg-white rounded-[22px] border border-[#ebe4e8] shadow-[0_8px_30px_rgba(95,19,64,0.04)] p-4 sm:p-6 flex flex-col gap-4 min-w-0">
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#5f1340]">Item di nota ini</h3>
                  <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
                    Status tiap item diperbarui secara real-time oleh tim Waschen.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {(trackedOrder.items || []).map((item, idx) => {
                    const status = normalizeStatus(item.item_work_status);
                    const pct = statusPercent(status);
                    const theme = STATUS_THEMES[status] || STATUS_THEMES.Antrean;
                    const Icon = STATUS_ICONS[status] || Clock;
                    const deliveryItem = Boolean(item.is_delivery_item);

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#ebe4e8] bg-[#faf7f9] p-3.5 sm:p-4 flex flex-col gap-3 min-w-0"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-white border border-[#ebe4e8] grid place-items-center text-[11px] font-extrabold text-[#5f1340] shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-[13px] font-bold text-[#2a2428] leading-snug break-words">
                                {item.service_name}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                {formatQty(item.qty, item.unit)}
                                {deliveryItem ? ' · Antar' : ' · Ambil outlet'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 max-w-[48%] truncate ${theme.chip}`}
                          >
                            <Icon className="w-3 h-3 shrink-0" />
                            {customerLabel(status)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Progres</span>
                            <span className="tabular-nums text-slate-600">{pct}%</span>
                          </div>
                          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#ebe4e8]">
                            <div
                              className={`h-full ${theme.bar} transition-all duration-500 rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            {customerMessage(status)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 sm:gap-5 min-w-0">
              <section className="bg-white rounded-[22px] border border-[#ebe4e8] shadow-[0_8px_30px_rgba(95,19,64,0.04)] p-4 sm:p-5 flex flex-col gap-3.5 min-w-0">
                <h4 className="text-[11px] font-extrabold text-[#5f1340] tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar className="h-3.5 w-3.5" />
                  Detail nota
                </h4>

                <div className="flex flex-col gap-2.5 text-[12.5px] font-semibold text-slate-600">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Pelanggan</span>
                    <span className="font-bold text-[#2a2428] text-right break-words min-w-0">
                      {trackedOrder.customer_name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Outlet</span>
                    <span className="font-bold text-[#2a2428] text-right break-words min-w-0">
                      {trackedOrder.outlet_name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Pengambilan</span>
                    <span className="font-bold text-[#2a2428] text-right inline-flex items-center gap-1">
                      {isDelivery ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-orange-600" /> Delivery
                        </>
                      ) : (
                        <>
                          <Home className="w-3.5 h-3.5 text-amber-600" /> Ambil di outlet
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Masuk</span>
                    <span className="font-bold text-[#2a2428] text-right">
                      {formatDateTime(trackedOrder.order_date)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Estimasi</span>
                    <span className="font-bold text-[#2a2428] text-right">
                      {formatDateTime(trackedOrder.estimated_finished_at)}
                    </span>
                  </div>
                  {trackedOrder.picked_up_at ? (
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-400 shrink-0">Selesai</span>
                      <span className="font-bold text-emerald-700 text-right">
                        {formatDateTime(trackedOrder.picked_up_at)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Paket</span>
                    <span className="font-bold text-[#2a2428] text-right break-words min-w-0">
                      {trackedOrder.speed_name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Parfum</span>
                    <span className="font-bold text-[#2a2428] text-right break-words min-w-0">
                      {trackedOrder.parfume_name || '—'}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-400">Pembayaran</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                        trackedOrder.payment_status === 'Lunas'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-100'
                      }`}
                    >
                      {trackedOrder.payment_status === 'Lunas'
                        ? 'Lunas'
                        : trackedOrder.payment_status === 'DP'
                          ? 'DP'
                          : 'Belum lunas'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 mt-0.5">
                    <span className="text-slate-400 text-xs">Total</span>
                    <span className="text-lg font-black text-[#5f1340]">
                      Rp {Number(trackedOrder.grand_total || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </section>

              {(trackedOrder.logs || []).length > 0 && (
                <section className="bg-white rounded-[22px] border border-[#ebe4e8] shadow-[0_8px_30px_rgba(95,19,64,0.04)] p-4 sm:p-5 flex flex-col gap-3.5 min-w-0">
                  <h4 className="text-[11px] font-extrabold text-[#5f1340] tracking-wide flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Clock className="h-3.5 w-3.5" />
                    Riwayat status
                  </h4>
                  <div className="flex flex-col gap-3.5 pl-0.5 max-h-[360px] overflow-y-auto">
                    {[...trackedOrder.logs].reverse().map((log, idx) => {
                      const st = normalizeStatus(log.status);
                      const theme = STATUS_THEMES[st] || STATUS_THEMES.Antrean;
                      return (
                        <div key={`${log.created_at}-${idx}`} className="flex gap-3 text-xs">
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full mt-1.5"
                              style={{ backgroundColor: theme.accent }}
                            />
                            {idx !== trackedOrder.logs.length - 1 && (
                              <div className="w-px bg-slate-200 grow min-h-[20px]" />
                            )}
                          </div>
                          <div className="min-w-0 pb-0.5">
                            <span className="font-bold block text-[12.5px] leading-tight text-[#2a2428]">
                              {customerLabel(st)}
                            </span>
                            {log.notes ? (
                              <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                                {log.notes}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {formatDateTime(log.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </aside>
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-[28px] border border-dashed border-[#5f1340]/20 bg-gradient-to-b from-white to-[#faf6f8] px-5 py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#5f1340]/10 blur-xl scale-150" />
              <div className="relative w-[76px] h-[76px] rounded-[22px] bg-gradient-to-br from-[#5f1340] to-[#3d0c29] grid place-items-center shadow-xl shadow-[#5f1340]/25">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <h3 className="text-[16px] font-extrabold text-[#2a1420]">
                Siap melacak cucian Anda
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                Isi nomor nota dan 4 digit kode akses di atas, atau scan QR pada nota lalu masukkan kodenya.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
