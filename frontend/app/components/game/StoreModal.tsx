'use client';

import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useState } from 'react';

interface StoreModalProps {
    onClose: () => void;
}

const STORE_ITEMS = [
    { id: 'torch', name: 'Antorcha', icon: '🔥', price: 50, type: 'decoration' },
    { id: 'rug', name: 'Alfombra', icon: '🧶', price: 100, type: 'decoration' },
    { id: 'table', name: 'Mesa de Piedra', icon: '🪑', price: 200, type: 'decoration' },
    { id: 'plant', name: 'Helecho', icon: '🌿', price: 75, type: 'decoration' },
    { id: 'chest', name: 'Cofre', icon: '📦', price: 300, type: 'decoration' },
];

export default function StoreModal({ onClose }: StoreModalProps) {
    const { buyItem } = useGame();
    const [message, setMessage] = useState('');

    const handleBuy = async (item: any) => {
        const success = await buyItem({ id: item.id, name: item.name, icon: item.icon, count: 1 }, item.price);
        if (success) {
            setMessage(`¡Compraste ${item.name}!`);
            setTimeout(() => setMessage(''), 2000);
        } else {
            setMessage('Fondos insuficientes o error.');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-[#1a1025] border border-yellow-500/50 p-8 rounded-3xl shadow-2xl max-w-4xl w-full relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-3xl font-black text-yellow-400 mb-8 text-center">TIENDA DE LA TRIBU</h2>

                {message && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-black font-bold px-4 py-2 rounded-full animate-bounce z-50">
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                    {STORE_ITEMS.map((item) => (
                        <div key={item.id} className="bg-white/5 p-6 rounded-xl flex flex-col items-center border border-white/10 hover:border-yellow-500 hover:bg-white/10 transition-all group">
                            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h3 className="text-white font-bold mb-2">{item.name}</h3>
                            <button
                                onClick={() => handleBuy(item)}
                                className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-full hover:bg-yellow-400 w-full"
                            >
                                {item.price} CRDO
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
