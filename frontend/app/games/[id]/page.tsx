"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Nav from '../../components/Nav';
import PaymentModal from '../../components/PaymentModal';
import { motion } from 'framer-motion';

interface Game {
    id: string;
    title: string;
    description: string;
    price: number;
    developerAddress: string;
    gameUrl: string;
    imageUrl: string;
}

export default function GameDetailsPage() {
    const { id } = useParams();
    const [game, setGame] = useState<Game | null>(null);
    const [isOwned, setIsOwned] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [balance, setBalance] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userAddress');
        if (storedUser) {
            setUserAddress(storedUser);
            checkOwnership(storedUser);
            fetchBalance(storedUser);
        }

        const fetchGame = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/list`);
                const data = await res.json();
                const found = data.find((g: Game) => g.id === id);
                setGame(found);
            } catch (e) {
                console.error("Failed to fetch game");
            }
        };
        fetchGame();
    }, [id]);

    const checkOwnership = async (user: string) => {
        try {
            const res = await fetch(`/api/games/library/${user}`);
            const data = await res.json();
            const owned = data.find((g: Game) => g.id === id);
            if (owned) setIsOwned(true);
        } catch (e) { }
    };

    const fetchBalance = async (user: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:18080/wallet/${user}`);
            const data = await res.json();
            setBalance(data.CRDO || 0);
        } catch (e) { }
    };

    const handlePaymentComplete = async () => {
        // Refresh ownership and balance
        if (userAddress) {
            await checkOwnership(userAddress);
            await fetchBalance(userAddress);
        }
        setIsOwned(true); // Optimistic update
    };

    if (!game) return <div className="min-h-screen bg-[#0f0518] text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                gameTitle={game.title}
                priceCRDO={game.price}
                onPaymentComplete={handlePaymentComplete}
            />

            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                {!isPlaying ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Image Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] border border-purple-500/20"
                        >
                            <img src={game.imageUrl} alt={game.title} className="w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] via-transparent to-transparent"></div>
                        </motion.div>

                        {/* Info Side */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">{game.title}</h1>
                            <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                                <span className="bg-white/10 px-3 py-1 rounded-full">Dev: {game.developerAddress.substring(0, 8)}...</span>
                                <span className="bg-white/10 px-3 py-1 rounded-full">v1.0.0</span>
                            </div>
                            <p className="text-xl text-gray-300 leading-relaxed">{game.description}</p>

                            <div className="pt-8 border-t border-white/10 flex items-center gap-8">
                                <div className="text-4xl font-bold text-green-400 font-mono">
                                    {game.price === 0 ? 'FREE' : `${game.price} CRDO`}
                                </div>

                                {isOwned || game.price === 0 ? (
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className="px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all transform hover:scale-105"
                                    >
                                        PLAY NOW
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    >
                                        BUY GAME
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="w-full h-[80vh] relative rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_100px_rgba(168,85,247,0.2)]">
                        <button
                            onClick={() => setIsPlaying(false)}
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500 text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors"
                        >
                            EXIT GAME
                        </button>
                        <iframe
                            src={game.gameUrl}
                            className="w-full h-full bg-black"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
            </main>
        </div>
    );
}
