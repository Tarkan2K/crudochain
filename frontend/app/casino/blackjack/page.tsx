"use client";

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
    suit: string;
    rank: string;
    value: number;
}

interface Hand {
    cards: Card[];
    value: number;
    bet: number;
    isStand: boolean;
}

interface GameState {
    gameId: string;
    playerHand: Hand;
    dealerHand: Hand;
    isGameOver: boolean;
    result: string;
}

export default function BlackjackPage() {
    const { userAddress, isLoggedIn } = useAuth();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [bet, setBet] = useState(100);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Card Rendering Helper
    const renderCard = (card: Card, index: number, isDealer = false, hidden = false) => {
        if (hidden) {
            return (
                <motion.div
                    initial={{ scale: 0, y: -100 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-24 h-36 bg-gradient-to-br from-red-900 to-red-700 rounded-xl border-2 border-white/20 shadow-2xl flex items-center justify-center relative"
                >
                    <div className="w-20 h-32 border border-white/10 rounded-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
                </motion.div>
            );
        }

        const isRed = card.suit === 'H' || card.suit === 'D';
        const suitIcon = { 'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠' }[card.suit];

        return (
            <motion.div
                initial={{ scale: 0, y: -100 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-24 h-36 bg-white rounded-xl shadow-2xl flex flex-col justify-between p-2 relative ${isRed ? 'text-red-600' : 'text-black'}`}
            >
                <div className="text-xl font-bold leading-none">{card.rank}<br />{suitIcon}</div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">{suitIcon}</div>
                <div className="text-xl font-bold leading-none transform rotate-180 text-right">{card.rank}<br />{suitIcon}</div>
            </motion.div>
        );
    };

    const deal = async () => {
        if (!userAddress) return;
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/deal', {
                method: 'POST',
                body: JSON.stringify({
                    playerAddress: userAddress,
                    bet: bet,
                    clientSeed: Date.now().toString() // Simple client seed
                })
            });
            const data = await res.json();
            if (res.ok) {
                setGameState(data);
            } else {
                setMessage(data.message || 'Error dealing cards');
            }
        } catch (e) {
            setMessage('Connection error');
        }
        setLoading(false);
    };

    const hit = async () => {
        if (!gameState) return;
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/hit', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId })
            });
            const data = await res.json();
            setGameState(data);
        } catch (e) {
            console.error(e);
        }
    };

    const stand = async () => {
        if (!gameState) return;
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/stand', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId })
            });
            const data = await res.json();
            setGameState(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative">
            <Nav />

            {/* Table Felt */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>

            <main className="relative z-10 pt-24 h-screen flex flex-col items-center justify-center">

                {/* Dealer Area */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="text-gray-400 text-sm uppercase tracking-widest mb-4">Dealer</div>
                    <div className="flex gap-4">
                        {gameState ? (
                            gameState.dealerHand.cards.map((card, i) => (
                                <div key={i}>{renderCard(card, i)}</div>
                            ))
                        ) : (
                            // Placeholder empty cards
                            <>
                                <div className="w-24 h-36 border-2 border-white/10 rounded-xl bg-white/5"></div>
                                <div className="w-24 h-36 border-2 border-white/10 rounded-xl bg-white/5"></div>
                            </>
                        )}
                        {/* Hidden Card if playing */}
                        {gameState && !gameState.isGameOver && gameState.dealerHand.cards.length === 1 && (
                            renderCard({ suit: '', rank: '', value: 0 }, 1, true, true)
                        )}
                    </div>
                    {gameState && gameState.isGameOver && (
                        <div className="mt-2 font-mono text-gray-400">Value: {gameState.dealerHand.value}</div>
                    )}
                </div>

                {/* Result Overlay */}
                <AnimatePresence>
                    {gameState?.isGameOver && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                            <div className="bg-black/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center">
                                <h2 className={`text-6xl font-black mb-2 ${gameState.result === 'WIN' || gameState.result === 'BLACKJACK' ? 'text-yellow-400' :
                                    gameState.result === 'LOSE' ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {gameState.result}
                                </h2>
                                <p className="text-xl text-white">
                                    {gameState.result === 'WIN' ? `You won ${gameState.playerHand.bet * 2} CRDO!` :
                                        gameState.result === 'BLACKJACK' ? `Blackjack! You won ${gameState.playerHand.bet * 2.5} CRDO!` :
                                            gameState.result === 'PUSH' ? 'Bet returned.' : 'Better luck next time.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player Area */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="flex gap-4 mb-4">
                        {gameState ? (
                            gameState.playerHand.cards.map((card, i) => (
                                <div key={i}>{renderCard(card, i)}</div>
                            ))
                        ) : (
                            <>
                                <div className="w-24 h-36 border-2 border-white/10 rounded-xl bg-white/5"></div>
                                <div className="w-24 h-36 border-2 border-white/10 rounded-xl bg-white/5"></div>
                            </>
                        )}
                    </div>
                    <div className="text-gray-400 text-sm uppercase tracking-widest">You</div>
                    {gameState && (
                        <div className="mt-2 font-mono text-yellow-500 font-bold text-xl">{gameState.playerHand.value}</div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-black/60 backdrop-blur-xl p-6 rounded-t-3xl border-t border-white/10 w-full max-w-3xl absolute bottom-0">
                    {message && <div className="text-red-500 text-center mb-4">{message}</div>}

                    {!gameState || gameState.isGameOver ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-4">
                                {[10, 50, 100, 500].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setBet(amount)}
                                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold transition-transform hover:scale-110 ${bet === amount ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' : 'border-gray-600 bg-gray-800 text-gray-400'
                                            }`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={deal}
                                disabled={loading || !isLoggedIn}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-black text-2xl px-12 py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] transition-all disabled:opacity-50"
                            >
                                {loading ? 'DEALING...' : 'DEAL'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-8">
                            <button
                                onClick={hit}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl px-12 py-4 rounded-full border border-white/10 transition-all"
                            >
                                HIT
                            </button>
                            <button
                                onClick={stand}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transition-all"
                            >
                                STAND
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
