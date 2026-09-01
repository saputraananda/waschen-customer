import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Camera,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Package,
  Calendar,
  X,
  AlertCircle,
  TrendingUp,
  Tag,
  Hash,
  ChevronRight
} from 'lucide-react';
import Toast from '../components/Toast.jsx';
import waschenLogo from '../assets/images/waschen.png';

// Detailed Mock database containing items mix (Kiloan and Satuan) for each receipt
const TRACKING_DB = {
  'WS-0824001': {
    id: 'WS-0824001',
    customerName: 'Budi Santoso',
    perfume: 'Sakura Premium',
    speed: 'Reguler (2 Hari)',
    amount: 80000,
    paymentStatus: 'Lunas',
    paymentMethod: 'Tunai',
    currentStatus: 'Selesai',
    date: '12 Aug 2026, 10:30',
    items: [
      { id: 1, name: 'Pakaian Harian (Cuci + Setrika)', type: 'Kiloan', qty: '4.5 Kg', price: 45000, status: 'Selesai' },
      { id: 2, name: 'Jas Setelan Wool (Dry Clean)', type: 'Satuan', qty: '1 Pcs', price: 35000, status: 'Selesai' }
    ],
    history: [
      { status: 'Order Dibuat', time: '10 Aug 2026, 10:30', completed: true },
      { status: 'Pencucian Selesai', time: '10 Aug 2026, 15:45', completed: true },
      { status: 'Penyetrikaan Selesai', time: '11 Aug 2026, 09:15', completed: true },
      { status: 'Siap Diambil', time: '11 Aug 2026, 10:00', completed: true },
      { status: 'Sudah Diambil (Selesai)', time: '12 Aug 2026, 10:30', completed: true }
    ]
  },
  'WS-0824002': {
    id: 'WS-0824002',
    customerName: 'Siti Rahma',
    perfume: 'Lavender Calm',
    speed: 'Kilat (24 Jam)',
    amount: 79000,
    paymentStatus: 'Belum Lunas',
    paymentMethod: '-',
    currentStatus: 'Pencucian',
    date: '12 Aug 2026, 11:15',
    items: [
      { id: 1, name: 'Bed Cover King Size', type: 'Satuan', qty: '1 Pcs', price: 35000, status: 'Pencucian' },
      { id: 2, name: 'Selimut Bulu Lembut', type: 'Satuan', qty: '1 Pcs', price: 20000, status: 'Antrean' },
      { id: 3, name: 'Handuk Mandi Dewasa', type: 'Satuan', qty: '2 Pcs', price: 24000, status: 'Selesai' }
    ],
    history: [
      { status: 'Order Dibuat', time: '12 Aug 2026, 11:15', completed: true },
      { status: 'Pencucian Handuk Selesai', time: '12 Aug 2026, 13:00', completed: true },
      { status: 'Proses Cuci Bed Cover (Pencucian)', time: '12 Aug 2026, 14:15', completed: true },
      { status: 'Penyetrikaan', time: '-', completed: false },
      { status: 'Siap Diambil', time: '-', completed: false }
    ]
  },
  'WS-0824003': {
    id: 'WS-0824003',
    customerName: 'Andi Wijaya',
    perfume: 'Lily Sweet',
    speed: 'Express (6 Jam)',
    amount: 61000,
    paymentStatus: 'Lunas',
    paymentMethod: 'QRIS Gopay',
    currentStatus: 'Antrean',
    date: '12 Aug 2026, 13:00',
    items: [
      { id: 1, name: 'Pakaian Harian (Cuci Saja)', type: 'Kiloan', qty: '3.0 Kg', price: 21000, status: 'Antrean' },
      { id: 2, name: 'Sepatu Sneaker Premium', type: 'Satuan', qty: '1 Pcs', price: 40000, status: 'Antrean' }
    ],
    history: [
      { status: 'Order Dibuat (Masuk Antrean)', time: '12 Aug 2026, 13:00', completed: true },
      { status: 'Pencucian', time: '-', completed: false },
      { status: 'Penyetrikaan', time: '-', completed: false },
      { status: 'Siap Diambil', time: '-', completed: false }
    ]
  },
  'WS-0824004': {
    id: 'WS-0824004',
    customerName: 'Dewi Lestari',
    perfume: 'Tanpa Parfum',
    speed: 'Reguler (2 Hari)',
    amount: 61000,
    paymentStatus: 'Lunas',
    paymentMethod: 'Transfer BCA',
    currentStatus: 'Penyetrikaan',
    date: '11 Aug 2026, 16:45',
    items: [
      { id: 1, name: 'Jas Blazer Wanita', type: 'Satuan', qty: '1 Pcs', price: 45000, status: 'Penyetrikaan' },
      { id: 2, name: 'Kemeja Katun Putih', type: 'Satuan', qty: '2 Pcs', price: 16000, status: 'Selesai' }
    ],
    history: [
      { status: 'Order Dibuat', time: '11 Aug 2026, 16:45', completed: true },
      { status: 'Kemeja Selesai Penyetrikaan', time: '12 Aug 2026, 08:30', completed: true },
      { status: 'Jas Sedang Disetrika (Penyetrikaan)', time: '12 Aug 2026, 14:00', completed: true },
      { status: 'Siap Diambil', time: '-', completed: false }
    ]
  },
  'WS-0824005': {
    id: 'WS-0824005',
    customerName: 'Eko Prasetyo',
    perfume: 'Lavender Calm',
    speed: 'Reguler (2 Hari)',
    amount: 92000,
    paymentStatus: 'Belum Lunas',
    paymentMethod: '-',
    currentStatus: 'Siap Diambil',
    date: '11 Aug 2026, 14:20',
    items: [
      { id: 1, name: 'Pakaian Harian (Cuci + Setrika)', type: 'Kiloan', qty: '5.2 Kg', price: 52000, status: 'Siap Diambil' },
      { id: 2, name: 'Gordyn Rumah Tebal', type: 'Satuan', qty: '2 Pcs', price: 40000, status: 'Siap Diambil' }
    ],
    history: [
      { status: 'Order Dibuat', time: '11 Aug 2026, 14:20', completed: true },
      { status: 'Pencucian Kiloan & Gordyn Selesai', time: '11 Aug 2026, 18:30', completed: true },
      { status: 'Penyetrikaan & Finishing Selesai', time: '12 Aug 2026, 10:15', completed: true },
      { status: 'Semua Item Siap Diambil', time: '12 Aug 2026, 11:00', completed: true }
    ]
  }
};

