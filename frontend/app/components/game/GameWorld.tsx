'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import MiniGameModal from './MiniGameModal';
import CavernInterior from './CavernInterior';
import dynamic from 'next/dynamic';
import StoreModal from './StoreModal'; // Import StoreModal
import CavernModal from './CavernModal'; // Import CavernModal

const PhaserGame = dynamic(() => import('./phaser/PhaserGame'), { ssr: false });
import { useGame } from '../../context/GameContext';

export default function GameWorld() {
    const { character } = useGame();
    const [activeMiniGame, setActiveMiniGame] = useState<'MINING' | null>(null);
    const [viewMode, setViewMode] = useState<'WORLD' | 'CAVERN'>('WORLD');

    // Interaction States
    const [showStore, setShowStore] = useState(false);
    const [showCavernModal, setShowCavernModal] = useState(false);

    const handleInteraction = (type: string, active: boolean) => {
        console.log('Interaction:', type, active);
        if (type === 'SHOP_PROXIMITY') {
            // In a real game, we might show a "Press E" prompt first
            // For now, let's just open it if we collide
            setShowStore(true);
        } else if (type === 'HOUSE_PROXIMITY') {
            setShowCavernModal(true);
        }
    };

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
                {showStore && <StoreModal onClose={() => setShowStore(false)} />}
                {showCavernModal && <CavernModal onClose={() => setShowCavernModal(false)} />}
            </AnimatePresence>

            {/* Phaser Engine */}
            <PhaserGame
                onInteraction={handleInteraction}
                initialPosition={character?.gameData?.position}
            />

            {/* Controls Hint */}
            <div className="absolute bottom-8 left-8 text-white/50 font-mono text-xs pointer-events-none">
                USE ARROWS TO MOVE | WALK TO BUILDINGS TO INTERACT
            </div>
        </div>
    );
}
