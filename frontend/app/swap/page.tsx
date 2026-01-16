"use client";

import Nav from '../components/Nav';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SwapPage() {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />

            <main className="pt-32 px-4 flex justify-center">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Intercambio</h1>
                            <button className="text-gray-400 hover:text-white">⚙️</button>
                        </div>

                        {/* From Input */}
                        <div className="bg-black/40 rounded-2xl p-4 mb-2 border border-transparent hover:border-white/10 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-sm">Tú pagas</span>
                                <span className="text-gray-400 text-sm">Saldo: 1,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    className="bg-transparent text-3xl font-bold focus:outline-none w-full"
                                />
                                <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 font-bold transition-colors">
                                    <span className="w-6 h-6 rounded-full bg-green-500"></span>
                                    CRDO
                                    <span>▾</span>
                                </button>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center -my-3 relative z-10">
                            <button className="bg-[#1a1a1a] border-4 border-[#0f0518] p-2 rounded-xl text-gray-400 hover:text-white transition-colors">
                                ↓
                            </button>
                        </div>

                        {/* To Input */}
                        <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-transparent hover:border-white/10 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-400 text-sm">Tú recibes</span>
                                <span className="text-gray-400 text-sm">Saldo: 0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={toAmount}
                                    readOnly
                                    className="bg-transparent text-3xl font-bold focus:outline-none w-full text-gray-500"
                                />
                                <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 font-bold transition-colors">
                                    <span className="w-6 h-6 rounded-full bg-blue-500"></span>
                                    USDC
                                    <span>▾</span>
                                </button>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all transform active:scale-98">
                            Intercambiar
                        </button>

                    </motion.div>
                </div>
            </main>
        </div>
    );
}
