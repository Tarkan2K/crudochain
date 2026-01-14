'use client';

import { motion } from 'framer-motion';

interface InteractableObjectProps {
    type: 'ROCK' | 'TREE' | 'CASINO';
    x: number;
    y: number;
    tileSize: number;
    onInteract: () => void;
}

export default function InteractableObject({ type, x, y, tileSize, onInteract }: InteractableObjectProps) {
    const getVisuals = () => {
        switch (type) {
            case 'ROCK': return { emoji: '🪨', color: 'bg-gray-600' };
            case 'TREE': return { emoji: '🌲', color: 'bg-green-700' };
            case 'CASINO': return { emoji: '🎰', color: 'bg-purple-900' };
            default: return { emoji: '❓', color: 'bg-gray-500' };
        }
    };

    const { emoji, color } = getVisuals();

    return (
        <motion.div
            className={`absolute rounded-lg shadow-xl cursor-pointer flex items-center justify-center border-2 border-white/20 hover:border-yellow-400 hover:scale-110 transition-all z-10`}
            style={{
                left: x * tileSize,
                top: y * tileSize,
                width: tileSize,
                height: tileSize,
                transform: 'translateZ(20px)', // Lift up 
            }}
            onClick={(e) => {
                e.stopPropagation();
                onInteract();
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <div className={`w-full h-full ${color} rounded-lg flex items-center justify-center text-3xl`}>
                {emoji}
            </div>

            {/* Interaction Hint */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                CLICK TO INTERACT
            </div>
        </motion.div>
    );
}
