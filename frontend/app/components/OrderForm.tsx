'use client';

import { useState, useEffect } from 'react';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export const OrderForm = () => {
    const [mode, setMode] = useState<'spot' | 'futures'>('spot');
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [leverage, setLeverage] = useState(1);

    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [keyPair, setKeyPair] = useState<nacl.SignKeyPair | null>(null);

    useEffect(() => {
        const kp = nacl.sign.keyPair();
        setKeyPair(kp);
        console.log("Generated Session Key:", toHex(kp.publicKey));
    }, []);

    const toHex = (bytes: Uint8Array) => {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const handleSubmit = async () => {
        if (!price || !amount || !keyPair) return;

        const message = "CRUDO_DEX_ORDER";
        const signatureBytes = nacl.sign.detached(
            naclUtil.decodeUTF8(message),
            keyPair.secretKey
        );

        try {
            const response = await fetch('http://127.0.0.1:18080/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: parseFloat(price),
                    amount: parseFloat(amount),
                    isBuy: side === 'buy',
                    trader: 'User_' + toHex(keyPair.publicKey).substring(0, 8),
                    signature: toHex(signatureBytes),
                    publicKey: toHex(keyPair.publicKey)
                }),
            });

            if (response.ok) {
                // Clear inputs on success
                setPrice('');
                setAmount('');
                // Ideally show a success message or toast
                alert('Order Signed & Placed Successfully!');
            } else {
                console.error('Failed to submit order');
                alert('Failed to submit order');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error connecting to backend');
        }
    };

    return (
        <div className="bg-black/40 backdrop-blur-md border border-green-900/30 rounded-2xl p-6 h-full flex flex-col">
            {/* Tabs */}
            <div className="flex bg-black/40 rounded-lg p-1 mb-6 border border-green-900/30">
                <button
                    onClick={() => setMode('spot')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === 'spot' ? 'bg-green-900/30 text-green-400 shadow-sm' : 'text-gray-500 hover:text-green-400'}`}
                >
                    SPOT
                </button>
                <button
                    onClick={() => setMode('futures')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === 'futures' ? 'bg-green-900/30 text-green-400 shadow-sm' : 'text-gray-500 hover:text-green-400'}`}
                >
                    FUTURES
                </button>
            </div>

            {/* Leverage Slider (Futures Only) */}
            {mode === 'futures' && (
                <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500">Leverage</span>
                        <span className="text-yellow-500 font-bold">{leverage}x</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="125"
                        value={leverage}
                        onChange={(e) => setLeverage(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                        <span>1x</span>
                        <span>20x</span>
                        <span>50x</span>
                        <span>125x</span>
                    </div>
                </div>
            )}

            {/* Side Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${side === 'buy' ? 'bg-green-600 text-black border-green-500' : 'bg-transparent border-green-900/30 text-gray-500'}`}
                >
                    BUY / LONG
                </button>
                <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${side === 'sell' ? 'bg-red-600 text-black border-red-500' : 'bg-transparent border-green-900/30 text-gray-500'}`}
                >
                    SELL / SHORT
                </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Price (USDT)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-black/50 border border-green-900/30 rounded-lg p-3 text-sm text-right focus:outline-none focus:border-green-500/50"
                            placeholder="0.00"
                        />
                        <span className="absolute left-3 top-3 text-xs text-gray-600">LIMIT</span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Amount (CRDO)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-black/50 border border-green-900/30 rounded-lg p-3 text-sm text-right focus:outline-none focus:border-green-500/50"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>Total</span>
                    <span>{(parseFloat(price || '0') * parseFloat(amount || '0')).toFixed(2)} USDT</span>
                </div>
                <button
                    onClick={handleSubmit}
                    className={`w-full py-4 font-bold rounded-xl text-sm tracking-widest transition-all ${side === 'buy' ? 'bg-green-600 hover:bg-green-500 text-black' : 'bg-red-600 hover:bg-red-500 text-black'}`}
                >
                    {side === 'buy' ? (mode === 'spot' ? 'BUY CRDO' : 'OPEN LONG') : (mode === 'spot' ? 'SELL CRDO' : 'OPEN SHORT')}
                </button>
            </div>
        </div>
    );
};
