'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface MiniGameModalProps {
    type: 'MINING' | 'CASINO' | null;
    onClose: () => void;
}

export default function MiniGameModal({ type, onClose }: MiniGameModalProps) {
    const { addItem, addXp } = useGame();
    const [spinning, setSpinning] = useState(false);
    const [slots, setSlots] = useState(['🍒', '🍒', '🍒']);
    const [message, setMessage] = useState('');

    if (!type) return null;

    const handleMine = () => {
        addItem('stone', 'Roca', '🪨', 1);
        addXp(10);
        setMessage('+1 ROCA | +10 XP');
        setTimeout(() => {
            setMessage('');
            onClose();
        }, 1000);
    };

    const handleSpin = () => {
        if (spinning) return;
        setSpinning(true);
        setMessage('');

        // Mock Spin Animation
        let count = 0;
        const interval = setInterval(() => {
            setSlots([
                ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random() * 5)],
                ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random() * 5)],
                ['🍒', '🍋', '🍇', '💎', '7️⃣'][Math.floor(Math.random() * 5)]
            ]);
            count++;
            if (count > 20) {
                clearInterval(interval);
                setSpinning(false);
                checkWin();
            }
        }, 100);
    };

    const checkWin = () => {
        // Simple win logic
        // In reality, we'd check the final state from the interval or pre-calculate it.
        // For this mock, we just check the last random state (which is risky if state update is slow, but fine for prototype)
        // Better: Calculate result first, then animate to it.

        const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
        const result = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        setSlots(result);

        if (result[0] === result[1] && result[1] === result[2]) {
            setMessage('JACKPOT! +500 CRDO');
            // Here we would call API to add balance
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            setMessage('WIN! +50 CRDO');
        } else {
            setMessage('TRY AGAIN');
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-[#1a1025] border border-purple-500/50 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                {type === 'MINING' && (
                    <div>
                        <h2 className="text-3xl font-black text-yellow-400 mb-4">MINING...</h2>
                        <div className="text-6xl mb-8 animate-bounce">⛏️</div>
                        <p className="text-gray-300 mb-8">Click to gather resources!</p>
                        <button
                            className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full hover:scale-105 transition-transform"
                            onClick={handleMine}
                        >
                            MINE ROCK
                        </button>
                        {message && <p className="mt-4 text-green-400 font-bold animate-pulse">{message}</p>}
                    </div>
                )}

                {type === 'CASINO' && (
                    <div>
                        <h2 className="text-3xl font-black text-purple-400 mb-4">SLOTS</h2>
                        <div className="flex justify-center gap-4 mb-8 bg-black/50 p-4 rounded-xl border border-purple-500/30">
                            {slots.map((s, i) => (
                                <div key={i} className="text-5xl w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg">
                                    {s}
                                </div>
                            ))}
                        </div>

                        <button
                            className={`px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:scale-105 transition-transform ${spinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSpin}
                            disabled={spinning}
                        >
                            {spinning ? 'SPINNING...' : 'SPIN (10 CRDO)'}
                        </button>
                        {message && <p className="mt-4 text-yellow-400 font-bold animate-pulse">{message}</p>}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
