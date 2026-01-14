'use client';

import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export default function GameHUD() {
    const { email } = useAuth();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        // Fetch real balance
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/user/balance');
                const data = await res.json();
                if (data.crdoBalance) setBalance(data.crdoBalance);
            } catch (e) {
                console.error(e);
            }
        };
        fetchBalance();
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-50 p-6 flex flex-col justify-between">
            {/* TOP BAR */}
            <div className="flex justify-between items-start pointer-events-auto">
                {/* Profile (Top Left) */}
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10">
                    <div className="w-12 h-12 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-2xl">
                        🦴
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wider">{email?.split('@')[0] || 'CAVERNICOLA'}</h3>
                        <div className="w-24 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div className="w-3/4 h-full bg-green-500"></div>
                        </div>
                    </div>
                </div>

                {/* Economy (Top Right) */}
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        <span className="text-yellow-400 font-black text-xl tracking-widest">
                            {balance.toLocaleString()} CRDO
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">ERA 1: CAVERNAS</div>
                </div>
            </div>

            {/* BOTTOM BAR (Menus) */}
            <div className="flex justify-center gap-4 pointer-events-auto mb-4">
                {[
                    { icon: '🎒', label: 'INVENTARIO' },
                    { icon: '👕', label: 'ESTILO' },
                    { icon: '⛏️', label: 'CRAFT' },
                    { icon: '⚙️', label: 'CONFIG' }
                ].map((item) => (
                    <button
                        key={item.label}
                        className="w-14 h-14 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-2xl hover:bg-white/10 hover:scale-110 transition-all group relative"
                    >
                        {item.icon}
                        <span className="absolute -top-8 bg-black px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
