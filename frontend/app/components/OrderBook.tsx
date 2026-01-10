'use client';
import { useState, useEffect } from 'react';

export const OrderBook = () => {
    const [sells, setSells] = useState<{ price: number; amount: number }[]>([]);
    const [buys, setBuys] = useState<{ price: number; amount: number }[]>([]);

    useEffect(() => {
        const fetchOrderBook = async () => {
            try {
                const res = await fetch('http://127.0.0.1:18080/orderbook');
                const data = await res.json();

                // Sort sells ascending (lowest price first)
                const sortedSells = data.sells.sort((a: any, b: any) => a.price - b.price);
                // Sort buys descending (highest price first)
                const sortedBuys = data.buys.sort((a: any, b: any) => b.price - a.price);

                setSells(sortedSells);
                setBuys(sortedBuys);
            } catch (error) {
                console.error('Failed to fetch order book:', error);
            }
        };

        fetchOrderBook();
        const interval = setInterval(fetchOrderBook, 1000); // Poll every second
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/40 backdrop-blur-md border border-green-900/30 rounded-2xl p-4 h-full flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-green-500/50 mb-4">Order Book</h3>

            {/* Header */}
            <div className="flex justify-between text-[10px] text-gray-500 mb-2 px-2">
                <span>Price (USDT)</span>
                <span>Amount (CRDO)</span>
            </div>

            {/* Sells (Red) */}
            <div className="flex-1 flex flex-col-reverse justify-end gap-1 mb-2 overflow-hidden">
                {sells.map((order, i) => (
                    <div key={i} className="flex justify-between text-xs px-2 hover:bg-red-900/10 cursor-pointer transition-colors relative">
                        <span className="text-red-500">{order.price.toFixed(2)}</span>
                        <span className="text-gray-400">{order.amount}</span>
                        <div className="absolute right-0 top-0 h-full bg-red-900/10" style={{ width: `${(order.amount / 1000) * 100}%` }}></div>
                    </div>
                ))}
            </div>

            {/* Current Price */}
            <div className="py-2 border-y border-green-900/30 text-center my-2">
                <span className="text-xl font-bold text-green-400">118.05</span>
                <span className="text-xs text-green-500/50 ml-2">≈ $118.05</span>
            </div>

            {/* Buys (Green) */}
            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {buys.map((order, i) => (
                    <div key={i} className="flex justify-between text-xs px-2 hover:bg-green-900/10 cursor-pointer transition-colors relative">
                        <span className="text-green-500">{order.price.toFixed(2)}</span>
                        <span className="text-gray-400">{order.amount}</span>
                        <div className="absolute right-0 top-0 h-full bg-green-900/10" style={{ width: `${(order.amount / 1500) * 100}%` }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
