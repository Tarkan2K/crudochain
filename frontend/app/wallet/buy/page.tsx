"use client";

import { useState } from 'react';
import Nav from '../../components/Nav';
import { motion } from 'framer-motion';

export default function BuyPage() {
    const [amount, setAmount] = useState(1000);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate API call to Stripe/Transbank
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white font-sans flex flex-col">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 p-12 rounded-3xl border border-green-500/30 text-center max-w-md"
                    >
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                            ✓
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-green-400">Payment Successful!</h2>
                        <p className="text-gray-300 mb-8">
                            You have successfully purchased <span className="text-white font-bold">{amount.toLocaleString()} CRDO</span>.
                        </p>
                        <button
                            onClick={() => window.location.href = '/wallet'}
                            className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Go to Wallet
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans flex flex-col">
            <Nav />

            <div className="flex-1 container mx-auto px-4 pt-24 pb-12 flex flex-col md:flex-row gap-12 items-start justify-center">

                {/* Order Summary */}
                <div className="w-full max-w-md">
                    <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        Buy $CRDO
                    </h1>
                    <p className="text-gray-400 mb-8">Instant delivery. Low fees.</p>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                        <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Amount to Buy</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-3xl font-mono font-bold focus:outline-none focus:border-green-500 transition-colors"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">CRDO</span>
                        </div>
                        <div className="flex justify-between mt-4 text-sm">
                            <span className="text-gray-400">Price per token:</span>
                            <span className="text-white">$0.001 USD</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xl font-bold border-t border-white/10 pt-4">
                            <span>Total:</span>
                            <span>${(amount * 0.001).toFixed(2)} USD</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="w-full max-w-md bg-white text-black rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-black rounded-full"></span>
                        Payment Details
                    </h3>

                    {/* Method Selector */}
                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'card' ? 'bg-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                        >
                            💳 Card
                        </button>
                        <button
                            onClick={() => setPaymentMethod('crypto')}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'crypto' ? 'bg-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                        >
                            ₿ Crypto
                        </button>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-black transition-colors"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                    <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                    <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    `Pay $${(amount * 0.001).toFixed(2)}`
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                🔒 Secured by <span className="font-bold text-gray-600">Stripe</span>
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
