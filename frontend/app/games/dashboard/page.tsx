"use client";

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface GameStat {
    id: string;
    title: string;
    price: number;
    sales: number;
    revenue: number;
    imageUrl: string;
}

interface DashboardStats {
    totalSales: number;
    totalRevenue: number;
    games: GameStat[];
}

export default function DeveloperDashboard() {
    const { userAddress, isLoggedIn } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userAddress) fetchStats();
    }, [userAddress]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:18080/games/developer/${userAddress}`);
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white flex items-center justify-center">
                <p>Please login to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />
            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Developer Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Track your games, sales, and revenue.</p>
                    </div>
                    <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10">
                        <span className="text-gray-400 text-sm mr-2">Developer ID:</span>
                        <span className="font-mono text-purple-400">{userAddress?.substring(0, 8)}...</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading stats...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-purple-900/50 to-black p-6 rounded-3xl border border-purple-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</h3>
                                <div className="text-5xl font-black text-white">
                                    {stats?.totalRevenue.toFixed(2)} <span className="text-xl text-purple-400">CRDO</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-900/50 to-black p-6 rounded-3xl border border-blue-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Sales</h3>
                                <div className="text-5xl font-black text-white">
                                    {stats?.totalSales} <span className="text-xl text-blue-400">Copies</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-pink-900/50 to-black p-6 rounded-3xl border border-pink-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
                                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Games</h3>
                                <div className="text-5xl font-black text-white">
                                    {stats?.games.length} <span className="text-xl text-pink-400">Titles</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Games List */}
                        <h2 className="text-2xl font-bold mb-6">Your Games</h2>
                        <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                            <table className="w-full text-left">
                                <thead className="bg-black/40 text-gray-400 text-sm uppercase">
                                    <tr>
                                        <th className="p-6 font-bold">Game</th>
                                        <th className="p-6 font-bold">Price</th>
                                        <th className="p-6 font-bold">Sales</th>
                                        <th className="p-6 font-bold">Revenue (Net)</th>
                                        <th className="p-6 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats?.games.map((game) => (
                                        <tr key={game.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6 flex items-center gap-4">
                                                <img src={game.imageUrl || "https://placehold.co/100x100"} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                                <span className="font-bold">{game.title}</span>
                                            </td>
                                            <td className="p-6 font-mono text-gray-300">{game.price} CRDO</td>
                                            <td className="p-6 font-mono text-blue-400">{game.sales}</td>
                                            <td className="p-6 font-mono text-green-400 font-bold">+{game.revenue.toFixed(2)} CRDO</td>
                                            <td className="p-6">
                                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats?.games.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                                You haven't published any games yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
