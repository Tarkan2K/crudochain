'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';

interface PortfolioItem {
    ticker: string;
    amount: number;
    value: number; // Estimated Value in USDT
}

export default function WalletPage() {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [crdoBalance, setCrdoBalance] = useState(0);
    const [isFounder, setIsFounder] = useState(false);
    const { userAddress, userId, email } = useAuth();

    useEffect(() => {
        if (userAddress) fetchWallet();
    }, [userAddress]);

    const handleClaim = async () => {
        try {
            const res = await fetch('http://127.0.0.1:18080/wallet/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: userAddress })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchWallet();
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Error connecting to backend');
        }
    };

    const fetchWallet = async () => {
        try {
            // Fetch Native CRDO Balance
            let currentCrdoBalance = 0;
            if (userId || email) {
                const query = new URLSearchParams();
                if (userId) query.append('userId', userId);
                if (email) query.append('email', email);

                const balanceRes = await fetch(`/api/user/balance?${query.toString()}`);
                const balanceData = await balanceRes.json();
                if (balanceData.crdoBalance !== undefined) {
                    currentCrdoBalance = balanceData.crdoBalance;
                    setCrdoBalance(currentCrdoBalance);
                }
                if (balanceData.isFounder) {
                    setIsFounder(true);
                }
            }

            // Fetch Token Balances
            // const res = await fetch(`http://127.0.0.1:18080/wallet/${userAddress}`);
            // const data = await res.json();
            const data = {}; // Mock empty for now as we don't have C++ backend

            // Transform to Portfolio Items
            interface TokenData {
                ticker: string;
                price: number;
            }
            const tokensRes = await fetch('/api/tokens');
            const tokensData = await tokensRes.json();

            if (!Array.isArray(tokensData)) {
                console.warn("Tokens API returned non-array:", tokensData);
                return;
            }

            const priceMap = new Map<string, number>(tokensData.map((t: TokenData) => [t.ticker, t.price]));

            const items: PortfolioItem[] = [];
            let total = 0;

            // Add CRDO Value (Assuming 1 CRDO = 1 CLP approx 0.001 USDT for display or just 1:1 for now? User said 1000 CLP = 1000 CRDO. So 1 CRDO = 1 CLP. 1 USD ~ 900 CLP. So 1 CRDO ~ 0.0011 USD)
            // Let's assume 1 CRDO = 0.001 USDT for simplicity in Net Worth
            const crdoValue = currentCrdoBalance * 0.001;
            total += crdoValue;

            for (const [ticker, amount] of Object.entries(data)) {
                const price = priceMap.get(ticker) || 0;
                const value = Number(amount) * price;
                items.push({ ticker, amount: Number(amount), value });
                total += value;
            }

            setPortfolio(items);
            setTotalValue(total);
        } catch (e) {
            console.error(e);
        }
    };

    const handleBuyCrdo = async () => {
        if (!userId && !email) {
            alert('Please log in first');
            return;
        }
        try {
            const res = await fetch('/api/mercadopago/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, email })
            });
            const data = await res.json();
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert('Error initiating payment');
            }
        } catch (e) {
            console.error(e);
            alert('Error connecting to payment server');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-green-500 selection:text-black">
            <Nav />

            <div className="container mx-auto p-6 pt-24">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-16 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-2xl absolute opacity-20"></div>
                    <h1 className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-4">Total Net Worth</h1>
                    <h2 className="text-7xl font-bold text-white mb-2 tracking-tighter">
                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-2xl text-gray-500 ml-2">USDT</span>
                    </h2>
                    <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800 mt-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400 font-mono">{userAddress}</span>
                    </div>
                    {isFounder && (
                        <div className="mt-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full font-bold text-xs tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse">
                            🏆 FOUNDER STATUS ACTIVE
                        </div>
                    )}
                </div>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Native Assets Card */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">💎</span> Native Assets
                        </h3>

                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-green-500/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">C</div>
                                <div>
                                    <p className="font-bold">Crudo Coin</p>
                                    <p className="text-xs text-gray-400">CRDO</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{crdoBalance.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">${(crdoBalance * 0.001).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Token Holdings Card */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">🚀</span> Launchpad Tokens
                        </h3>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {portfolio.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No tokens found. Go launch one!</p>
                            ) : (
                                portfolio.map((item) => (
                                    <div key={item.ticker} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-yellow-400 font-bold border border-gray-700">
                                                {item.ticker[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold">{item.ticker}</p>
                                                <p className="text-xs text-gray-400">Meme Token</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{item.amount.toLocaleString()}</p>
                                            <p className="text-xs text-green-400">${item.value.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-6 mt-12 flex-wrap">
                    <button
                        onClick={handleClaim}
                        className="bg-yellow-400 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-pulse"
                    >
                        🎁 CLAIM DAILY REWARD
                    </button>
                    <button onClick={handleBuyCrdo} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:from-green-400 hover:to-emerald-500 transition shadow-[0_0_20px_rgba(0,255,157,0.3)] flex items-center gap-2">
                        💳 BUY $CRDO
                    </button>
                    <button className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition border border-gray-700">
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}
