'use client';

import Nav from '../components/Nav';
import GameManager from '../components/game/GameManager';

export default function WorldPage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            <Nav />
            <GameManager />
        </div>
    );
}
