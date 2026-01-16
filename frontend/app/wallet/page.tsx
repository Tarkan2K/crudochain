'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';
import BuyCrdoModal from '../components/BuyCrdoModal';

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
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    useEffect(() => {
        if (userId || email || userAddress) fetchWallet();
    }, [userId, email, userAddress]);

    const handleClaim = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/claim`, {
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
            alert('Error conectando al backend');
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

    const [isProcessing, setIsProcessing] = useState(false);

    const handleBuyCrdo = () => {
        if (!userId && !email) {
            alert('Por favor inicia sesión primero');
            return;
        }
        setIsBuyModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-green-500 selection:text-black">
            <Nav />
            <BuyCrdoModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />

            <div className="container mx-auto p-6 pt-24">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-24 animate-fade-in relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <h1 className="text-gray-500 text-xs tracking-[0.4em] uppercase mb-6 font-bold">Patrimonio Neto Total</h1>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-8xl font-black text-white tracking-tighter">
                            {crdoBalance !== undefined ? crdoBalance.toLocaleString('es-CL') : '0'}
                        </span>
                        <span className="text-2xl font-bold text-gray-600">CRDO</span>
                    </div>

                    <div className="mb-8 text-xl font-bold text-green-500/80 font-mono">
                        ≈ ${(crdoBalance * 0.001).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </div>

                    <div className="flex items-center gap-2 bg-[#1a1a1a] px-6 py-2 rounded-full border border-white/5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,157,0.5)]"></div>
                        <span className="text-xs text-gray-400 font-mono tracking-wider">{email || userAddress || 'Anon'}</span>
                    </div>

                    {isFounder && (
                        <div className="mt-6 bg-yellow-500/10 text-yellow-500 px-4 py-1 rounded-full font-bold text-[10px] tracking-widest border border-yellow-500/20">
                            🏆 FUNDADOR
                        </div>
                    )}
                </div>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-24">
                    {/* Native Assets Card */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-green-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] group-hover:bg-green-500/10 transition-all"></div>

                        <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                            <span className="text-xl">💎</span> Activos Nativos
                        </h3>

                        <div className="flex justify-between items-center p-6 bg-[#111] rounded-2xl border border-white/5 hover:border-green-500/20 transition-all cursor-pointer group/item">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(0,255,157,0.3)]">C</div>
                                <div>
                                    <p className="font-bold text-lg text-white group-hover/item:text-green-400 transition-colors">Moneda Crudo</p>
                                    <p className="text-xs text-gray-500 font-bold tracking-wider">CRDO</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-white">{crdoBalance.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 font-mono">$0.00</p>
                            </div>
                        </div>
                    </div>

                    {/* Token Holdings Card */}
                    <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-2xl">🚀</span> Tokens del Lanzador
                        </h3>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {portfolio.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No se encontraron tokens. ¡Ve a lanzar uno!</p>
                            ) : (
                                portfolio.map((item) => (
                                    <div key={item.ticker} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-yellow-400 font-bold border border-gray-700">
                                                {item.ticker[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold">{item.ticker}</p>
                                                <p className="text-xs text-gray-400">Token Meme</p>
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
                        className="bg-yellow-400 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition-all shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center gap-3 uppercase tracking-wider text-sm"
                    >
                        <span>🎁</span> Reclamar Recompensa Diaria
                    </button>
                    <button
                        onClick={handleBuyCrdo}
                        className={`bg-green-500 text-white px-10 py-4 rounded-full font-black hover:bg-green-400 transition-all shadow-[0_0_30px_rgba(0,255,157,0.4)] flex items-center gap-3 uppercase tracking-wider text-sm hover:scale-105`}
                    >
                        <span>💳</span> Comprar $CRDO
                    </button>
                    <button className="bg-[#1a1a1a] text-white border border-white/10 px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-3 uppercase tracking-wider text-sm">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}
