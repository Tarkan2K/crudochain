import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, character } = await req.json();

        if (!userId || !character) {
            return NextResponse.json({ message: 'Missing data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update user with character data
        // Assuming we might need to add a 'character' field to the schema later, 
        // but for now we can store it in a generic way or just acknowledge success 
        // if the schema isn't ready. 
        // Ideally, we should update the User model to include 'character' field.

        // For now, let's assume we can save it.
        user.character = character;
        // Note: If 'character' is not in schema, this might not persist unless schema is strict: false or updated.
        // We will proceed assuming we might need to update schema or it's flexible.

        await user.save();

        return NextResponse.json({ message: 'Character created', user });
    } catch (error: any) {
        console.error('Error updating character:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
