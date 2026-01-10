import { NextResponse } from 'next/server';

const DB_SERVICE_URL = 'http://127.0.0.1:3001';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');

        if (!userId && !email) {
            return NextResponse.json({ error: 'User ID or Email is required' }, { status: 400 });
        }

        const query = new URLSearchParams();
        if (userId) query.append('userId', userId);
        if (email) query.append('email', email);

        const res = await fetch(`${DB_SERVICE_URL}/users/find?${query.toString()}`);
        const user = await res.json();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            crdoBalance: user.crdoBalance || 0,
            isFounder: user.isFounder || false
        });
    } catch (error) {
        console.error('Balance Error:', error);
        return NextResponse.json({ error: 'Error fetching balance' }, { status: 500 });
    }
}