const STATUS_STEPS = [
  { name: 'Antrean', key: 'Antrean', percent: 20 },
  { name: 'Pencucian', key: 'Pencucian', percent: 45 },
  { name: 'Penyetrikaan', key: 'Penyetrikaan', percent: 70 },
  { name: 'Siap Diambil', key: 'Siap Diambil', percent: 90 },
  { name: 'Selesai', key: 'Selesai', percent: 100 }
];

const STATUS_THEMES = {
  'Antrean': { bg: 'bg-slate-100 border-slate-200 text-slate-500', bar: 'bg-slate-300' },
  'Pencucian': { bg: 'bg-[#5f1340]/10 border-[#5f1340]/15 text-[#5f1340]', bar: 'bg-[#5f1340]' },
  'Penyetrikaan': { bg: 'bg-indigo-50 border-indigo-100 text-indigo-700', bar: 'bg-indigo-650' },
  'Siap Diambil': { bg: 'bg-amber-50 border-amber-100 text-amber-700', bar: 'bg-amber-600' },
  'Selesai': { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', bar: 'bg-emerald-600' }
};

export default function CustomerTrackingPage() {
  const navigate = useNavigate();
  const [notaNumber, setNotaNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') => {
    setToast({ isOpen: true, title, message, type });
  };

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    if (!notaNumber.trim()) {
      showToast('Input Kosong', 'Harap masukkan nomor nota terlebih dahulu.', 'error');
      return;
    }

    const order = TRACKING_DB[notaNumber.trim().toUpperCase()];
    if (order) {
      setTrackedOrder(order);
      showToast('Nota Ditemukan', `Berhasil memuat rincian pelacakan nota ${order.id}`, 'success');
    } else {
      setTrackedOrder(null);
      showToast('Tidak Ditemukan', `Nota "${notaNumber}" tidak terdaftar di sistem kami.`, 'error');
    }
  };

  const handleQuickScan = (scannedCode) => {
    setNotaNumber(scannedCode);
    setIsScannerOpen(false);
    
    const order = TRACKING_DB[scannedCode];
    if (order) {
      setTrackedOrder(order);
      showToast('Scan Sukses', `Nota ${scannedCode} berhasil di-scan`, 'success');
    }
  };

  const getStepPercentage = (status) => {
    const step = STATUS_STEPS.find(s => s.key === status);
    return step ? step.percent : 0;
  };

  const getActiveStepIndex = (status) => {
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] text-[#313030] flex flex-col font-sans antialiased">
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      {/* Subtle brand glow elements */}
      <div className="absolute top-[-250px] left-[-250px] w-[500px] h-[500px] rounded-full bg-[#5f1340]/4 filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-250px] right-[-250px] w-[500px] h-[500px] rounded-full bg-[#5f1340]/3 filter blur-[150px] pointer-events-none" />

      {/* Header navbar */}
      <header className="relative z-20 bg-white border-b border-[#e0e0e0]/60 shadow-xs px-4 md:px-8 py-4">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="p-2 rounded-xl text-slate-400 hover:text-[#5f1340] hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center gap-1.5 font-black text-xs cursor-pointer"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Login Portal</span>
            </button>
            <div className="h-6 w-[1px] bg-[#e0e0e0]" />
            <img src={waschenLogo} alt="Waschen Logo" className="h-8 md:h-9 w-auto object-contain" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#5f1340]/5 border border-[#5f1340]/10 rounded-full px-3.5 py-1 text-xs font-bold text-[#5f1340] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Customer Tracking Portal</span>
          </div>
        </div>
      </header>

      {/* Full-width responsive main grid */}
      <main className="relative z-10 max-w-[1400px] w-full mx-auto p-4 sm:p-6 md:p-8 flex-grow flex flex-col gap-6">
        
        {/* Search Panel Card */}
        <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-[#5f1340] tracking-tight">Lacak Progres Cucian Anda</h2>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Masukkan Nomor Nota (contoh: <strong className="text-[#5f1340]">WS-0824001</strong> sampai <strong className="text-[#5f1340]">WS-0824005</strong>) atau scan QR pada nota untuk memantau progres pengerjaan cucian Anda secara real-time.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={notaNumber}
                onChange={(e) => setNotaNumber(e.target.value)}
                placeholder="Ketik Nomor Nota..."
                className="w-full bg-white border border-[#e0e0e0] focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold text-[#313030] shadow-xs outline-hidden uppercase font-mono"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="h-4.5 w-4.5" />
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
              className="py-3.5 px-6 bg-[#5f1340] hover:bg-[#4d0f33] text-white text-xs font-black rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lacak Cucian</span>
            </button>
          </form>
        </div>

        {/* Tracking Details Result Grid */}
        {trackedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Left 2 Columns: Main Stepper Progress and Items List */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Card 1: Overall Progress Stepper */}
              <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-xs p-6 sm:p-8 flex flex-col gap-6">
                
                {/* Order Header Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nomor Nota Pelanggan</span>
                    <span className="text-xl font-black text-[#5f1340] font-mono block mt-0.5">{trackedOrder.id}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Status Keseluruhan Nota</span>
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-extrabold text-xs mt-1 border ${
                      STATUS_THEMES[trackedOrder.currentStatus]?.bg || 'bg-slate-100 text-slate-500'
                    }`}>
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      {trackedOrder.currentStatus}
                    </span>
                  </div>
                </div>

                {/* Stepper Timeline Progress */}
                <div className="py-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-6">Timeline Progres Keseluruhan</span>
                  
                  {/* Stepper Row */}
                  <div className="relative flex justify-between items-center w-full px-2">
                    
                    {/* Connector line behind */}
                    <div className="absolute left-0 right-0 h-1 bg-slate-100 top-4.5 z-0 rounded-full mx-6">
                      <div 
                        className="h-full bg-[#5f1340] transition-all duration-500 rounded-full" 
                        style={{ width: `${(getActiveStepIndex(trackedOrder.currentStatus) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Steps circles */}
                    {STATUS_STEPS.map((step, idx) => {
                      const stepIndex = getActiveStepIndex(trackedOrder.currentStatus);
                      const isCompleted = idx <= stepIndex;
                      const isActive = idx === stepIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center z-10 relative">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? 'bg-[#5f1340] border-[#5f1340] text-white shadow-xs' 
                              : 'bg-white border-[#e0e0e0] text-slate-350'
                          } ${isActive ? 'ring-4 ring-[#5f1340]/20 scale-105' : ''}`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4.5 w-4.5" />
                            ) : (
                              <span className="text-xs font-black">{idx + 1}</span>
                            )}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-extrabold mt-2.5 text-center max-w-[80px] leading-tight ${
                            isCompleted ? 'text-[#5f1340]' : 'text-slate-400'
                          }`}>
                            {step.name}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>

              {/* Card 2: Items Breakdown List (Mixed Kiloan & Satuan detail) */}
              <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-xs p-6 sm:p-8 flex flex-col gap-5">
                <div>
                  <h3 className="text-md font-black text-[#5f1340] tracking-tight">Rincian Item & Progres Pengerjaan</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Progres detail dari masing-masing item cucian di dalam nota ini.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {trackedOrder.items.map((item, idx) => {
                    const stepIdx = getActiveStepIndex(item.status);
                    const percentVal = getStepPercentage(item.status);
                    const theme = STATUS_THEMES[item.status] || { bar: 'bg-slate-300', bg: 'bg-slate-50' };

                    return (
                      <div 
                        key={item.id} 
                        className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-4 hover:border-slate-200 transition-colors"
                      >
                        {/* Item Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono">
                              #{idx + 1}
                            </span>
                            <h4 className="text-xs font-black text-[#313030]">{item.name}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              item.type === 'Kiloan' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-left sm:text-right">
                              <span className="text-[9px] text-slate-400 block uppercase font-bold">Jumlah</span>
                              <span className="text-xs font-extrabold text-slate-700">{item.qty}</span>
                            </div>
                            <div className="text-left sm:text-right pl-4 border-l border-slate-200">
                              <span className="text-[9px] text-slate-400 block uppercase font-bold">Subtotal</span>
                              <span className="text-xs font-extrabold text-[#5f1340]">Rp {item.price.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Progress Mini Stepper track */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Langkah Pengerjaan Item:</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${theme.bg}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Progress slider bar indicator */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
                            <div className={`h-full ${theme.bar} transition-all duration-550`} style={{ width: `${percentVal}%` }} />
                          </div>

                          {/* Miniature status points */}
                          <div className="grid grid-cols-5 text-center mt-1 text-[8px] font-extrabold text-slate-400">
                            {STATUS_STEPS.map((s, sIdx) => {
                              const done = sIdx <= stepIdx;
                              return (
                                <span 
                                  key={s.key} 
                                  className={`truncate px-0.5 ${done ? 'text-[#5f1340] font-black' : 'text-slate-350'}`}
                                >
                                  {s.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Transaction detail summary & Activity Log */}
            <div className="flex flex-col gap-6">
              
              {/* Card 3: Pricing & Transaction Summary */}
              <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-xs p-6 flex flex-col gap-4">
                <h4 className="text-xs font-black text-[#5f1340] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar className="h-4 w-4" />
                  Rincian Transaksi & Nota
                </h4>

                <div className="flex flex-col gap-2 text-xs font-semibold text-slate-650">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nama Pelanggan</span>
                    <span className="font-extrabold text-[#313030]">{trackedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanggal Masuk</span>
                    <span className="font-bold text-[#313030]">{trackedOrder.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durasi / Paket</span>
                    <span className="font-bold text-[#313030]">{trackedOrder.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parfum Pilihan</span>
                    <span className="font-bold text-[#313030]">{trackedOrder.perfume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Metode Bayar</span>
                    <span className="font-bold text-[#313030]">{trackedOrder.paymentMethod}</span>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status Pembayaran</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border ${
                      trackedOrder.paymentStatus === 'Lunas' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {trackedOrder.paymentStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-slate-400 text-xs">Total Pembayaran</span>
                    <span className="text-lg font-black text-[#5f1340]">Rp {trackedOrder.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Detailed Activity Logs */}
              <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-xs p-6 flex flex-col gap-4">
                <h4 className="text-xs font-black text-[#5f1340] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <TrendingUp className="h-4 w-4" />
                  Log Aktivitas Cucian
                </h4>

                <div className="flex flex-col gap-4 pl-1">
                  {trackedOrder.history.map((log, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${log.completed ? 'bg-[#5f1340]' : 'bg-slate-350'}`} />
                        {idx !== trackedOrder.history.length - 1 && <div className="w-[1px] bg-slate-200 flex-grow min-h-[22px]" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`font-bold block text-xs leading-tight ${log.completed ? 'text-[#313030]' : 'text-slate-400'}`}>
                          {log.status}
                        </span>
                        {log.completed && <span className="text-[10px] text-slate-400 mt-0.5 block">{log.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty placeholder state */
          <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-md p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-full">
              <Package className="h-10 w-10 text-[#5f1340]" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="text-sm font-black text-[#5f1340] uppercase tracking-wider">Belum Ada Nota Yang Dilacak</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Ketik nomor nota Anda pada form pencarian di atas atau gunakan kamera scanner untuk memuat rincian status progres cucian laundry Anda.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Simulator Modal for Barcode/QR Code Scanner */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-[#e0e0e0] shadow-2xl p-6 max-w-md w-full flex flex-col gap-4 text-[#313030]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#5f1340]" />
                <h3 className="text-sm font-black text-[#5f1340] uppercase tracking-wider">Simulasi QR Scanner</h3>
              </div>
              <button 
                onClick={() => setIsScannerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mock Camera Viewfinder */}
            <div className="relative bg-slate-900 aspect-video rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border border-slate-800">
              
              {/* Scan box grid overlay */}
              <div className="absolute w-24 h-24 border-2 border-[#5f1340] border-dashed rounded-lg animate-pulse flex items-center justify-center z-10" />
              <div className="absolute inset-0 bg-slate-950/40 z-5" />

              <div className="text-center p-4 z-10 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-bold text-slate-350 tracking-wider block mt-1">MENYAMBUNGKAN KAMERA...</span>
              </div>
            </div>

            {/* Clickable quick test buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Klik untuk simulasi scan nota:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TRACKING_DB).map(id => (
                  <button
                    key={id}
                    onClick={() => handleQuickScan(id)}
                    className="p-2.5 text-xs font-mono font-bold bg-[#5f1340]/5 hover:bg-[#5f1340]/10 border border-[#5f1340]/20 hover:border-[#5f1340]/40 text-[#5f1340] rounded-xl transition-all cursor-pointer text-center"
                  >
                    Scan {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsScannerOpen(false)}
              className="w-full py-2.5 border border-[#e0e0e0] text-[#313030] hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer mt-1"
            >
              Batal Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}