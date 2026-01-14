import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        if (!userId && !email) {
            return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
        }

        await dbConnect();

        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            crdoBalance: user.balance || 0,
            isFounder: user.isFounder || false
        });
    } catch (error) {
        console.error('Balance Error:', error);
        return NextResponse.json({ error: 'Error fetching balance' }, { status: 500 });
    }
}
