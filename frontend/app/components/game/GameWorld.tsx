'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import InteractableObject from './InteractableObject';
import MiniGameModal from './MiniGameModal';
import { useGame } from '../../context/GameContext';

export default function GameWorld() {
    const { playerPos, movePlayer, character } = useGame();
    const [activeMiniGame, setActiveMiniGame] = useState<'MINING' | 'CASINO' | null>(null);

    // Map Config
    const TILE_SIZE = 48;
    const MAP_SIZE = 40;

    const [interactables, setInteractables] = useState<{ id: number, type: 'ROCK' | 'TREE' | 'CASINO', x: number, y: number }[]>([]);

    useEffect(() => {
        const objs = [];
        objs.push({ id: 999, type: 'CASINO' as const, x: 20, y: 15 });

        // Generate Random World
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 15;
            objs.push({
                id: i,
                type: Math.random() > 0.6 ? 'ROCK' as const : 'TREE' as const,
                x: Math.floor(20 + Math.cos(angle) * radius),
                y: Math.floor(20 + Math.sin(angle) * radius)
            });
        }
        setInteractables(objs);
    }, []);

    // WASD Movement
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            let newX = playerPos.x;
            let newY = playerPos.y;

            switch (e.key) {
                case 'w': case 'ArrowUp': newY -= 1; break;
                case 's': case 'ArrowDown': newY += 1; break;
                case 'a': case 'ArrowLeft': newX -= 1; break;
                case 'd': case 'ArrowRight': newX += 1; break;
            }

            // Collision Check (Simple)
            const collision = interactables.find(obj => obj.x === newX && obj.y === newY);
            if (collision) {
                // Interaction logic could go here
                return;
            }

            // Boundary Check
            if (newX >= 0 && newX < MAP_SIZE && newY >= 0 && newY < MAP_SIZE) {
                movePlayer(newX, newY);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playerPos, movePlayer, interactables]);

    // Character Appearance
    const skinColor = character?.skinColor || '#FCD5B5';
    const hairStyle = character?.hairStyle || 0;
    const HAIR_STYLES = ['🦱', '🦳', '🦲', '👱', '🦁'];

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#2d3436]">
            {/* MiniGame Modal */}
            <AnimatePresence>
                {activeMiniGame && (
                    <MiniGameModal type={activeMiniGame} onClose={() => setActiveMiniGame(null)} />
                )}
            </AnimatePresence>

            {/* Camera Container */}
            <motion.div
                className="absolute top-1/2 left-1/2 origin-center"
                animate={{
                    x: -playerPos.x * TILE_SIZE,
                    y: -playerPos.y * TILE_SIZE,
                }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
                style={{
                    width: MAP_SIZE * TILE_SIZE,
                    height: MAP_SIZE * TILE_SIZE,
                    // Pokemon Style Perspective
                    transform: 'scale(1.5)',
                }}
            >
                {/* Ground Layer */}
                <div className="absolute inset-0 bg-[#7ea04d] shadow-2xl overflow-hidden rounded-3xl border-[20px] border-[#5c7a36]">
                    {/* Texture Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5c7a36 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

                    {/* Path to Casino */}
                    <div className="absolute top-[15px] left-[20px] w-[100px] h-[300px] bg-[#e6c288] opacity-80 rounded-full blur-xl transform rotate-45"></div>

                    {/* Grid (Optional, for debugging or style) */}
                    {/* <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] pointer-events-none opacity-5">
                        {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => (
                            <div key={i} className="border border-black/20"></div>
                        ))}
                    </div> */}
                </div>

                {/* Objects Layer (Sorted by Y for depth) */}
                {interactables.map((obj) => (
                    <InteractableObject
                        key={obj.id}
                        type={obj.type}
                        x={obj.x}
                        y={obj.y}
                        tileSize={TILE_SIZE}
                        onInteract={() => {
                            const dist = Math.sqrt(Math.pow(obj.x - playerPos.x, 2) + Math.pow(obj.y - playerPos.y, 2));
                            if (dist < 2) {
                                setActiveMiniGame(obj.type === 'CASINO' ? 'CASINO' : 'MINING');
                            }
                        }}
                    />
                ))}

                {/* Player Character */}
                <motion.div
                    className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
                    animate={{
                        left: playerPos.x * TILE_SIZE,
                        top: playerPos.y * TILE_SIZE,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ width: TILE_SIZE, height: TILE_SIZE }}
                >
                    {/* Character Sprite */}
                    <div className="relative w-10 h-10">
                        {/* Body */}
                        <div
                            className="absolute inset-0 rounded-full border-2 border-black/20 shadow-sm"
                            style={{ backgroundColor: skinColor }}
                        ></div>
                        {/* Eyes */}
                        <div className="absolute top-3 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                        <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                        {/* Hair */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl filter drop-shadow-md">
                            {HAIR_STYLES[hairStyle]}
                        </div>
                        {/* Name Tag */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[8px] px-1 rounded whitespace-nowrap backdrop-blur-sm">
                            {character?.name || 'Tu'}
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black/60"></div>
        </div>
    );
}
