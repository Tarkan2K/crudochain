"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '../components/Nav';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError('All fields are necessary.');
            return;
        }

        try {
            const resUserExists = await fetch('api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const { message } = await resUserExists.json();

            if (resUserExists.ok) {
                // Auto login or redirect to login
                router.push('/login');
            } else {
                setError(message);
            }
        } catch (error) {
            console.log('Error during registration: ', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans flex flex-col">
            <Nav />
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 w-full max-w-md backdrop-blur-sm">
                    <h1 className="text-3xl font-black mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        Create Account
                    </h1>

                    {error && (
                        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Register
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-green-400 hover:text-green-300 font-bold">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
