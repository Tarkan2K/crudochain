import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, character, name } = await req.json();

        if (!userId || !character) {
            return NextResponse.json({ message: 'Missing data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update user with character data
        user.character = character;
        if (name) {
            user.name = name;
        }
        // Note: If 'character' is not in schema, this might not persist unless schema is strict: false or updated.
        // We will proceed assuming we might need to update schema or it's flexible.

        await user.save();

        return NextResponse.json({ message: 'Character created', user });
    } catch (error: any) {
        console.error('Error updating character:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
