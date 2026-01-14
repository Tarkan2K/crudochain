import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, amount, reason } = await req.json();

        if (!userId || !amount) {
            return NextResponse.json({ message: 'Missing data' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.balance < amount) {
            return NextResponse.json({ message: 'Insufficient funds' }, { status: 400 });
        }

        user.balance -= amount;
        await user.save();

        return NextResponse.json({
            message: 'Purchase successful',
            newBalance: user.balance
        });
    } catch (error: any) {
        console.error('Error processing purchase:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
