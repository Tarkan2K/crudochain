'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface MiniGameModalProps {
    type: 'MINING' | null;
    onClose: () => void;
}

export default function MiniGameModal({ type, onClose }: MiniGameModalProps) {
    const { addItem, addXp } = useGame();
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
            </motion.div>
        </div>
    );
}
