import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const userId = searchParams.get('userId');

        if (!email && !userId) {
            return NextResponse.json({ error: 'Email or User ID required' }, { status: 400 });
        }

        await dbConnect();

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (userId) {
            user = await User.findById(userId);
        }

        if (!user) {
            return NextResponse.json(null); // Return null if not found, consistent with find logic
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('User Find Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
