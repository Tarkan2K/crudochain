"use client";

import Nav from '../components/Nav';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CasinoPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500 selection:text-black">
            <Nav />

            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>

                <div className="relative z-10 text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)] mb-4"
                    >
                        CRUDO CASINO
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 font-light tracking-widest uppercase"
                    >
                        High Stakes. Provably Fair.
                    </motion.p>
                </div>
            </div>

            {/* Jackpot Ticker */}
            <div className="bg-yellow-600/10 border-y border-yellow-600/20 py-4 overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(10)].map((_, i) => (
                        <span key={i} className="mx-8 text-yellow-500 font-mono font-bold text-xl flex items-center gap-2">
                            🎰 GLOBAL JACKPOT: <span className="text-white">1,245,890 CRDO</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Games Grid */}
            <main className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-4">
                    <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                    Featured Games
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Blackjack */}
                    <Link href="/casino/blackjack">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-yellow-500/50 transition-all"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-3xl font-black text-white mb-2">BLACKJACK</h3>
                                <p className="text-gray-400 text-sm">Classic 21. Beat the dealer.</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                        </motion.div>
                    </Link>

                    {/* Slots */}
                    <Link href="/casino/slots">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-500/50 transition-all"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-3xl font-black text-white mb-2">NEON SLOTS</h3>
                                <p className="text-gray-400 text-sm">Spin to win. Massive multipliers.</p>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Poker */}
                    <Link href="/casino/poker">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-red-500/50 transition-all"
                        >
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8">
                                <h3 className="text-3xl font-black text-white mb-2">TEXAS HOLD'EM</h3>
                                <p className="text-gray-400 text-sm">High stakes poker tables.</p>
                            </div>
                            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                LIVE
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
