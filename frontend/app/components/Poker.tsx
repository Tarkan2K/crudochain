"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
    suit: string;
    rank: string;
    value: number;
}

interface PokerState {
    gameId: string;
    playerHand: Card[];
    dealerHand?: Card[]; // Only in showdown
    communityCards: Card[];
    stage: string; // "ANTE", "DECISION", "SHOWDOWN", "FOLDED"
    ante: number;
    result?: string;
    handRank?: string;
}

export default function Poker() {
    const [gameState, setGameState] = useState<PokerState | null>(null);
    const [ante, setAnte] = useState(10);
    const [loading, setLoading] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('userAddress');
        if (storedUser) {
            setUserAddress(storedUser);
            fetchBalance(storedUser);
        }
    }, []);

    const fetchBalance = async (address: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:18080/wallet/${address}`);
            const data = await res.json();
            setBalance(data.CRDO || 0);
        } catch (e) { }
    };

    const deal = async () => {
        if (balance < ante) {
            alert("Insufficient funds");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/poker/deal', {
                method: 'POST',
                body: JSON.stringify({ playerAddress: userAddress, ante: ante }),
            });
            const data = await res.json();
            if (data.status === 'failed') {
                alert(data.message);
            } else {
                setGameState(data);
                fetchBalance(userAddress);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const call = async () => {
        if (!gameState) return;
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/poker/call', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId }),
            });
            const data = await res.json();
            if (data.status === 'failed') {
                alert(data.message);
            } else {
                setGameState(data);
                fetchBalance(userAddress);
            }
        } catch (e) { }
        setLoading(false);
    };

    const fold = async () => {
        if (!gameState) return;
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:18080/casino/poker/fold', {
                method: 'POST',
                body: JSON.stringify({ gameId: gameState.gameId }),
            });
            const data = await res.json();
            setGameState(data);
        } catch (e) { }
        setLoading(false);
    };

    const getSuitIcon = (suit: string) => {
        switch (suit) {
            case 'H': return <span className="text-red-500">♥</span>;
            case 'D': return <span className="text-red-500">♦</span>;
            case 'C': return <span className="text-black">♣</span>;
            case 'S': return <span className="text-black">♠</span>;
            default: return '';
        }
    };

    const CardView = ({ card, hidden = false }: { card?: Card, hidden?: boolean }) => (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-28 md:w-24 md:h-36 rounded-xl shadow-xl flex items-center justify-center text-2xl font-bold border-2 ${hidden ? 'bg-gradient-to-br from-red-900 to-red-700 border-red-500' : 'bg-white border-gray-200'}`}
        >
            {hidden ? (
                <div className="text-red-300 text-4xl">♠</div>
            ) : (
                <div className="flex flex-col items-center">
                    <span>{card?.rank}</span>
                    {getSuitIcon(card?.suit || '')}
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto p-8 rounded-3xl bg-[#1a3c28] border-8 border-[#2d1b13] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Table Felt Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>

            <div className="relative z-10 flex flex-col items-center gap-12 min-h-[600px] justify-center">

                {/* Dealer Area */}
                <div className="flex flex-col items-center gap-4">
                    <div className="text-green-100/50 font-mono text-sm tracking-widest">DEALER</div>
                    <div className="flex gap-4">
                        {gameState ? (
                            gameState.stage === 'SHOWDOWN' && gameState.dealerHand ? (
                                gameState.dealerHand.map((c, i) => <CardView key={i} card={c} />)
                            ) : (
                                <>
                                    <CardView hidden />
                                    <CardView hidden />
                                </>
                            )
                        ) : (
                            <div className="h-36 w-48 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20">
                                Waiting for deal...
                            </div>
                        )}
                    </div>
                </div>

                {/* Community Cards */}
                <div className="flex gap-4 p-6 bg-black/20 rounded-full border border-white/5">
                    {gameState && gameState.communityCards.map((c, i) => (
                        <CardView key={i} card={c} />
                    ))}
                    {(!gameState || gameState.communityCards.length === 0) && (
                        <div className="text-white/30 font-mono">COMMUNITY CARDS</div>
                    )}
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        {gameState ? (
                            gameState.playerHand.map((c, i) => <CardView key={i} card={c} />)
                        ) : (
                            <div className="h-36 w-48 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20">
                                Your Hand
                            </div>
                        )}
                    </div>
                    <div className="text-green-100/50 font-mono text-sm tracking-widest">YOU</div>
                </div>

                {/* Result Overlay */}
                <AnimatePresence>
                    {gameState?.stage === 'SHOWDOWN' && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                        >
                            <div className="bg-[#0f0518] border border-purple-500 p-12 rounded-3xl text-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                                <h2 className={`text-6xl font-black mb-4 ${gameState.result === 'WIN' ? 'text-green-400' : gameState.result === 'LOSS' ? 'text-red-500' : 'text-yellow-400'}`}>
                                    {gameState.result}
                                </h2>
                                <p className="text-2xl text-white mb-8 font-mono">{gameState.handRank}</p>
                                <button
                                    onClick={() => setGameState(null)}
                                    className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                                >
                                    PLAY AGAIN
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md p-4 rounded-full border border-white/10 flex items-center gap-8 shadow-2xl z-40">
                    {!gameState || gameState.stage === 'FOLDED' || gameState.stage === 'SHOWDOWN' ? (
                        <>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setAnte(Math.max(10, ante - 10))} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">-</button>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400">ANTE</div>
                                    <div className="text-xl font-bold text-white">{ante}</div>
                                </div>
                                <button onClick={() => setAnte(ante + 10)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">+</button>
                            </div>
                            <button
                                onClick={deal}
                                disabled={loading}
                                className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                            >
                                {loading ? 'DEALING...' : 'DEAL HAND'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-white font-mono">
                                POT: <span className="text-green-400">{ante * 3}</span>
                            </div>
                            <button
                                onClick={fold}
                                disabled={loading}
                                className="px-8 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 font-bold rounded-full transition-all"
                            >
                                FOLD
                            </button>
                            <button
                                onClick={call}
                                disabled={loading}
                                className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                            >
                                CALL ({ante * 2})
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
