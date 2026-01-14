import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface BuyCrdoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BuyCrdoModal({ isOpen, onClose }: BuyCrdoModalProps) {
    const { userId, role } = useAuth();
    const [adminBalance, setAdminBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAdminBalance();
        }
    }, [isOpen]);

    const fetchAdminBalance = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-balance`);
            const data = await res.json();
            if (data.balance) {
                setAdminBalance(data.balance);
            }
        } catch (error) {
            console.error("Error fetching admin balance", error);
        }
    };

    const handleBuy = async (price: number, quantity: number) => {
        if (!userId) {
            alert("Please log in to buy CRDO");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create_preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Pack ${quantity.toLocaleString()} CRDO`,
                    price: price,
                    quantity: quantity,
                    userId: userId
                })
            });
            const data = await res.json();
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert('Error initiating payment');
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error connecting to payment server: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const options = [
        { price: 50, quantity: 10000, label: "PACK FUNDADOR" },
        { price: 1000, quantity: 1000, label: "PACK 1K" },
        { price: 5000, quantity: 5000, label: "PACK 5K" },
        { price: 10000, quantity: 10000, label: "PACK 10K" },
        { price: 20000, quantity: 20000, label: "PACK 20K" },
        { price: 50000, quantity: 50000, label: "PACK 50K" },
        { price: 100000, quantity: 100000, label: "PACK 100K" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#0f0518] border border-white/10 rounded-[2rem] p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_100px_rgba(0,255,157,0.1)]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-16 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,157,0.4)] animate-pulse">
                                <span className="text-3xl font-bold text-black">C</span>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black mb-4 text-white tracking-tighter">
                                BUY <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">$CRDO</span>
                            </h2>
                            <p className="text-gray-400 uppercase tracking-[0.3em] text-sm mb-12">
                                Official Token of CrudoChain
                            </p>

                            {/* Only show Treasury Supply to Admin */}
                            {role === 'admin' && (
                                <div className="inline-flex items-center gap-4 bg-white/5 rounded-full px-8 py-3 border border-white/10 backdrop-blur-sm">
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Treasury Supply</p>
                                        <p className="text-2xl font-bold text-white font-mono">{adminBalance ? adminBalance.toLocaleString() : 'Loading...'}</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Est. Value</p>
                                        <p className="text-xl font-bold text-green-400 font-mono">??? USDT</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {options.map((opt) => (
                                <div
                                    key={opt.price}
                                    onClick={() => !loading && handleBuy(opt.price, opt.quantity)}
                                    className={`group relative bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:bg-[#222] transition-all cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-2xl ${opt.price === 50 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : ''}`}
                                >
                                    {opt.price === 50 && (
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-widest">
                                            LIMITED
                                        </div>
                                    )}

                                    <div className="flex flex-col h-full justify-between">
                                        <div className="mb-6">
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-widest ${opt.price === 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>
                                                {opt.label}
                                            </span>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-white">{opt.quantity.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500 font-bold">CRDO</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                            <div className="text-lg font-bold text-white">
                                                ${opt.price.toLocaleString()} <span className="text-xs text-gray-500 font-normal">CLP</span>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${opt.price === 50 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white group-hover:bg-green-500 group-hover:text-black'}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
