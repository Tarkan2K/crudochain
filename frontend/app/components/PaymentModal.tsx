"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameTitle: string;
    priceCRDO: number;
    onPaymentComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, gameTitle, priceCRDO, onPaymentComplete }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<'TRANSBANK' | 'PAYPAL' | 'CRDO' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // Exchange Rates
    const CRDO_TO_USD = 0.10;
    const USD_TO_CLP = 950;

    const priceUSD = priceCRDO * CRDO_TO_USD;
    const priceCLP = priceUSD * USD_TO_CLP;

    // Discounted CRDO Price (20% off)
    const discountedCRDO = priceCRDO * 0.8;

    const handlePayment = async () => {
        if (!selectedMethod) return;
        setProcessing(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, we would call the backend to initiate payment here.
        // For now, we simulate success.

        setSuccess(true);
        setTimeout(() => {
            onPaymentComplete();
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-center">
                        <h3 className="text-xl font-bold text-white mb-1">Purchase {gameTitle}</h3>
                        <p className="text-purple-200 text-sm">Select your payment method</p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">🎉</div>
                                <h4 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h4>
                                <p className="text-gray-400">Adding game to your library...</p>
                            </div>
                        ) : (
                            <>
                                {/* Transbank */}
                                <button
                                    onClick={() => setSelectedMethod('TRANSBANK')}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedMethod === 'TRANSBANK' ? 'bg-red-900/20 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1 rounded">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Webpay_Plus_logo.png" alt="Webpay" className="h-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">Redcompra / Webpay</div>
                                            <div className="text-xs text-gray-400">Debit & Credit Cards</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">${Math.round(priceCLP).toLocaleString('es-CL')} CLP</div>
                                    </div>
                                </button>

                                {/* PayPal */}
                                <button
                                    onClick={() => setSelectedMethod('PAYPAL')}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedMethod === 'PAYPAL' ? 'bg-blue-900/20 border-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-1 rounded">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">PayPal</div>
                                            <div className="text-xs text-gray-400">International Payments</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">${priceUSD.toFixed(2)} USD</div>
                                    </div>
                                </button>

                                {/* CRDO (Crypto) */}
                                <button
                                    onClick={() => setSelectedMethod('CRDO')}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between relative overflow-hidden ${selectedMethod === 'CRDO' ? 'bg-green-900/20 border-green-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                        20% OFF
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500/20 p-2 rounded-full text-green-400 font-bold">
                                            CRDO
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">Pay with CRDO</div>
                                            <div className="text-xs text-gray-400">Instant & Discounted</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-400">{discountedCRDO.toFixed(2)} CRDO</div>
                                        <div className="text-xs text-gray-500 line-through">{priceCRDO} CRDO</div>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!success && (
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!selectedMethod || processing}
                                className="flex-[2] py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {processing ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
