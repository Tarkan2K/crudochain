'use client';

import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useState } from 'react';

interface CavernModalProps {
    onClose: () => void;
}

export default function CavernModal({ onClose }: CavernModalProps) {
    const { inventory } = useGame();
    // In a full implementation, we'd save placement positions in GameContext/DB
    // For now, let's just show the inventory items "placed" in a room visually.

    const decorations = inventory.filter(i => ['torch', 'rug', 'table', 'plant', 'chest'].includes(i.id));

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-[90%] h-[90%] bg-[#2a2a2a] rounded-3xl overflow-hidden relative shadow-2xl border-4 border-gray-600"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 bg-black/50 text-white w-10 h-10 rounded-full hover:bg-red-500 transition-colors"
                >
                    ✕
                </button>

                {/* Cavern Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')] opacity-50 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none"></div>

                <h2 className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-black text-gray-400 tracking-widest uppercase">Tu Caverna</h2>

                {/* Room Area */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[600px] h-[400px] bg-[#1a1a1a] relative rounded-xl border-b-8 border-[#0f0f0f] shadow-inner">
                        {/* Floor */}
                        <div className="absolute bottom-0 w-full h-1/3 bg-[#252525] rounded-b-lg"></div>

                        {/* Decorations (Mock Placement) */}
                        {decorations.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono">
                                VACÍO... COMPRA MUEBLES EN LA TIENDA
                            </div>
                        )}

                        {decorations.map((item, index) => (
                            <motion.div
                                key={`${item.id}-${index}`}
                                drag
                                dragConstraints={{ left: 0, right: 500, top: 0, bottom: 300 }}
                                className="absolute text-6xl cursor-move hover:scale-110 transition-transform"
                                style={{
                                    left: 50 + (index * 80) % 500,
                                    top: 200,
                                    zIndex: 10
                                }}
                            >
                                {item.icon}
                            </motion.div>
                        ))}

                        {/* Player Avatar Placeholder */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-8xl z-20">
                            🦴
                        </div>
                    </div>
                </div>

                {/* Inventory Strip */}
                <div className="absolute bottom-0 w-full h-32 bg-black/80 border-t border-white/10 p-4 flex gap-4 overflow-x-auto">
                    {decorations.map((item) => (
                        <div key={item.id} className="min-w-[80px] h-full bg-white/5 rounded-lg flex flex-col items-center justify-center border border-white/10 cursor-grab active:cursor-grabbing">
                            <div className="text-3xl">{item.icon}</div>
                            <span className="text-[10px] mt-2 text-gray-400">{item.name}</span>
                        </div>
                    ))}
                </div>

            </motion.div>
        </div>
    );
}
