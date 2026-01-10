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

interface GameState {
    gameId: string;
    playerHand: Card[];
    communityCards: Card[];
    dealerHand?: Card[]; // Only revealed at showdown
    stage: 'ANTE' | 'DECISION' | 'SHOWDOWN' | 'FOLDED';
    ante: number;
    result?: string;
    handRank?: string;
}

export default function PokerPage() {
    const { userAddress, isLoggedIn } = useAuth();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [ante, setAnte] = useState(100);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Card Rendering Helper (Reused from Blackjack, could be a component)
    const renderCard = (card: Card, index: number, hidden = false) => {
        if (hidden) {
            return (
                <motion.div
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className="w-20 h-32 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg border-2 border-white/20 shadow-xl flex items-center justify-center relative"
                >
                    <div className="w-16 h-28 border border-white/10 rounded bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
                </motion.div>
            );
        }

        const isRed = card.suit === 'H' || card.suit === 'D';
        const suitIcon = { 'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠' }[card.suit];

        return (
            <motion.div
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-20 h-32 bg-white rounded-lg shadow-xl flex flex-col justify-between p-2 relative ${isRed ? 'text-red-600' : 'text-black'}`}
            >
                <div className="text-lg font-bold leading-none">{card.rank}<br />{suitIcon}</div>
                <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">{suitIcon}</div>
                <div className="text-lg font-bold leading-none transform rotate-180 text-right">{card.rank}<br />{suitIcon}</div>
            </motion.div>
        );
    };

    const deal = async () => {
        if (!userAddress) return;
        setLoading(true);
        setMessage('');
        try {
            // Mocking Backend Response for UI Demo if DB is down
            // In real implementation: fetch('http://127.0.0.1:18080/casino/poker/deal', ...)

            // Simulating a "Deal" response
            setTimeout(() => {
                setGameState({
                    gameId: "mock_poker_" + Date.now(),
                    playerHand: [
                        { suit: 'H', rank: 'A', value: 14 },
                        { suit: 'H', rank: 'K', value: 13 }
                    ],
                    communityCards: [
                        { suit: 'H', rank: '10', value: 10 },
                        { suit: 'D', rank: '10', value: 10 },
                        { suit: 'S', rank: '2', value: 2 }
                    ],
                    stage: 'DECISION',
                    ante: ante
                });
                setLoading(false);
            }, 1000);

        } catch (e) {
            setMessage('Connection error');
            setLoading(false);
        }
    };

    const call = () => {
        if (!gameState) return;
        // Mock Call/Showdown
        setGameState(prev => ({
            ...prev!,
            communityCards: [
                ...prev!.communityCards,
                { suit: 'H', rank: 'J', value: 11 }, // Turn
                { suit: 'H', rank: 'Q', value: 12 }  // River
            ],
            dealerHand: [
                { suit: 'C', rank: '2', value: 2 },
                { suit: 'C', rank: '3', value: 3 }
            ],
            stage: 'SHOWDOWN',
            result: 'WIN',
            handRank: 'Royal Flush'
        }));
    };

    const fold = () => {
        if (!gameState) return;
        setGameState(prev => ({
            ...prev!,
            stage: 'FOLDED',
            result: 'LOSS'
        }));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-red-500 selection:text-white">
            <Nav />

            {/* Poker Table Felt */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-[#050505] to-[#050505] pointer-events-none"></div>

            <main className="relative z-10 pt-24 h-screen flex flex-col items-center justify-center">

                {/* Dealer / Community Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="text-gray-500 text-xs uppercase tracking-widest mb-4">Community Cards</div>
                    <div className="flex gap-4 h-32">
                        {gameState ? (
                            <>
                                {gameState.communityCards.map((card, i) => (
                                    <div key={i}>{renderCard(card, i)}</div>
                                ))}
                                {/* Placeholders for Turn/River if not yet dealt */}
                                {gameState.communityCards.length < 5 && (
                                    [...Array(5 - gameState.communityCards.length)].map((_, i) => (
                                        <div key={`ph-${i}`} className="w-20 h-32 border-2 border-white/5 rounded-lg bg-white/5"></div>
                                    ))
                                )}
                            </>
                        ) : (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="w-20 h-32 border-2 border-white/5 rounded-lg bg-white/5"></div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pot Info */}
                <div className="mb-12 bg-black/50 px-8 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-gray-400 text-sm mr-2">POT:</span>
                    <span className="text-yellow-500 font-mono font-bold text-xl">
                        {gameState ? (gameState.stage === 'SHOWDOWN' ? gameState.ante * 4 : gameState.ante * 2) : 0} CRDO
                    </span>
                </div>

                {/* Result Overlay */}
                <AnimatePresence>
                    {(gameState?.stage === 'SHOWDOWN' || gameState?.stage === 'FOLDED') && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                        >
                            <div className="bg-black/90 backdrop-blur-xl p-12 rounded-3xl border border-red-500/30 text-center shadow-[0_0_100px_rgba(220,38,38,0.2)]">
                                <h2 className={`text-6xl font-black mb-4 ${gameState.result === 'WIN' ? 'text-yellow-400' : 'text-gray-400'
                                    }`}>
                                    {gameState.result}
                                </h2>
                                {gameState.handRank && (
                                    <p className="text-2xl text-white font-bold mb-2">{gameState.handRank}</p>
                                )}
                                <button
                                    onClick={() => setGameState(null)}
                                    className="mt-8 bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 pointer-events-auto"
                                >
                                    Play Again
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player Area */}
                <div className="mb-12 flex flex-col items-center">
                    <div className="flex gap-4 mb-4">
                        {gameState ? (
                            gameState.playerHand.map((card, i) => (
                                <div key={i}>{renderCard(card, i)}</div>
                            ))
                        ) : (
                            <>
                                <div className="w-20 h-32 border-2 border-white/10 rounded-lg bg-white/5"></div>
                                <div className="w-20 h-32 border-2 border-white/10 rounded-lg bg-white/5"></div>
                            </>
                        )}
                    </div>
                    <div className="text-gray-400 text-sm uppercase tracking-widest">Your Hand</div>
                </div>

                {/* Controls */}
                <div className="bg-black/60 backdrop-blur-xl p-6 rounded-t-3xl border-t border-white/10 w-full max-w-3xl absolute bottom-0">
                    {!gameState ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-4">
                                {[100, 500, 1000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setAnte(amount)}
                                        className={`px-6 py-2 rounded-full border font-bold transition-all ${ante === amount ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-gray-600 bg-gray-800 text-gray-400'
                                            }`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={deal}
                                disabled={loading || !isLoggedIn}
                                className="bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-2xl px-16 py-4 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all disabled:opacity-50"
                            >
                                {loading ? 'DEALING...' : 'DEAL HAND'}
                            </button>
                        </div>
                    ) : gameState.stage === 'DECISION' ? (
                        <div className="flex justify-center gap-8">
                            <button
                                onClick={fold}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xl px-12 py-4 rounded-full border border-white/10 transition-all"
                            >
                                FOLD
                            </button>
                            <button
                                onClick={call}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transition-all"
                            >
                                CALL (2x)
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">Game Over</div>
                    )}
                </div>

            </main>
        </div>
    );
}
