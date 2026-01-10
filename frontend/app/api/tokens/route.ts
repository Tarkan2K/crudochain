import { NextResponse } from 'next/server';

const DB_SERVICE_URL = 'http://127.0.0.1:3001';

export async function GET() {
    try {
        // Fetch from DB Service (In-Memory)
        const res = await fetch(`${DB_SERVICE_URL}/tokens/load`);
        if (!res.ok) {
            throw new Error('Failed to fetch from DB Service');
        }
        const tokens = await res.json();
        return NextResponse.json(tokens);
    } catch (error) {
        console.error("Tokens API Error:", error);
        // Return empty array on error to prevent frontend crash
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Proxy save to DB Service
        // First, get existing tokens
        const resLoad = await fetch(`${DB_SERVICE_URL}/tokens/load`);
        const currentTokens = await resLoad.json();

        // Add new token
        const newToken = {
            ...body,
            currentSupply: 1000000000,
            marketCap: 5000,
            price: 0.000005,
            createdAt: Date.now()
        };

        const updatedTokens = [newToken, ...currentTokens];

        // Save back
        const resSave = await fetch(`${DB_SERVICE_URL}/tokens/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTokens)
        });

        if (!resSave.ok) {
            throw new Error('Failed to save to DB Service');
        }

        return NextResponse.json({ status: 'success', token: newToken });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }
}
