import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
// We need a Game model or Library model. 
// The db_service used a 'library' object. 
// Let's assume we store library items in a 'Library' collection or inside 'User'.
// For now, let's create a simple Library model schema if it doesn't exist, 
// or just use a generic collection access.

import mongoose from 'mongoose';

const LibrarySchema = new mongoose.Schema({
    userAddress: { type: String, required: true },
    games: [{
        gameId: String,
        purchaseDate: { type: Date, default: Date.now }
    }]
});

const Library = mongoose.models.Library || mongoose.model('Library', LibrarySchema);

export async function GET(req: Request, { params }: { params: { address: string } }) {
    try {
        const { address } = params;
        await dbConnect();

        const libraryEntry = await Library.findOne({ userAddress: address });

        // If no library, return empty array
        return NextResponse.json(libraryEntry ? libraryEntry.games : []);
    } catch (error) {
        console.error('Library Load Error:', error);
        return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
    }
}
