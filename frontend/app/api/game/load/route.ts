import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            gameData: user.gameData || {},
            character: user.character,
            name: user.name
        });
    } catch (error: any) {
        console.error('Error loading game:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
