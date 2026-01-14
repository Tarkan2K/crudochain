'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../../context/GameContext';

interface Dust {
    id: number;
    x: number;
    y: number;
    size: number;
}

export default function CavernInterior({ onExit }: { onExit: () => void }) {
    const { character } = useGame();
    const [dust, setDust] = useState<Dust[]>(() => {
        // Generate random dust
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 80 + 10, // % positions
            y: Math.random() * 80 + 10,
            size: Math.random() * 20 + 10
        }));
    });

    const cleanDust = (id: number) => {
        setDust(prev => prev.filter(d => d.id !== id));
    };

    // Character Appearance
    const skinColor = character?.skinColor || '#FCD5B5';
    const hairStyle = character?.hairStyle || 0;
    const HAIR_STYLES = ['🦱', '🦳', '🦲', '👱', '🦁'];

    return (
        <div className="relative w-full h-full bg-[#1a1025] overflow-hidden flex items-center justify-center">
            {/* Cave Walls Background */}
            <div className="absolute inset-0 bg-[url('/assets/cave_wall.png')] opacity-50 bg-cover"></div>
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90"></div>

            {/* Floor */}
            <div className="w-[80%] h-[80%] bg-[#2d2436] rounded-[3rem] relative shadow-2xl border-8 border-[#1a1025]">

                {/* Dust Particles */}
                {dust.map((d) => (
                    <motion.button
                        key={d.id}
                        initial={{ opacity: 0.8, scale: 1 }}
                        whileHover={{ scale: 1.2, opacity: 1 }}
                        whileTap={{ scale: 0, opacity: 0 }}
                        onClick={() => cleanDust(d.id)}
                        className="absolute bg-gray-600 rounded-full blur-sm cursor-pointer hover:bg-gray-500 transition-colors"
                        style={{
                            left: `${d.x}%`,
                            top: `${d.y}%`,
                            width: d.size,
                            height: d.size,
                        }}
                    />
                ))}

                {/* Player (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative w-24 h-24">
                        {/* Body */}
                        <div
                            className="absolute inset-0 rounded-full border-4 border-black/40 shadow-xl"
                            style={{ backgroundColor: skinColor }}
                        ></div>
                        {/* Eyes */}
                        <div className="absolute top-6 left-4 w-3 h-3 bg-black rounded-full"></div>
                        <div className="absolute top-6 right-4 w-3 h-3 bg-black rounded-full"></div>
                        {/* Hair */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl filter drop-shadow-lg">
                            {HAIR_STYLES[hairStyle]}
                        </div>
                    </div>
                    <div className="mt-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {character?.name || 'Tu'}
                    </div>
                </div>

                {/* Exit Button */}
                <button
                    onClick={onExit}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                >
                    SALIR AL MUNDO
                </button>
            </div>
        </div>
    );
}
