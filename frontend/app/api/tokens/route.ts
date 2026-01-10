import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET() {
    try {
        await dbConnect();
        const tokens = await Token.find({}).sort({ createdAt: -1 });
        return NextResponse.json(tokens);
    } catch (error) {
        console.error("Tokens API Error:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ticker, name, description, image, creatorWallet } = body;

        if (!ticker || !name || !creatorWallet) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const newToken = await Token.create({
            ticker,
            name,
            description,
            image,
            creatorWallet,
            marketCap: 0,
            replies: 0,
            price: 0.00001,
            priceChange: 0,
            createdAt: Date.now()
        });

        return NextResponse.json({ status: 'success', token: newToken });
    } catch (error) {
        console.error("Tokens API Error:", error);
        return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }
}
