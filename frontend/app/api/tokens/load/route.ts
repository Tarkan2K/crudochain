import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET() {
    try {
        await dbConnect();
        const tokens = await Token.find({}).sort({ createdAt: -1 });
        return NextResponse.json(tokens);
    } catch (error) {
        console.error('Tokens Load Error:', error);
        return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }
}
