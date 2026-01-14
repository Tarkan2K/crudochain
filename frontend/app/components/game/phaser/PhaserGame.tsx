'use client';

import { useEffect, useRef } from 'react';
import { Game, AUTO, Scale } from 'phaser';
import { BootScene } from '../../../game/scenes/BootScene';
import { PreloadScene } from '../../../game/scenes/PreloadScene';
import { GameScene } from '../../../game/scenes/GameScene';

interface PhaserGameProps {
    onInteraction?: (type: string, active: boolean) => void;
    initialPosition?: { x: number; y: number };
}

export default function PhaserGame({ onInteraction, initialPosition }: PhaserGameProps) {
    const gameContainer = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Game | null>(null);

    useEffect(() => {
        if (!gameContainer.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: AUTO,
            width: '100%',
            height: '100%',
            parent: gameContainer.current,
            backgroundColor: '#000000',
            scale: {
                mode: Scale.RESIZE,
                autoCenter: Scale.CENTER_BOTH
            },
            scene: [BootScene, PreloadScene, GameScene],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            },
            callbacks: {
                preBoot: (game) => {
                    // Pass React props to Phaser Registry
                    game.registry.set('onInteraction', onInteraction);
                    game.registry.set('initialPosition', initialPosition);
                }
            }
        };

        gameRef.current = new Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []); // We might want to update registry if props change, but for now empty dep array is safer for full reload

    // Update registry if props change (optional optimization)
    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.registry.set('onInteraction', onInteraction);
        }
    }, [onInteraction]);

    return (
        <div
            ref={gameContainer}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0 // Ensure it's behind the UI
            }}
        />
    );
}
