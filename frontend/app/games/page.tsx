"use client";

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Game {
    id: string;
    title: string;
    description: string;
    price: number;
    developerAddress: string;
    imageUrl: string;
    salesCount: number;
}

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/list`);
                const data = await res.json();
                setGames(data);
            } catch (e) {
                console.error("Failed to fetch games");
            }
            setLoading(false);
        };
        fetchGames();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-purple-500 selection:text-white">
            <Nav />

            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        GAME <span className="text-white">STORE</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Discover, Play, and Own the Future of Gaming. <br />
                        <span className="text-sm text-purple-400">Powered by Crudochain UGC</span>
                    </p>
                </div>

                {/* Games Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {games.map((game) => (
                            <div key={game.id} className="relative group">
                                <Link href={`/games/play/${game.id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -10 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300"
                                    >
                                        {/* Image */}
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={game.imageUrl || "https://placehold.co/600x400/1a1a1a/purple?text=Game"}
                                                alt={game.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] to-transparent opacity-80"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md mb-1 w-fit">
                                                    {game.price === 0 ? 'FREE' : `${game.price} CRDO`}
                                                </div>
                                            </div>

                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
                                                <div className="bg-white text-purple-900 font-black px-6 py-2 rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                                                    PLAY NOW 🎮
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{game.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">{game.description}</p>

                                            <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                                                <span>By {game.developerAddress.substring(0, 6)}...</span>
                                                <span>{game.salesCount} Players</span>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 border-2 border-purple-500/0 group-hover:border-purple-500/50 rounded-3xl transition-all duration-300 pointer-events-none"></div>
                                    </motion.div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {games.length === 0 && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="relative group opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={`https://placehold.co/600x400/1a1a1a/purple?text=Coming+Soon+${i}`}
                                            alt="Coming Soon"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] to-transparent opacity-80"></div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold mb-2">Coming Soon - Q1 2026</h3>
                                        <p className="text-gray-400 text-sm mb-4">This title is currently in development by Crudo Studios.</p>
                                        <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                                            <span>By Crudo Studios</span>
                                            <span>0 Players</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
