import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Star, Gift, Package, Clock, Search,
  ChevronRight, CheckCircle2, Sparkles, Tag, Copy,
  Calendar, Phone, MapPin, Plus, X, ChevronDown,
  Shirt, Weight, Zap, Truck, ShoppingBag, Bell,
  TrendingUp, Award, ArrowRight, Hash, Droplets, Wind
} from 'lucide-react';
import Toast from '../components/Toast.jsx';
import waschenLogo from '../assets/images/waschen.png';
import waschenLogoWhite from '../assets/images/waschen_white.png';
import maskotHappyLogo from '../assets/images/maskot_happy.png';

// ============================================================
// MOCK DATA
// ============================================================
const CUSTOMER_PROFILE = {
  fullName: localStorage.getItem('fullName') || 'Budi Santoso',
  username: localStorage.getItem('username') || 'budi_s',
  phone: '08123456789',
  points: 1240,
  tier: 'Silver',
  totalOrders: 18,
  joinDate: 'Jan 2025',
};

const TIER_CONFIG = {
  Bronze:  { min: 0,    max: 999,  next: 'Silver', color: 'from-amber-700 to-amber-500',  badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  Silver:  { min: 1000, max: 2999, next: 'Gold',   color: 'from-slate-500 to-slate-400',  badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  Gold:    { min: 3000, max: 9999, next: 'Platinum',color: 'from-yellow-600 to-yellow-400', badge: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  Platinum:{ min: 10000,max: Infinity,next:null,    color: 'from-violet-600 to-violet-400', badge: 'bg-violet-50 text-violet-800 border-violet-200' },
};

const ACTIVE_ORDERS = [
  {
    id: 'WS-0824002',
    service: 'Bed Cover King + Selimut',
    speed: 'Kilat (24 Jam)',
    status: 'Pencucian',
    date: '12 Agu 2026',
    estimasi: '13 Agu 2026',
    amount: 79000,
    items: 3,
  },
  {
    id: 'WS-0824005',
    service: 'Cuci + Setrika (5.2 Kg)',
    speed: 'Reguler (2 Hari)',
    status: 'Siap Diambil',
    date: '11 Agu 2026',
    estimasi: '13 Agu 2026',
    amount: 92000,
    items: 2,
  },
];

const HISTORY_ORDERS = [
  { id: 'WS-0824001', service: 'Pakaian Harian + Jas Wool', speed: 'Reguler', amount: 80000, date: '10 Agu 2026', payStatus: 'Lunas', type: 'Kiloan+Satuan', pointsEarned: 80 },
  { id: 'WS-0824003', service: 'Cuci Saja (3 Kg) + Sepatu', speed: 'Express', amount: 61000, date: '8 Agu 2026',  payStatus: 'Lunas', type: 'Kiloan+Satuan', pointsEarned: 61 },
  { id: 'WS-0824004', service: 'Jas Blazer + Kemeja Putih', speed: 'Reguler', amount: 61000, date: '5 Agu 2026',  payStatus: 'Lunas', type: 'Satuan',        pointsEarned: 61 },
  { id: 'WS-0723009', service: 'Cuci + Setrika (6 Kg)',     speed: 'Reguler', amount: 60000, date: '28 Jul 2026', payStatus: 'Lunas', type: 'Kiloan',         pointsEarned: 60 },
  { id: 'WS-0723007', service: 'Gordyn Tebal 2 Pcs',         speed: 'Kilat',   amount: 60000, date: '20 Jul 2026', payStatus: 'Lunas', type: 'Satuan',         pointsEarned: 60 },
];

const PROMOS = [
  { code: 'WASCHEN20',  title: 'Diskon 20% Kiloan',       desc: 'Khusus pelanggan Silver ke atas. Min. order 3 Kg.',  until: '31 Agu 2026', color: 'from-[#5f1340] to-[#9b2459]',    badge: 'Terbatas' },
  { code: 'GRATIS5KG',  title: 'Gratis +1 Kg Cuci Saja',  desc: 'Setiap pemesanan Kiloan Cuci Saja minimal 5 Kg.',    until: '20 Agu 2026', color: 'from-emerald-700 to-emerald-500', badge: 'Baru' },
  { code: 'POIN2X',     title: 'Poin 2× Lipat Weekend',   desc: 'Dapatkan 2× poin setiap transaksi di hari Sabtu-Minggu.', until: '31 Des 2026', color: 'from-amber-600 to-amber-400',    badge: 'Selalu Ada' },
  { code: 'NEWMEMBER',  title: 'Bonus 100 Poin Member',   desc: 'Daftarkan akun Anda dan langsung dapat 100 poin selamat datang.', until: '31 Des 2026', color: 'from-violet-700 to-violet-500', badge: 'Member' },
];

const SERVICES = {
  kiloan: [
    { id: 'k1', name: 'Cuci + Setrika', price: 10000, unit: 'Kg' },
    { id: 'k2', name: 'Cuci Saja',      price: 7000,  unit: 'Kg' },
    { id: 'k3', name: 'Setrika Saja',   price: 6000,  unit: 'Kg' },
  ],
  satuan: [
    { id: 's1', name: 'Bed Cover Single',   price: 25000, unit: 'Pcs' },
    { id: 's2', name: 'Bed Cover Double',   price: 35000, unit: 'Pcs' },
    { id: 's3', name: 'Selimut / Blanket',  price: 20000, unit: 'Pcs' },
    { id: 's4', name: 'Jas / Suit Blazer',  price: 45000, unit: 'Pcs' },
    { id: 's5', name: 'Jaket Tebal / Coat', price: 30000, unit: 'Pcs' },
    { id: 's6', name: 'Sepatu Premium',     price: 40000, unit: 'Pcs' },
  ],
};

const PERFUMES   = ['Sakura Premium', 'Lavender Calm', 'Lily Sweet', 'Fresh Ocean', 'Tanpa Parfum'];
const SPEEDS     = [
  { label: 'Reguler (2 Hari)', surcharge: 0 },
  { label: 'Kilat (24 Jam)',   surcharge: 0.5 },
  { label: 'Express (6 Jam)',  surcharge: 1 },
];
const METHODS    = ['Antar ke Outlet', 'Pickup Jemput (hubungi CS)'];

const STATUS_STEPS = ['Antrean','Pencucian','Penyetrikaan','Siap Diambil','Selesai'];
const STATUS_COLORS = {
  'Antrean':     'bg-slate-100 text-slate-600 border-slate-200',
  'Pencucian':   'bg-[#5f1340]/10 text-[#5f1340] border-[#5f1340]/15',
  'Penyetrikaan':'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Siap Diambil':'bg-amber-50 text-amber-700 border-amber-100',
  'Selesai':     'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const STATUS_BAR = {
  'Antrean':20,'Pencucian':45,'Penyetrikaan':70,'Siap Diambil':90,'Selesai':100
};

// ============================================================
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...CUSTOMER_PROFILE });
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [historyFilter, setHistoryFilter] = useState('Semua');

  // Booking form state
  const [bookCategory, setBookCategory] = useState('Kiloan');
  const [bookItems, setBookItems] = useState([]);
  const [bookPerfume, setBookPerfume] = useState(PERFUMES[0]);
  const [bookSpeed, setBookSpeed] = useState(0);
  const [bookMethod, setBookMethod] = useState(METHODS[0]);
  const [bookNote, setBookNote] = useState('');
  const [bookingStep, setBookingStep] = useState(1); // 1=service, 2=detail, 3=confirm

  useEffect(() => {
    document.title = 'Dashboard | My Waschen';
    const name = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Pelanggan';
    setProfile(p => ({ ...p, fullName: name, username: localStorage.getItem('username') || '' }));
  }, []);

  const showToast = (title, message, type = 'success') =>
    setToast({ isOpen: true, title, message, type });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const copyPromo = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    showToast('Kode Disalin!', `Kode promo "${code}" sudah tersalin ke clipboard.`, 'success');
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // ---- Booking helpers ----
  const getServiceList = () => bookCategory === 'Kiloan' ? SERVICES.kiloan : SERVICES.satuan;
  const toggleBookItem = (svc) => {
    setBookItems(prev => {
      const exists = prev.find(i => i.id === svc.id);
      if (exists) return prev.filter(i => i.id !== svc.id);
      return [...prev, { ...svc, qty: svc.unit === 'Kg' ? 3 : 1 }];
    });
  };
  const updateQty = (id, delta) => {
    setBookItems(prev => prev.map(i => i.id === id
      ? { ...i, qty: Math.max(i.unit === 'Kg' ? 1 : 1, +(i.qty + delta).toFixed(1)) }
      : i
    ));
  };
  const baseTotal = bookItems.reduce((s, i) => s + i.price * i.qty, 0);
  const speedSurcharge = SPEEDS[bookSpeed].surcharge;
  const grandTotal = Math.ceil(baseTotal * (1 + speedSurcharge));

  const submitBooking = () => {
    const id = `WS-${String(Date.now()).slice(-7)}`;
    showToast('Booking Berhasil! 🎉', `Pesanan ${id} berhasil dibuat. Kami akan segera konfirmasi.`, 'success');
    setIsBookingOpen(false);
    setBookItems([]);
    setBookingStep(1);
    setBookNote('');
  };

  const resetBooking = () => {
    setBookItems([]);
    setBookingStep(1);
    setBookNote('');
    setBookPerfume(PERFUMES[0]);
    setBookSpeed(0);
    setBookMethod(METHODS[0]);
    setIsBookingOpen(false);
  };

  // ---- Loyalty tier ----
  const tier = TIER_CONFIG[profile.tier] || TIER_CONFIG.Silver;
  const tierProgress = ((profile.points - tier.min) / (tier.max - tier.min)) * 100;

  // ---- History filter ----
  const filteredHistory = historyFilter === 'Semua'
    ? HISTORY_ORDERS
    : HISTORY_ORDERS.filter(o => o.type.includes(historyFilter));

  const toTitleCase = (t = '') => t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-[#313030] flex flex-col font-sans antialiased">
      <Toast isOpen={toast.isOpen} onClose={() => setToast(p => ({ ...p, isOpen: false }))}
        title={toast.title} message={toast.message} type={toast.type} />

      {/* Subtle brand glow */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#5f1340]/5 filter blur-[150px] pointer-events-none" />

      {/* ======================================================== */}
      {/* NAVBAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e0e0e0]/70 shadow-xs px-4 md:px-8 py-3">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between">
          <img src={waschenLogo} alt="Waschen" className="h-9 w-auto object-contain" />

          <div className="flex items-center gap-3">
            {/* Points badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#5f1340]/6 border border-[#5f1340]/10 rounded-full px-3.5 py-1.5 text-[11px] font-black text-[#5f1340]">
              <Star className="h-3.5 w-3.5 fill-[#5f1340] text-[#5f1340]" />
              <span>{profile.points.toLocaleString('id-ID')} Poin</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black border ${tier.badge}`}>{profile.tier}</span>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-[#e0e0e0] rounded-full hover:border-[#5f1340]/40 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5f1340] to-[#9b2459] flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-[#313030] hidden sm:block max-w-[100px] truncate">
                  {toTitleCase(profile.fullName)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#e0e0e0] overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-black text-[#313030]">{toTitleCase(profile.fullName)}</p>
                    <p className="text-[10px] text-slate-400">{profile.username}</p>
                  </div>
                  <button onClick={() => { setIsProfileOpen(false); navigate('/tracking'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#313030] hover:bg-slate-50 transition-colors">
                    <Search className="h-3.5 w-3.5 text-slate-400" />Lacak Cucian
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100">
                    <LogOut className="h-3.5 w-3.5" />Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] w-full mx-auto p-4 sm:p-6 md:p-8 flex-grow flex flex-col gap-6">

        {/* ======================================================== */}
        {/* HERO: WELCOME + LOYALTY CARD */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr_260px] gap-6 items-stretch">
          {/* Column 1: Physical Membership Card */}
          <div className="flex justify-center lg:justify-start w-full">
            <div className="relative w-full max-w-[480px] aspect-[1.586] rounded-3xl bg-gradient-to-br from-[#3d0825] via-[#4c0d32] to-[#2c0419] p-6 sm:p-7 text-white shadow-lg overflow-hidden flex flex-col justify-between select-none">
              {/* Concentric Gold Rings & Watermarks to match the physical card design */}
              <div className="absolute right-[12%] top-[60%] -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-tr from-[#9d7939] via-[#e5c98d] to-[#aa833e] opacity-85 blur-[0.3px] border border-[#e5c98d]/25 pointer-events-none shadow-md" />
              <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full border-3 border-[#e5c98d]/15 pointer-events-none animate-pulse-slow" />
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-[#e5c98d]/10 pointer-events-none" />
              <div className="absolute right-6 -bottom-12 w-28 h-28 rounded-full border-2 border-[#e5c98d]/10 pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-[#5f1340]/20 blur-xl pointer-events-none" />
              <div className="absolute left-10 bottom-[-50px] w-40 h-40 rounded-full bg-[#9b2459]/10 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full w-full">
                {/* Logo & Card Type */}
                <div className="flex justify-between items-center">
                  <img src={waschenLogoWhite} alt="Wäschen" className="h-8 sm:h-9 w-auto object-contain" />
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black tracking-widest text-[#e5c98d] uppercase block">
                      {profile.tier}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/55 tracking-wider block -mt-0.5">Member Card</span>
                  </div>
                </div>

                {/* Priority Club & Member Numbers */}
                <div className="my-auto py-2">
                  <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-white/70 block uppercase font-bold">PRIORITY CLUB</span>
                  <p className="text-xl sm:text-2xl font-mono tracking-[0.2em] text-white font-bold mt-0.5">2500 {String(profile.points).padStart(4, '0')} 109</p>
                  <h2 className="text-sm sm:text-base font-black tracking-wider text-white uppercase mt-1">{profile.fullName}</h2>
                </div>

                {/* Footer Dates */}
                <div className="flex gap-4 text-[9px] sm:text-[10px] text-white/40 font-mono uppercase">
                  <div>Valid Thru <span className="text-white/80 font-bold ml-0.5">06/29</span></div>
                  <div>Join Date <span className="text-white/80 font-bold ml-0.5">01/26</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Loyalty Points & Tier Progress */}
          <div className="bg-white rounded-3xl border border-[#e0e0e0] p-6 shadow-sm flex flex-col justify-between gap-4 w-full">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Poin Loyalitas</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black text-[#5f1340]">{profile.points.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] text-[#5f1340] font-extrabold uppercase">POIN</span>
                  </div>
                </div>
                <div className="p-3 bg-[#5f1340]/5 rounded-2xl">
                  <Award className="h-6 w-6 text-[#5f1340]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                Tingkatkan terus poin Anda untuk mengklaim berbagai promo eksklusif dan diskon layanan Waschen.
              </p>
            </div>

            {/* Tier Progress bar */}
            {tier.next && (
              <div className="pt-3.5 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#5f1340] text-[#5f1340]" /> {profile.tier} Member</span>
                  <span>{tier.next} dalam {(tier.max - profile.points).toLocaleString('id-ID')} poin</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#c5a059] to-[#e5c98d] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(3, tierProgress))}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 w-full">
            <div className="bg-white rounded-3xl border border-[#e0e0e0] p-5 flex flex-col justify-center shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pesanan Aktif</p>
              <p className="text-3xl font-black text-[#5f1340] mt-1">{ACTIVE_ORDERS.length}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Sedang diproses</p>
            </div>
            <div className="bg-white rounded-3xl border border-[#e0e0e0] p-5 flex flex-col justify-center shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Order</p>
              <p className="text-3xl font-black text-[#313030] mt-1">{profile.totalOrders}×</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Transaksi selesai</p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* QUICK ACTIONS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <ShoppingBag className="h-5 w-5" />, label: 'Booking Laundry', sub: 'Pesan Sekarang', color: 'bg-[#5f1340]/8 text-[#5f1340] group-hover:bg-[#5f1340]/15', action: () => setIsBookingOpen(true) },
            { icon: <Search className="h-5 w-5" />,      label: 'Lacak Cucian',   sub: 'Cek Progres',   color: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100', action: () => navigate('/tracking') },
            { icon: <Gift className="h-5 w-5" />,        label: 'Promo & Voucher', sub: 'Lihat Semua',  color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-100', action: () => document.getElementById('section-promo')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: <TrendingUp className="h-5 w-5" />,  label: 'Riwayat Order',  sub: 'Transaksi Lalu', color: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100', action: () => document.getElementById('section-history')?.scrollIntoView({ behavior: 'smooth' }) },
          ].map((q, i) => (
            <button key={i} onClick={q.action}
              className="bg-white border border-[#e0e0e0]/80 hover:border-slate-300 hover:shadow-md p-4 rounded-2xl transition-all duration-300 flex flex-col items-center text-center group transform hover:-translate-y-1 cursor-pointer">
              <div className={`p-3 rounded-2xl mb-2.5 transition-all duration-200 group-hover:scale-110 ${q.color}`}>{q.icon}</div>
              <span className="text-xs font-bold text-[#313030]">{q.label}</span>
              <span className="text-[9px] text-slate-400 mt-0.5 hidden sm:block">{q.sub}</span>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* ACTIVE ORDERS */}
        {/* ======================================================== */}
        {ACTIVE_ORDERS.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#313030] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#5f1340]" />Pesanan Aktif
              </h2>
              <button onClick={() => navigate('/tracking')}
                className="text-[11px] font-bold text-[#5f1340] hover:underline flex items-center gap-1">
                Lacak Semua <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {ACTIVE_ORDERS.map((o) => {
                const stepIdx = STATUS_STEPS.indexOf(o.status);
                const pct = STATUS_BAR[o.status] || 0;
                return (
                  <div key={o.id} className="bg-white rounded-2xl border border-[#e0e0e0] shadow-xs p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 font-mono">{o.id}</span>
                        <p className="text-sm font-black text-[#313030] mt-0.5">{o.service}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{o.speed} · Est: {o.estimasi}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${STATUS_COLORS[o.status]}`}>
                          <Clock className="h-3 w-3 animate-pulse" />{o.status}
                        </span>
                        <span className="text-sm font-black text-[#5f1340]">Rp {o.amount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    {/* Mini stepper */}
                    <div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-[#5f1340] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="grid grid-cols-5 text-[8px] font-extrabold text-slate-400 text-center">
                        {STATUS_STEPS.map((s, si) => (
                          <span key={s} className={si <= stepIdx ? 'text-[#5f1340] font-black' : ''}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => navigate('/tracking')}
                      className="self-end text-[11px] font-bold text-[#5f1340] hover:underline flex items-center gap-1">
                      Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROMO SECTION */}
        {/* ======================================================== */}
        <div id="section-promo" className="flex flex-col gap-4">
          <h2 className="text-sm font-black text-[#313030] flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#5f1340]" />Promo & Voucher Aktif
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {PROMOS.map((p) => (
              <div key={p.code} className={`flex-shrink-0 w-72 rounded-3xl bg-gradient-to-br ${p.color} text-white p-5 relative overflow-hidden shadow-md`}>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/8" />
                <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/8" />
                <div className="relative z-10 flex flex-col h-full gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 border border-white/20 px-2 py-0.5 rounded-full">{p.badge}</span>
                    <Tag className="h-4 w-4 text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-base font-black leading-tight">{p.title}</h3>
                    <p className="text-[11px] text-white/75 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider">Berlaku s/d</p>
                      <p className="text-[11px] font-black">{p.until}</p>
                    </div>
                    <button onClick={() => copyPromo(p.code)}
                      className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl px-3 py-1.5 text-[11px] font-black transition-all active:scale-95 cursor-pointer">
                      {copiedCode === p.code ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="font-mono">{p.code}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* HISTORY */}
        {/* ======================================================== */}
        <div id="section-history" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-black text-[#313030] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#5f1340]" />Riwayat Transaksi
            </h2>
            <div className="flex gap-1.5">
              {['Semua','Kiloan','Satuan'].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${historyFilter === f ? 'bg-[#5f1340] text-white border-[#5f1340] shadow-sm' : 'bg-white text-slate-500 border-[#e0e0e0] hover:border-slate-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-xs overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm font-semibold">Belum ada riwayat transaksi</div>
            ) : (
              filteredHistory.map((o, idx) => (
                <div key={o.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 ${idx !== filteredHistory.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/60 transition-colors`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-black text-slate-400">{o.id}</p>
                      <p className="text-xs font-black text-[#313030] mt-0.5">{o.service}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{o.date} · {o.speed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 pl-12 sm:pl-0">
                    <div className="text-right">
                      <p className="text-xs font-black text-[#313030]">Rp {o.amount.toLocaleString('id-ID')}</p>
                      <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end mt-0.5">
                        <Star className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />+{o.pointsEarned} poin
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {o.payStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 pb-4">
          &copy; {new Date().getFullYear()} PT Waschen Alora Indonesia. All rights reserved.
        </div>
      </main>

      {/* ======================================================== */}
      {/* BOOKING MODAL */}
      {/* ======================================================== */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#e0e0e0] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>

            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-[#5f1340]">
              <div className="flex items-center gap-2 text-white">
                <ShoppingBag className="h-4.5 w-4.5" />
                <h3 className="text-sm font-black">Booking Laundry</h3>
                <span className="text-[10px] bg-white/15 border border-white/20 px-2 py-0.5 rounded-full font-bold">
                  Step {bookingStep}/3
                </span>
              </div>
              <button onClick={resetBooking} className="text-white/70 hover:text-white p-1 cursor-pointer transition-colors">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">

              {/* === STEP 1: Pilih Layanan === */}
              {bookingStep === 1 && (
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Kategori Layanan</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Kiloan','Satuan'].map(cat => (
                        <button key={cat} onClick={() => { setBookCategory(cat); setBookItems([]); }}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${bookCategory === cat ? 'border-[#5f1340] bg-[#5f1340]/5 text-[#5f1340]' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                          {cat === 'Kiloan' ? <Weight className="h-5 w-5" /> : <Shirt className="h-5 w-5" />}
                          <span className="text-xs font-black">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Pilih Item Layanan</p>
                    <div className="flex flex-col gap-2">
                      {getServiceList().map(svc => {
                        const selected = bookItems.find(i => i.id === svc.id);
                        return (
                          <div key={svc.id} onClick={() => toggleBookItem(svc)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-[#5f1340] bg-[#5f1340]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-[#5f1340] bg-[#5f1340]' : 'border-slate-300'}`}>
                                {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#313030]">{svc.name}</p>
                                <p className="text-[10px] text-slate-400">Rp {svc.price.toLocaleString('id-ID')} / {svc.unit}</p>
                              </div>
                            </div>
                            {selected && (
                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <button onClick={() => updateQty(svc.id, svc.unit==='Kg' ? -0.5 : -1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs cursor-pointer">−</button>
                                <span className="text-xs font-black w-8 text-center text-[#5f1340]">{selected.qty} {svc.unit}</span>
                                <button onClick={() => updateQty(svc.id, svc.unit==='Kg' ? 0.5 : 1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs cursor-pointer">+</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* === STEP 2: Detail Pesanan === */}
              {bookingStep === 2 && (
                <div className="p-5 flex flex-col gap-4">
                  {/* Parfum */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Pilih Parfum</p>
                    <div className="flex flex-wrap gap-2">
                      {PERFUMES.map(pf => (
                        <button key={pf} onClick={() => setBookPerfume(pf)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${bookPerfume === pf ? 'border-[#5f1340] bg-[#5f1340]/5 text-[#5f1340]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          <Droplets className="h-3 w-3" />{pf}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Speed */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Kecepatan Pengerjaan</p>
                    <div className="flex flex-col gap-2">
                      {SPEEDS.map((sp, si) => (
                        <button key={si} onClick={() => setBookSpeed(si)}
                          className={`flex justify-between items-center p-3 rounded-xl border-2 text-xs cursor-pointer transition-all ${bookSpeed === si ? 'border-[#5f1340] bg-[#5f1340]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <Zap className={`h-4 w-4 ${bookSpeed === si ? 'text-[#5f1340]' : 'text-slate-400'}`} />
                            <span className="font-bold text-[#313030]">{sp.label}</span>
                          </div>
                          {sp.surcharge > 0 && <span className="text-[10px] text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">+{sp.surcharge*100}%</span>}
                          {sp.surcharge === 0 && <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Normal</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Method */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Metode Pengiriman</p>
                    <div className="flex flex-col gap-2">
                      {METHODS.map(m => (
                        <button key={m} onClick={() => setBookMethod(m)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-xs cursor-pointer transition-all ${bookMethod === m ? 'border-[#5f1340] bg-[#5f1340]/5 text-[#5f1340]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          <Truck className="h-4 w-4 flex-shrink-0" />
                          <span className="font-bold">{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Catatan Tambahan (opsional)</p>
                    <textarea value={bookNote} onChange={e => setBookNote(e.target.value)} rows={2}
                      placeholder="Misal: ada noda membandel di baju no.2, tolong diperhatikan..."
                      className="w-full border border-[#e0e0e0] rounded-xl px-3.5 py-2.5 text-xs text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] resize-none" />
                  </div>
                </div>
              )}

              {/* === STEP 3: Konfirmasi === */}
              {bookingStep === 3 && (
                <div className="p-5 flex flex-col gap-4">
                  <div className="bg-[#5f1340]/4 border border-[#5f1340]/10 rounded-2xl p-4 flex flex-col gap-3">
                    <p className="text-[10px] font-black text-[#5f1340] uppercase tracking-wider">Ringkasan Pesanan</p>
                    {/* Items */}
                    <div className="flex flex-col gap-1.5">
                      {bookItems.map(i => (
                        <div key={i.id} className="flex justify-between text-xs font-semibold text-[#313030]">
                          <span>{i.name} ({i.qty} {i.unit})</span>
                          <span className="font-black">Rp {(i.price * i.qty).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-[#5f1340]/10" />
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Parfum</span><span className="font-bold text-[#313030]">{bookPerfume}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Kecepatan</span><span className="font-bold text-[#313030]">{SPEEDS[bookSpeed].label}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Metode</span><span className="font-bold text-[#313030]">{bookMethod}</span>
                    </div>
                    <div className="h-px bg-[#5f1340]/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-500">TOTAL ESTIMASI</span>
                      <span className="text-xl font-black text-[#5f1340]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    {speedSurcharge > 0 && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 font-semibold">
                        ⚡ Sudah termasuk surcharge kecepatan +{speedSurcharge*100}%
                      </p>
                    )}
                  </div>
                  {bookNote && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 font-medium">
                      <span className="font-black text-slate-500 block mb-0.5">Catatan:</span>{bookNote}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Pesanan ini bersifat booking estimasi. Tim Waschen akan mengonfirmasi dan menghubungi Anda untuk detail selanjutnya.
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer / step navigation */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2.5">
              {bookingStep > 1 && (
                <button onClick={() => setBookingStep(s => s - 1)}
                  className="flex-1 py-2.5 border border-[#e0e0e0] rounded-xl text-xs font-bold text-[#313030] hover:bg-slate-100 transition-all cursor-pointer">
                  ← Kembali
                </button>
              )}
              {bookingStep < 3 && (
                <button
                  disabled={bookingStep === 1 && bookItems.length === 0}
                  onClick={() => setBookingStep(s => s + 1)}
                  className="flex-1 py-2.5 bg-[#5f1340] hover:bg-[#4a0d31] disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all cursor-pointer">
                  Lanjut →
                </button>
              )}
              {bookingStep === 3 && (
                <button onClick={submitBooking}
                  className="flex-1 py-2.5 bg-[#5f1340] hover:bg-[#4a0d31] text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />Konfirmasi Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
