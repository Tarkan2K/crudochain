'use client';

import { useState } from 'react';
import IntroSequence from './IntroSequence';
import CharacterCreator from './CharacterCreator';
import GameWorld from './GameWorld';
import GameHUD from './GameHUD';
import { AnimatePresence, motion } from 'framer-motion';

type GameState = 'INTRO' | 'CREATOR' | 'PLAYING';

export default function GameManager() {
    const [gameState, setGameState] = useState<GameState>('INTRO');

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            <AnimatePresence mode="wait">
                {gameState === 'INTRO' && (
                    <motion.div
                        key="intro"
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50"
                    >
                        <IntroSequence onComplete={() => setGameState('CREATOR')} />
                    </motion.div>
                )}

                {gameState === 'CREATOR' && (
                    <motion.div
                        key="creator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40"
                    >
                        <CharacterCreator onComplete={() => setGameState('PLAYING')} />
                    </motion.div>
                )}

                {gameState === 'PLAYING' && (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-0"
                    >
                        <GameHUD />
                        <GameWorld />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
