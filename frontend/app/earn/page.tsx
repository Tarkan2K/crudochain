"use client";

import Nav from '../components/Nav';
import { motion } from 'framer-motion';

export default function EarnPage() {
    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />

            <main className="pt-32 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">EARN YIELD</h1>
                    <p className="text-xl text-gray-400">Stake your CRDO and earn passive income.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "CRDO Staking", apy: "12%", lock: "Flexible" },
                        { title: "Liquidity Pool", apy: "45%", lock: "30 Days" },
                        { title: "Governance", apy: "8%", lock: "90 Days" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-yellow-500/50 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600"></div>
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-mono">Active</span>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-gray-400 text-sm">APY</div>
                                    <div className="text-4xl font-black text-yellow-400">{item.apy}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 text-sm">Lock</div>
                                    <div className="text-xl font-bold">{item.lock}</div>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-3 bg-white/10 group-hover:bg-yellow-500 group-hover:text-black font-bold rounded-xl transition-all">
                                Stake Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
