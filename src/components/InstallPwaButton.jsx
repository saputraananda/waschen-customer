import React, { useEffect, useState } from 'react';
import { Download, Share, Plus, X, Smartphone } from 'lucide-react';
import {
    subscribePwaInstall,
    clearDeferredInstallPrompt,
    isPwaStandalone,
    isIosDevice,
} from '../utils/pwaInstall.js';

export default function InstallPwaButton() {
    const [prompt, setPrompt] = useState(null);
    const [installed, setInstalled] = useState(isPwaStandalone());
    const [showGuide, setShowGuide] = useState(false);
    const ios = isIosDevice();

    useEffect(() => {
        const unsub = subscribePwaInstall(setPrompt);
        const onInstalled = () => setInstalled(true);
        window.addEventListener('appinstalled', onInstalled);
        return () => { unsub(); window.removeEventListener('appinstalled', onInstalled); };
    }, []);

    if (installed) return null;

    const handleClick = async () => {
        if (!prompt) { setShowGuide(true); return; }
        prompt.prompt();
        await prompt.userChoice;
        clearDeferredInstallPrompt();
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="w-full py-2.5 px-4 bg-[#5f1340] hover:bg-[#4a0d31] active:scale-98 text-white rounded-lg font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
                <Download className="h-4 w-4" />
                <span>Download Aplikasi My Waschen</span>
            </button>

            {showGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#e0e0e0] text-left">
                        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-[#5f1340]" />
                                <span className="font-bold text-sm text-[#313030]">Pasang Aplikasi My Waschen</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGuide(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="py-4 text-xs text-slate-600 font-medium space-y-3">
                            {ios ? (
                                <>
                                    <p className="font-bold text-[#313030]">iPhone / iPad (Safari):</p>
                                    <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-[#e0e0e0]">
                                        <li>Ketuk ikon <Share className="inline h-3.5 w-3.5 text-[#5f1340]" /> <span className="font-bold text-[#5f1340]">Bagikan</span> di bawah Safari.</li>
                                        <li>Pilih <Plus className="inline h-3.5 w-3.5 text-[#5f1340]" /> <span className="font-bold text-[#5f1340]">Tambah ke Layar Utama</span>.</li>
                                        <li>Ketuk <span className="font-bold text-[#5f1340]">Tambah</span> di kanan atas.</li>
                                    </ol>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-[#313030]">Android / Chrome / Edge:</p>
                                    <ol className="list-decimal list-inside space-y-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-[#e0e0e0]">
                                        <li>Buka menu <span className="font-bold text-[#5f1340]">titik tiga (⋮)</span> di pojok kanan atas.</li>
                                        <li>Pilih <span className="font-bold text-[#5f1340]">Install App</span> / <span className="font-bold text-[#5f1340]">Tambahkan ke Layar Utama</span>.</li>
                                        <li>Konfirmasi pemasangan.</li>
                                    </ol>
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowGuide(false)}
                            className="w-full py-2.5 bg-[#5f1340] text-white font-black text-xs rounded-lg hover:bg-[#4a0d31] transition-colors cursor-pointer"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
