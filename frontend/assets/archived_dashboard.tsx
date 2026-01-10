'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import Nav from '../app/components/Nav';

export default function DashboardPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [balance, setBalance] = useState<number>(0);

    // Admin Public Key (Hardcoded for now as per plan)
    const ADMIN_KEY = "be45e02d8cbe78a506257c2e6a4bfa26222cff54e79448d1e5b29636b795878b";

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        // Fetch Admin Balance
        const fetchBalance = async () => {
            try {
                const res = await fetch('http://127.0.0.1:18080/chain');
                const chain = await res.json();

                let bal = 0;
                chain.forEach((block: any) => {
                    const data = block.data;
                    if (data.to === ADMIN_KEY) bal += data.amount;
                    if (data.from === ADMIN_KEY) bal -= data.amount;
                });
                setBalance(bal);
            } catch (e) {
                console.error("Failed to fetch balance", e);
            }
        };

        fetchBalance();
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col relative overflow-hidden">
            <Nav />

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(green 1px, transparent 1px), linear-gradient(90deg, green 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            <div className="flex-grow p-8 md:p-24 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-16">
                        <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white mb-2">
                            COMMAND CENTER
                        </h1>
                        <p className="text-green-500/50 tracking-widest text-sm">ADMINISTRATOR ACCESS GRANTED</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* MAIN BALANCE CARD */}
                        <div className="bg-black/40 backdrop-blur-2xl border border-green-900/30 rounded-[3rem] p-12 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-sm uppercase tracking-widest opacity-50 mb-4">Total Net Worth</h3>
                            <div className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tighter">
                                {balance.toLocaleString()} <span className="text-green-500 text-2xl align-top">CRDO</span>
                            </div>
                            <p className="text-green-400/60 text-sm">≈ ${(balance * 0.05).toLocaleString()} USD (Est.)</p>
                        </div>

                        {/* LIQUIDITY POOL CARD */}
                        <div className="bg-green-900/10 backdrop-blur-2xl border border-green-900/30 rounded-[3rem] p-12 relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-sm uppercase tracking-widest opacity-50 mb-4">Global Liquidity Pool</h3>
                            <div className="text-5xl md:text-7xl font-bold text-green-400 mb-2 tracking-tighter">
                                1,000,000,000 <span className="text-white/50 text-2xl align-top">CRDO</span>
                            </div>
                            <div className="w-full bg-green-900/30 h-1 mt-8 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full w-full animate-pulse"></div>
                            </div>
                            <p className="text-green-400/60 text-xs mt-2 text-right">100% HEALTHY</p>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY (Placeholder for now) */}
                    <div className="mt-8 bg-black/20 backdrop-blur-md border border-green-900/30 rounded-[2rem] p-8">
                        <h3 className="text-sm uppercase tracking-widest opacity-50 mb-6">System Status</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-400">Mainnet Online</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-500">Block Height: Loading...</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
