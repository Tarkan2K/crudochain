'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import config from './config';

interface PhaserGameProps {
    onInteraction: (type: string, active: boolean) => void;
    initialPosition?: { x: number, y: number };
}

export default function PhaserGame({ onInteraction, initialPosition }: PhaserGameProps) {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return;

        // Initialize Phaser Game
        gameRef.current = new Phaser.Game(config);

        // Pass initial data to Registry
        if (initialPosition) {
            gameRef.current.registry.set('initialPosition', initialPosition);
        }

        // Event Listener for Game Interactions
        const handleGameInteraction = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                onInteraction(customEvent.detail.type, customEvent.detail.active);
            }
        };

        const handleGameSave = async (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && customEvent.detail.position) {
                // Save to Backend
                const email = localStorage.getItem('userEmail');
                if (!email) return;

                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user/update-character`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            position: customEvent.detail.position
                        })
                    });
                    console.log('Game Saved');
                } catch (err) {
                    console.error('Save failed', err);
                }
            }
        };

        window.addEventListener('game-interaction', handleGameInteraction);
        window.addEventListener('game-save', handleGameSave);

        return () => {
            window.removeEventListener('game-interaction', handleGameInteraction);
            window.removeEventListener('game-save', handleGameSave);
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, [onInteraction]);

    return <div id="phaser-game" className="w-full h-full" />;
}
