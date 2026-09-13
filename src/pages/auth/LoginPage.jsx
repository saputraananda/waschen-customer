import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Lock,
    ArrowRight,
    AlertCircle,
    Eye,
    EyeOff,
    X,
    Phone,
    Search
} from 'lucide-react';
import Toast from '../../components/Toast.jsx';
import InstallPwaButton from '../../components/InstallPwaButton.jsx';

// Import local images from assets/images
import img1 from '../../assets/images/1.png';
import img2 from '../../assets/images/2.png';
import img3 from '../../assets/images/3.png';
import img4 from '../../assets/images/4.png';
import img5 from '../../assets/images/5.png';
import img6 from '../../assets/images/6.png';
import waschenLogo from '../../assets/images/waschen.png';
import waschenLogoWhite from '../../assets/images/waschen_white.png';
import maskotLogo from '../../assets/images/maskot.png';
import maskotSadLogo from '../../assets/images/maskot_sad.png';
import maskotHappyLogo from '../../assets/images/maskot_happy.png';

const SLIDES = [
    {
        img: img1,
        title: 'Premium Quality Services',
        caption: 'Delivering the highest hygiene standards for customer satisfaction.',
        tag: 'Quality Standards'
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
    }
];

export default function LoginPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [welcomeName, setWelcomeName] = useState('');

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    const navigate = useNavigate();

    // Set document title & Carousel timer
    useEffect(() => {
        document.title = 'Login | My Waschen';
        const id = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 4500);
        return () => clearInterval(id);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!username.trim() || !password.trim()) {
            setErrorMsg('Username/Email and password cannot be empty');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/api/auth/login', { username, password });

            if (response.data && response.data.success) {
                const { token, user } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('username', user.username);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('fullName', user.fullName);
                localStorage.setItem('employeeId', user.employeeId || '');
                localStorage.setItem('position', user.position || '');
                localStorage.setItem('department', user.department || '');
                localStorage.setItem('profilePath', user.profilePath || '');
                localStorage.setItem('companyId', user.companyId || '');
                const isHq = String(user.companyId) === '1';
                localStorage.setItem('activeRole', isHq ? 'Management' : (user.assignedRole || 'Frontliner'));

                const outlets = response.data.outlets || [];
                localStorage.setItem('outlets', JSON.stringify(outlets));

                if (isHq) {
                    if (outlets.length > 0) {
                        localStorage.setItem('activeOutletId', outlets[0].id);
                        localStorage.setItem('activeOutletName', outlets[0].full_name || outlets[0].name);
                    } else {
                        localStorage.setItem('activeOutletId', '');
                        localStorage.setItem('activeOutletName', 'Outlet Waschen');
                    }
                } else {
                    localStorage.setItem('activeOutletId', user.assignedOutletId || '');
                    localStorage.setItem('activeOutletName', user.assignedOutletName || 'Outlet Waschen');
                }

                setWelcomeName(user.fullName || user.username);
                setIsSuccessModalOpen(true);

                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2500);
            } else {
                throw new Error(response.data?.message || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            const apiError = err.response?.data?.message || 'Server connection failed or incorrect password';
            setErrorMsg(apiError);
            setIsErrorModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const toTitleCase = (text = "") =>
        text
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <div className="relative min-h-screen bg-white flex overflow-hidden font-sans">
            <Toast
                isOpen={toast.isOpen}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
                title={toast.title}
                message={toast.message}
                type={toast.type}
            />

            {/* Error Modal with Sad Mascot */}
            {isErrorModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs sm:max-w-sm w-full border border-[#e0e0e0] flex flex-col items-center text-center animate-fade-in text-[#313030]">
                        <img
                            src={maskotSadLogo}
                            alt="Mascot Sad"
                            className="h-36 w-auto object-contain mb-4 drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] select-none"
                        />
                        <h3 className="text-base font-bold text-[#5f1340] mb-2 font-sans">Login Gagal</h3>
                        <p className="text-sm text-slate-650 mb-5 leading-relaxed font-semibold font-sans">
                            Username atau password Anda tidak sesuai.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsErrorModalOpen(false)}
                            className="w-full py-3 sm:py-2.5 bg-[#5f1340] hover:bg-[#4a0d31] text-white font-semibold rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Success Modal with Happy Mascot */}
            {isSuccessModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs sm:max-w-sm w-full border border-[#e0e0e0] flex flex-col items-center text-center animate-fade-in text-[#313030]">
                        <img
                            src={maskotHappyLogo}
                            alt="Mascot Happy"
                            className="h-36 w-auto object-contain mb-4 drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] select-none animate-bounce-short"
                        />

                        <h3 className="text-base font-bold text-emerald-650 mb-2 font-sans">
                            Login Berhasil!
                        </h3>

                        <div className="text-sm text-slate-600 mb-5 font-sans text-center px-4 w-full">
                            <span className="text-slate-500 block text-xs">Selamat datang kembali,</span>
                            <span className="font-extrabold text-base text-[#5f1340] mt-1 block break-words leading-snug">
                                {toTitleCase(welcomeName)}!
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold justify-center">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Membuka portal...</span>
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
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${index === currentSlide ? 'opacity-90 scale-105' : 'opacity-0 scale-100'
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
                                className={`transition-all duration-700 ease-in-out ${index === currentSlide
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
                                className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                                    }`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Form Login (Mobile & Desktop, 45% Visual Weight) */}
            <div className="w-full lg:w-[45%] flex flex-col lg:justify-center lg:px-14 xl:px-20 lg:py-12 relative bg-[#f8f8f8] overflow-y-auto">

                {/* Hero brand — mobile only, desktop sudah punya panel kiri */}
                <div className="lg:hidden relative h-56 shrink-0 overflow-hidden bg-[#3d0728]">
                    <img src={img1} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-45" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3d0728]/70 via-[#5f1340]/75 to-[#f8f8f8]" />
                    <div className="relative h-full flex flex-col justify-center px-6 pt-[env(safe-area-inset-top)] pb-10">
                        <img src={waschenLogoWhite} alt="Waschen Laundry" className="h-11 w-auto object-contain drop-shadow-lg" />
                    </div>
                </div>

                {/* Kartu form — mengambang di atas hero pada mobile */}
                <div className="relative z-10 -mt-8 lg:mt-0 grow lg:grow-0 flex flex-col px-4 sm:px-6 lg:px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-0">
                    <div className="w-full max-w-md mx-auto bg-white lg:bg-transparent rounded-3xl lg:rounded-none border border-[#e0e0e0] lg:border-0 shadow-xl lg:shadow-none p-6 sm:p-7 lg:p-0">

                        {/* Form Header (Aligned with input width) */}
                        <div className="mb-6 text-left">
                            <h2 className="text-2xl lg:text-xl font-bold text-[#313030] tracking-tight">
                                Selamat Datang
                            </h2>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Masuk ke akun portal Anda, atau lacak progres cucian tanpa login.
                            </p>
                        </div>

                        {/* Login akun portal */}
                        <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username Input */}
                    <div>
                        <label htmlFor="login-username" className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider mb-1.5">
                            Username atau Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                                <User className="h-4.5 w-4.5" />
                            </div>
                            <input
                                id="login-username"
                                name="username"
                                type="text"
                                required
                                autoComplete="username"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username Anda"
                                className="w-full pl-11 pr-4 py-3 sm:py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all duration-200 text-base sm:text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label htmlFor="login-password" className="block text-[10px] font-bold text-[#313030] uppercase tracking-wider">
                                Password
                            </label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#5f1340] transition-colors">
                                <Lock className="h-4.5 w-4.5" />
                            </div>
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password Anda"
                                className="w-full pl-11 pr-11 py-3 sm:py-2.5 bg-white border border-[#e0e0e0] rounded-lg text-[#313030] placeholder-slate-400 focus:outline-none focus:border-[#5f1340] focus:ring-1 focus:ring-[#5f1340] transition-all duration-200 text-base sm:text-sm shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative py-3 sm:py-2.5 px-4 bg-[#5f1340] hover:bg-[#4a0d31] active:scale-[0.99] disabled:bg-slate-400 disabled:active:scale-100 text-white rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 group transition-all duration-200 overflow-hidden cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Masuk ke Portal</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </>
                        )}
                    </button>

                    {/* Divider: Or login with — sementara di-hide */}
                    <div className="hidden relative items-center justify-center my-4">
                        <div className="flex-grow border-t border-[#e0e0e0]"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#f8f8f8] px-2">
                            Or continue with
                        </span>
                        <div className="flex-grow border-t border-[#e0e0e0]"></div>
                    </div>

                    {/* Social/Phone Login Buttons — sementara di-hide */}
                    <div className="hidden grid-cols-3 gap-2.5">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-[#e0e0e0] hover:border-slate-300 active:scale-95 rounded-lg bg-white shadow-sm hover:shadow transition-all text-xs font-semibold text-[#313030] cursor-pointer"
                            title="Sign in with Google"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-[#e0e0e0] hover:border-slate-300 active:scale-95 rounded-lg bg-white shadow-sm hover:shadow transition-all text-xs font-semibold text-[#313030] cursor-pointer"
                            title="Sign in with Apple"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.23.67-2.95 1.52-.64.73-1.2 1.87-1.05 2.97 1.12.09 2.27-.58 3.01-1.43z"/>
                            </svg>
                            <span>Apple</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-[#e0e0e0] hover:border-slate-300 active:scale-95 rounded-lg bg-white shadow-sm hover:shadow transition-all text-xs font-semibold text-[#313030] cursor-pointer"
                            title="Sign in with Phone Number"
                        >
                            <Phone className="h-4 w-4 text-slate-500" style={{ flexShrink: 0 }} />
                            <span>Phone</span>
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-500 font-medium">
                            Belum punya akun?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="font-bold text-[#5f1340] hover:underline cursor-pointer"
                            >
                                Daftar di sini
                            </button>
                        </p>
                    </div>
                        </form>

                        {/* Aksi pelanggan: Lacak progres & pasang aplikasi (PWA) */}
                        <div className="mt-6 pt-5 border-t border-[#e0e0e0] space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                Tanpa perlu login
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate('/tracking')}
                                className="w-full py-3 sm:py-2.5 px-4 bg-white border border-[#5f1340] text-[#5f1340] hover:bg-[#5f1340]/5 active:scale-[0.99] rounded-lg font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <Search className="h-4 w-4" />
                                <span>Lacak Progres Cucian Anda</span>
                            </button>
                            <InstallPwaButton />
                        </div>
                    </div>

                    {/* Footer info (Copyright) — beri ruang agar tak tertutup maskot di mobile */}
                    <div className="w-full max-w-md mx-auto text-center mt-8 pb-20 lg:pb-0">
                        <p className="text-[10px] text-slate-400">
                            &copy; {new Date().getFullYear()} PT Waschen Alora Indonesia. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Mascot Widget */}
            <div className="fixed right-4 sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 z-50 flex flex-col items-end gap-3 font-sans">
                {/* Chat Info Box (Visible when isChatOpen is true) */}
                {isChatOpen && (
                    <div className="w-[min(20rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl border border-[#e0e0e0] overflow-hidden flex flex-col animate-fade-in text-[#313030]">
                        {/* Chat Header */}
                        <div className="bg-[#5f1340] text-white px-4 py-3 flex justify-between items-center">
                            <span className="font-bold text-xs">Waschen Portal Information</span>
                            <button
                                type="button"
                                onClick={() => setIsChatOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="h-4.5 w-4.5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="p-4 space-y-4 text-xs max-h-80 overflow-y-auto">
                            <p className="leading-relaxed">
                                Hello! I am the Waschen portal mascot. This portal is specifically designed to manage the daily operations of Waschen Laundry efficiently and in an integrated manner.
                            </p>

                            <div className="space-y-2 text-left">
                                <span className="font-bold text-[#5f1340] block">Application Goals & Objectives:</span>
                                <ul className="list-decimal pl-4 space-y-2 text-slate-650">
                                    <li>
                                        <strong className="text-slate-800">Operational Digitalization:</strong> Integrating laundry data recording, linen management, and employee data in a single centralized system.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Accuracy & Tracking:</strong> Simplifying the monitoring of the laundry process from receiving, processing, packaging, to delivery to the customer.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Team Collaboration:</strong> Providing a single-door portal for all Waschen Laundry team members to coordinate effectively and in real-time.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Boilerplate Starter:</strong> Serving as the initial foundation for modern web application development based on React and Express JS.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Chat Footer */}
                        <div className="bg-slate-50 px-4 py-2.5 border-t border-[#e0e0e0] text-[10px] text-slate-400 text-center">
                            &copy; {new Date().getFullYear()} PT Waschen Alora Indonesia
                        </div>
                    </div>
                )}

                {/* Mascot Trigger Button */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {/* Speech Invite Bubble (shown if chat is closed) */}
                    {!isChatOpen && (
                        <div className="hidden sm:block bg-white text-[#5f1340] border border-[#e0e0e0] px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-lg select-none group-hover:scale-105 transition-transform duration-200">
                            Hi, Welcome to Waschen Laundry!
                        </div>
                    )}

                    {/* Mascot Image */}
                    <img
                        src={maskotLogo}
                        alt="Bantuan"
                        className="h-14 sm:h-20 w-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-110 active:scale-95"
                    />
                </div>
            </div>
        </div>
    );
}
