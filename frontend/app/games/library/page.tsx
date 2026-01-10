"use client";

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Game {
    id: string;
    title: string;
    description: string;
    price: number;
    developerAddress: string;
    imageUrl: string;
    gameUrl: string;
}

export default function LibraryPage() {
    const { isLoggedIn, userAddress } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchLibrary = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:18080/games/library/${userAddress}`);
                const data = await res.json();
                setGames(data);
            } catch (e) {
                console.error("Failed to fetch library");
            }
            setLoading(false);
        };
        fetchLibrary();
    }, [isLoggedIn, userAddress]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white font-sans flex items-center justify-center">
                <Nav />
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
                    <p className="text-gray-400">You need to be logged in to view your library.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />
            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                <h1 className="text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    My Library
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {games.map((game) => (
                            <motion.div
                                key={game.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-xl"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={game.imageUrl || "https://placehold.co/600x400/1a1a1a/purple?text=Game"}
                                        alt={game.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] to-transparent opacity-80"></div>
                                    <a
                                        href={game.gameUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95"
                                    >
                                        PLAY NOW ▶
                                    </a>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-2">{game.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2">{game.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {games.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <p className="text-xl text-gray-400 mb-6">Your library is empty.</p>
                        <Link href="/games" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-full transition-colors">
                            Browse Store
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
