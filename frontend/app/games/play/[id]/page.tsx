"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '../../../components/Nav';
import { useAuth } from '../../../context/AuthContext';

interface Game {
    id: string;
    title: string;
    gameUrl: string;
}

export default function PlayGamePage() {
    const { id } = useParams();
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, we should check if the user OWNS the game here.
        // For now, we just load it.
        const fetchGame = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/list`);
                const games = await res.json();
                const foundGame = games.find((g: any) => g.id === id);

                if (foundGame) {
                    setGame(foundGame);
                } else {
                    alert('Game not found!');
                    router.push('/games');
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };

        if (id) fetchGame();
    }, [id, router]);

    if (loading) return <div className="min-h-screen bg-[#0f0518] text-white flex items-center justify-center">Loading...</div>;
    if (!game) return null;

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans flex flex-col">
            <Nav />
            <div className="flex-1 flex flex-col pt-24">
                <div className="bg-black/50 p-4 flex justify-between items-center border-b border-white/10">
                    <h1 className="text-xl font-bold text-purple-400">{game.title}</h1>
                    <button
                        onClick={() => router.push('/games')}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                    >
                        Exit Game
                    </button>
                </div>
                <div className="flex-1 relative">
                    <iframe
                        src={game.gameUrl}
                        className="absolute inset-0 w-full h-full border-none"
                        title={game.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}
