import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { userAddress } = await req.json();
        if (!userAddress) return NextResponse.json({ error: 'User address required' }, { status: 400 });

        await dbConnect();
        const user = await User.findOne({ walletAddress: userAddress });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Simple claim logic: Add 100 CRDO
        // In a real app, check last claim date
        user.crdoBalance = (user.crdoBalance || 0) + 100;
        await user.save();

        return NextResponse.json({ status: 'success', newBalance: user.crdoBalance });
    } catch (error) {
        console.error('Claim Error:', error);
        return NextResponse.json({ error: 'Failed to claim' }, { status: 500 });
    }
}
