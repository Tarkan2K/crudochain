import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, gameData } = await req.json();

        if (!userId || !gameData) {
            return NextResponse.json({ message: 'Missing data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Merge/Update gameData
        user.gameData = {
            ...user.gameData,
            ...gameData
        };

        await user.save();

        return NextResponse.json({ message: 'Game saved', gameData: user.gameData });
    } catch (error: any) {
        console.error('Error saving game:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
