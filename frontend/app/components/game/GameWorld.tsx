'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function GameWorld() {
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });

    // Mock Map Data
    const TILE_SIZE = 64;
    const MAP_SIZE = 20; // 20x20 grid

    // Generate random rocks/caves
    const [obstacles, setObstacles] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        const obs = [];
        for (let i = 0; i < 15; i++) {
            obs.push({
                x: Math.floor(Math.random() * MAP_SIZE),
                y: Math.floor(Math.random() * MAP_SIZE)
            });
        }
        setObstacles(obs);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#1a1a2e]">
            {/* Camera Container */}
            <motion.div
                className="absolute top-1/2 left-1/2 origin-center"
                style={{
                    width: MAP_SIZE * TILE_SIZE,
                    height: MAP_SIZE * TILE_SIZE,
                    x: -cameraPos.x,
                    y: -cameraPos.y,
                    rotateX: 60, // Isometric tilt
                    rotateZ: 45, // Isometric rotation
                }}
            >
                {/* Ground */}
                <div className="absolute inset-0 bg-green-800 border-4 border-green-900 shadow-2xl grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)]">
                    {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => (
                        <div key={i} className="border border-green-700/30"></div>
                    ))}
                </div>

                {/* Obstacles (Caves/Rocks) */}
                {obstacles.map((obs, i) => (
                    <div
                        key={i}
                        className="absolute w-16 h-16 bg-gray-600 rounded-lg shadow-xl"
                        style={{
                            left: obs.x * TILE_SIZE,
                            top: obs.y * TILE_SIZE,
                            transform: 'translateZ(20px)', // Lift up 
                        }}
                    >
                        <div className="w-full h-full bg-gray-500 rounded-lg transform -translate-y-2"></div>
                    </div>
                ))}

                {/* Player Character */}
                <div
                    className="absolute w-16 h-16 bg-orange-500 rounded-full shadow-lg z-20 flex items-center justify-center"
                    style={{
                        left: (MAP_SIZE / 2) * TILE_SIZE,
                        top: (MAP_SIZE / 2) * TILE_SIZE,
                        transform: 'translateZ(30px) rotateZ(-45deg) rotateX(-60deg)', // Counter-rotate to face screen
                    }}
                >
                    <span className="text-2xl">🦴</span>
                </div>

            </motion.div>

            {/* Fog of War / Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/80"></div>
        </div>
    );
}
