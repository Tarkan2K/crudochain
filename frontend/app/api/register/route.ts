import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const DB_SERVICE_URL = 'http://127.0.0.1:3001';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists via DB Service
        const resFind = await fetch(`${DB_SERVICE_URL}/users/find?email=${email}`);
        const existingUser = await resFind.json();

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a random wallet address
        const randomHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const walletAddress = `0x${randomHex}`;

        const newUser = {
            name,
            email,
            password: hashedPassword,
            walletAddress,
            crdoBalance: 0,
            isFounder: false,
            createdAt: Date.now()
        };

        // Save to DB Service
        const resSave = await fetch(`${DB_SERVICE_URL}/users/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!resSave.ok) {
            throw new Error('Failed to save user to DB Service');
        }

        return NextResponse.json({ message: 'User created successfully', walletAddress }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
