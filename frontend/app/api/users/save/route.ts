import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user
            Object.assign(user, body);
            await user.save();
        } else {
            // Create new user
            user = await User.create(body);
        }

        return NextResponse.json({ status: 'success', user });
    } catch (error) {
        console.error('User Save Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
