import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, AlertCircle, CheckCircle2, ChevronLeft
} from 'lucide-react';
import Toast from '../../components/Toast.jsx';

// Import local images from assets/images
import img1 from '../../assets/images/1.png';
import img2 from '../../assets/images/2.png';
import img3 from '../../assets/images/3.png';
import img4 from '../../assets/images/4.png';
import img5 from '../../assets/images/5.png';
import img6 from '../../assets/images/6.png';
import img7 from '../../assets/images/7.png';
import img8 from '../../assets/images/8.png';
import waschenLogo from '../../assets/images/waschen.png';
import maskotHappyLogo from '../../assets/images/maskot_happy.png';

const SLIDES = [
    {
        img: img1,
        title: 'Welcome to Waschen Laundry',
        caption: 'Every guest is greeted with warmth and the Waschen standard of hospitality.',
        tag: 'Total Care For Happy Life'
    },
    {
        img: img2,
        title: 'Certified Hygiene Standards',
        caption: 'Using state-of-the-art equipment and environmentally friendly detergent formulas.',
        tag: 'Hygiene Operations'
    },
    {
        img: img3,
        title: 'Eco-friendly & Safe Solutions',
        caption: 'Using environmentally friendly chemicals and processes to protect your health.',
        tag: 'Eco-friendly & Safe Solutions'
    },
    {
        img: img4,
        title: 'Customer Satisfaction',
        caption: 'Ensuring maximum satisfaction through quality and service.',
        tag: 'Customer Satisfaction'
    },
    {
        img: img5,
        title: 'Quality & Technology',
        caption: 'Experience the perfect blend of quality and technology in every Wash.',
        tag: 'Quality & Technology'
    },
    {
        img: img6,
        title: 'VIP Laundry',
        caption: 'Dedicated service with fast response and a personal touch.',
        tag: 'VIP Laundry'
    },
    {
        img: img7,
        title: 'Ready to Wear',
        caption: 'Garments returned clean, pressed, and carefully packed for a premium finish.',
        tag: 'Finishing & Packing'
    },
    {
        img: img8,
        title: 'Professional Finishing',
        caption: 'Steam-pressed to perfection so every piece looks crisp and ready to wear.',
        tag: 'Garment Care'
    }
];

export default function RegisterPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Registrasi Member | My Waschen';
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setErrorMsg('Semua field wajib diisi (kecuali no. telp)');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        fullName,
        email,
        username,
        password,
        phone
      });

      if (response.data && response.data.success) {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2500);
      } else {
        throw new Error(response.data?.message || 'Registrasi gagal');
      }
    } catch (err) {
      console.error(err);
      const apiError = err.response?.data?.message || 'Terjadi kesalahan jaringan atau Username/Email sudah terdaftar';
      setErrorMsg(apiError);
      setToast({ isOpen: true, title: 'Registrasi Gagal', message: apiError, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex overflow-hidden font-sans">
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs sm:max-w-sm w-full border border-[#e0e0e0] flex flex-col items-center text-center animate-fade-in text-[#313030]">
            <img
              src={maskotHappyLogo}
              alt="Success"
              className="h-36 w-auto object-contain mb-4 animate-bounce-short"
            />
            <h3 className="text-base font-bold text-emerald-650 mb-2 flex items-center gap-1.5 justify-center">
              Registrasi Berhasil!
              <Sparkles className="h-4.5 w-4.5 text-yellow-500 animate-pulse" />
            </h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed font-semibold">
              Akun Anda telah berhasil dibuat. Silakan login ke portal.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold justify-center">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Mengarahkan ke halaman login...</span>
            </div>
          </div>
        </div>
      )}

      {/* LEFT PANEL: Hero Carousel (Desktop Only, 55% Visual Weight) */}
      <div className="hidden lg:flex lg:w-[55%] relative text-white flex-col justify-between pt-12 px-12 pb-6 overflow-hidden bg-[#3d0728]">
        {/* Background Images with transitions */}
        <div className="absolute inset-0 z-0 bg-[#3d0728]">
          {SLIDES.map((slide, index) => (
            <img
              key={index}
              src={slide.img}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${
                index === currentSlide ? 'opacity-90 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Dark Plum Overlay - Subtle & Translucent */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d0728]/95 via-[#5f1340]/40 to-[#5f1340]/30 z-5"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <img src={waschenLogo} alt="Waschen Laundry Logo" className="h-16 w-auto object-contain" />
        </div>

        {/* Carousel Slide (Aligned to Bottom) */}
        <div className="relative z-10 mt-auto mb-0 pt-10">
          {/* Tag / Accent */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#f8f8f8]/80 block mb-3">
            {SLIDES[currentSlide].tag}
          </span>

          <div className="overflow-hidden min-h-[90px]">
            {SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-y-0 relative block'
                    : 'opacity-0 translate-y-2 absolute hidden'
                }`}
              >
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {slide.title}
                </h2>
                <p className="text-xs text-[#f8f8f8]/80 mt-2 leading-relaxed max-w-md">
                  {slide.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2.5 mt-6">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form (Desktop, 45% Visual Weight) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-16 lg:px-14 xl:px-20 py-12 relative bg-[#f8f8f8] overflow-y-auto">
        <button
          onClick={() => navigate('/login')}
          className="absolute top-6 left-6 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#5f1340] transition-colors cursor-pointer"
        >
        </button>

        <div className="mb-6 w-full max-w-md mx-auto text-left mt-8">
          <h2 className="text-xl font-bold text-[#313030] tracking-tight flex items-center gap-2">
            Gabung Member
            <Sparkles className="h-4 w-4 text-[#5f1340]" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar sekarang untuk mengumpulkan poin, klaim diskon, dan booking laundry.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full max-w-md mx-auto mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="w-full max-w-md mx-auto space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
              Nama Lengkap
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contoh@domain.com"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
              />
            </div>
          </div>

          {/* Username & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="budi_s"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
                Nomor Telepon
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0812xxxxxx"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1">
              Konfirmasi Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all text-xs shadow-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative py-2.5 px-4 bg-[#5f1340] hover:bg-[#4a0d31] disabled:bg-slate-400 text-white rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 group transition-all duration-300 overflow-hidden cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="w-full max-w-md mx-auto text-center mt-6">
          <p className="text-xs text-slate-500">
            Sudah punya akun?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-[#5f1340] hover:underline cursor-pointer"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
