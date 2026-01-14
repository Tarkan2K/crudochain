'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import InteractableObject from './InteractableObject';
import MiniGameModal from './MiniGameModal';
import { useGame } from '../../context/GameContext';

export default function GameWorld() {
    const { playerPos, movePlayer } = useGame();
    const [activeMiniGame, setActiveMiniGame] = useState<'MINING' | 'CASINO' | null>(null);

    // Mock Map Data
    const TILE_SIZE = 64;
    const MAP_SIZE = 40;

    const [interactables, setInteractables] = useState<{ id: number, type: 'ROCK' | 'TREE' | 'CASINO', x: number, y: number }[]>([]);

    useEffect(() => {
        const objs = [];
        objs.push({ id: 999, type: 'CASINO' as const, x: 25, y: 25 });

        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 16 + Math.random() * 4;
            objs.push({
                id: i,
                type: Math.random() > 0.5 ? 'ROCK' as const : 'TREE' as const,
                x: Math.floor(20 + Math.cos(angle) * radius),
                y: Math.floor(20 + Math.sin(angle) * radius)
            });
        }
        setInteractables(objs);
    }, []);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Simple movement logic: Move to clicked tile
        // In a real game, we'd do pathfinding. Here, we just teleport or lerp.
        // For "Click-to-Move" feel, let's just update target.

        // Calculate tile from click is hard with CSS transforms. 
        // Simplified: Just move randomly for now or use buttons? 
        // Actually, let's make it WASD or Arrow Keys for better control in this prototype?
        // Or just click adjacent tiles.

        // Let's implement simple WASD listener instead for smoother "game" feel.
    };

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

            // Boundary Check
            if (newX >= 0 && newX < MAP_SIZE && newY >= 0 && newY < MAP_SIZE) {
                movePlayer(newX, newY);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playerPos, movePlayer]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#1a1a2e]">
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
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                style={{
                    width: MAP_SIZE * TILE_SIZE,
                    height: MAP_SIZE * TILE_SIZE,
                    rotateX: 60,
                    rotateZ: 45,
                }}
            >
                {/* Ground (Concentric Rings) */}
                <div className="absolute inset-0 bg-green-900 border-4 border-green-900 shadow-2xl overflow-hidden">
                    {/* Era 7 (Center) - Neon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-900/50 border-4 border-purple-500 shadow-[0_0_100px_rgba(168,85,247,0.5)] z-0"></div>

                    {/* Grid */}
                    <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] pointer-events-none opacity-20">
                        {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => (
                            <div key={i} className="border border-white/10"></div>
                        ))}
                    </div>
                </div>

                {/* Interactables */}
                {interactables.map((obj) => (
                    <InteractableObject
                        key={obj.id}
                        type={obj.type}
                        x={obj.x}
                        y={obj.y}
                        tileSize={TILE_SIZE}
                        onInteract={() => {
                            // Check distance
                            const dist = Math.sqrt(Math.pow(obj.x - playerPos.x, 2) + Math.pow(obj.y - playerPos.y, 2));
                            if (dist < 2) {
                                setActiveMiniGame(obj.type === 'CASINO' ? 'CASINO' : 'MINING');
                            } else {
                                alert("Too far! Get closer.");
                            }
                        }}
                    />
                ))}

                {/* Player Character */}
                <motion.div
                    className="absolute w-16 h-16 bg-orange-500 rounded-full shadow-lg z-20 flex items-center justify-center border-2 border-white"
                    animate={{
                        left: playerPos.x * TILE_SIZE,
                        top: playerPos.y * TILE_SIZE,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                        transform: 'translateZ(30px) rotateZ(-45deg) rotateX(-60deg)', // Counter-rotate to face screen
                    }}
                >
                    <span className="text-2xl">🦴</span>
                </motion.div>

            </motion.div>

            {/* Fog of War / Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/90"></div>

            {/* Controls Hint */}
            <div className="absolute bottom-8 left-8 text-white/50 font-mono text-xs pointer-events-none">
                USE W,A,S,D TO MOVE
            </div>
        </div>
    );
}
