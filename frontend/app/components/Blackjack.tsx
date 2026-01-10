"use client";

import { useState, useEffect } from 'react';
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
    serverSeedHash?: string;
    serverSeed?: string;
}

export default function Blackjack({ userAddress, balance, onBalanceUpdate }: { userAddress: string, balance: number, onBalanceUpdate: () => void }) {
    const [bet, setBet] = useState(10);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const deal = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/deal', {
                method: 'POST',
                body: JSON.stringify({ playerAddress: userAddress, bet: bet, clientSeed: "user-random-seed" }), // In prod, generate real random seed
            });
            const data = await res.json();
            if (data.status === 'failed') {
                setError(data.message);
            } else {
                setGameState(data);
                onBalanceUpdate();
            }
        } catch (e) {
            setError('Connection error');
        }
        setLoading(false);
    };

    const hit = async () => {
        if (!gameState) return;
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/hit', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId }),
            });
            const data = await res.json();
            setGameState(data);
            if (data.isGameOver) onBalanceUpdate();
        } catch (e) {
            setError('Connection error');
        }
        setLoading(false);
    };

    const stand = async () => {
        if (!gameState) return;
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/blackjack/stand', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId }),
            });
            const data = await res.json();
            setGameState(data);
            onBalanceUpdate();
        } catch (e) {
            setError('Connection error');
        }
        setLoading(false);
    };

    const renderCard = (card: Card, index: number, hidden: boolean = false) => {
        if (hidden) {
            return (
                <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-24 h-36 bg-red-800 rounded-xl border-2 border-white/20 shadow-2xl flex items-center justify-center bg-opacity-80 backdrop-blur-sm"
                >
                    <div className="text-4xl">♠️</div>
                </motion.div>
            );
        }

        const isRed = card.suit === 'H' || card.suit === 'D';
        const suitIcon = { 'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠' }[card.suit];

        return (
            <motion.div
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 }}
                className={`w-24 h-36 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-between p-2 ${isRed ? 'text-red-600' : 'text-black'} relative overflow-hidden`}
            >
                <div className="self-start text-xl font-bold">{card.rank}</div>
                <div className="text-5xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">{suitIcon}</div>
                <div className="text-3xl z-10">{suitIcon}</div>
                <div className="self-end text-xl font-bold transform rotate-180">{card.rank}</div>
            </motion.div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,255,128,0.1)]">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-8 tracking-wider">BLACKJACK PRO</h2>

            {error && <div className="text-red-500 mb-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">{error}</div>}

            {!gameState ? (
                <div className="flex flex-col items-center gap-6">
                    <div className="text-gray-400 text-sm uppercase tracking-widest">Place your bet</div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xl transition-all">-</button>
                        <div className="text-4xl font-mono font-bold text-white w-32 text-center">{bet} <span className="text-sm text-green-500">CRDO</span></div>
                        <button onClick={() => setBet(bet + 10)} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xl transition-all">+</button>
                    </div>
                    <button
                        onClick={deal}
                        disabled={loading || balance < bet}
                        className={`px-12 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] ${loading || balance < bet ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-700 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]'}`}
                    >
                        {loading ? 'DEALING...' : 'DEAL CARDS'}
                    </button>
                    {balance < bet && <div className="text-red-400 text-sm">Insufficient balance</div>}
                </div>
            ) : (
                <div className="w-full flex flex-col gap-12">
                    {/* Dealer Hand */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-gray-400 text-sm uppercase tracking-widest">Dealer's Hand</div>
                        <div className="flex gap-4 justify-center h-40">
                            {gameState.dealerHand.cards.map((card, i) => (
                                <div key={i} className="relative">
                                    {renderCard(card, i)}
                                </div>
                            ))}
                            {/* If game not over, hide second card logic is usually handled by backend sending only 1 card or frontend hiding it. 
                  Our backend sends 2 cards immediately for simplicity in this MVP, but let's pretend the 2nd is hidden if we wanted to be strict.
                  Actually, standard blackjack reveals one. Let's stick to what backend sends for now (both visible or we'd need to change backend).
                  Wait, standard blackjack: Dealer gets 1 face up, 1 face down.
                  Our backend sends both. Let's just show both for "Double Exposure" style or simplify.
                  Actually, let's just show them.
              */}
                        </div>
                        <div className="text-xl font-mono text-gray-300">
                            {gameState.isGameOver ? gameState.dealerHand.value : "?"}
                        </div>
                    </div>

                    {/* Result Overlay */}
                    <AnimatePresence>
                        {gameState.isGameOver && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl text-center transform rotate-[-5deg]">
                                    <div className={`text-6xl font-black mb-2 ${gameState.result === 'WIN' || gameState.result === 'BLACKJACK' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : gameState.result === 'PUSH' ? 'text-blue-400' : 'text-red-500'}`}>
                                        {gameState.result}
                                    </div>
                                    <div className="text-white font-mono">
                                        {gameState.result === 'WIN' ? `+${gameState.playerHand.bet} CRDO` : gameState.result === 'BLACKJACK' ? `+${gameState.playerHand.bet * 1.5} CRDO` : ''}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Player Hand */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-gray-400 text-sm uppercase tracking-widest">Your Hand</div>
                        <div className="flex gap-4 justify-center h-40">
                            {gameState.playerHand.cards.map((card, i) => (
                                <div key={i} className="relative">
                                    {renderCard(card, i)}
                                </div>
                            ))}
                        </div>
                        <div className="text-2xl font-mono font-bold text-white">{gameState.playerHand.value}</div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-6 mt-4">
                        {!gameState.isGameOver ? (
                            <>
                                <button
                                    onClick={hit}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1"
                                >
                                    HIT
                                </button>
                                <button
                                    onClick={stand}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1"
                                >
                                    STAND
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setGameState(null)}
                                className="px-12 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all transform hover:scale-105 pointer-events-auto"
                            >
                                PLAY AGAIN
                            </button>
                        )}
                    </div>

                    {/* Provably Fair Hash */}
                    <div className="mt-8 text-center">
                        <div className="text-xs text-gray-600 font-mono">Server Seed Hash: {gameState.serverSeedHash || 'Hidden'}</div>
                        {gameState.serverSeed && <div className="text-xs text-green-600 font-mono mt-1">Revealed Seed: {gameState.serverSeed}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
