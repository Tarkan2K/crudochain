import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
// Assuming we have a Game model or just return a static list for now if not in DB.
// The C++ backend returned a hardcoded list or loaded from DB.
// Let's return the standard list for now to ensure the page loads.

const GAMES = [
    { id: 'poker', title: 'Texas Hold\'em Poker', description: 'Classic Poker game', image: '/images/poker.jpg' },
    { id: 'blackjack', title: 'Blackjack', description: 'Beat the dealer', image: '/images/blackjack.jpg' },
    { id: 'slots', title: 'Lucky Slots', description: 'Spin to win', image: '/images/slots.jpg' },
    { id: 'roulette', title: 'Roulette', description: 'Bet on your lucky number', image: '/images/roulette.jpg' }
];

export async function GET() {
    return NextResponse.json(GAMES);
}
