'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import MiniGameModal from './MiniGameModal';
import CavernInterior from './CavernInterior';
import IsometricCanvas from '../engine/IsometricCanvas';
import { useGame } from '../../context/GameContext';

export default function GameWorld() {
    const { character } = useGame();
    const [activeMiniGame, setActiveMiniGame] = useState<'MINING' | 'CASINO' | null>(null);
    const [viewMode, setViewMode] = useState<'WORLD' | 'CAVERN'>('WORLD');

    if (viewMode === 'CAVERN') {
        return <CavernInterior onExit={() => setViewMode('WORLD')} />;
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#1a1a2e]">
            {/* MiniGame Modal */}
            <AnimatePresence>
                {activeMiniGame && (
                    <MiniGameModal type={activeMiniGame} onClose={() => setActiveMiniGame(null)} />
                )}
            </AnimatePresence>

            {/* Custom Isometric Engine */}
            <IsometricCanvas />

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <h1 className="text-white font-bold text-xl drop-shadow-md">MUNDO DE {character?.name?.toUpperCase() || 'TI'}</h1>
                <p className="text-gray-400 text-xs">Motor: CrudoEngine v0.1 (Canvas 2D)</p>
            </div>

            {/* Controls Hint */}
            <div className="absolute bottom-8 left-8 text-white/50 font-mono text-xs pointer-events-none">
                USE W,A,S,D TO MOVE
            </div>
        </div>
    );
}
