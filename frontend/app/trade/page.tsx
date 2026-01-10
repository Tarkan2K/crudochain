'use client';

import Nav from '../components/Nav';
import { TradingChart } from '../components/TradingChart';
import { OrderBook } from '../components/OrderBook';
import { OrderForm } from '../components/OrderForm';

export default function TradePage() {
    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col relative overflow-hidden">
            <Nav />

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(green 1px, transparent 1px), linear-gradient(90deg, green 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            <div className="flex-grow p-4 md:p-8 pt-24 relative z-10 flex flex-col h-screen">
                {/* Header Info */}
                <div className="flex items-center gap-8 mb-6 px-4">
                    <h1 className="text-2xl font-bold text-white tracking-tighter">CRDO / USDT</h1>
                    <div className="flex gap-8 text-xs">
                        <div>
                            <span className="block text-gray-500 mb-1">Last Price</span>
                            <span className="text-green-400 font-bold text-lg">118.05</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1">24h Change</span>
                            <span className="text-green-400">+5.4%</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 mb-1">24h Volume</span>
                            <span className="text-white">1,204,500 CRDO</span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">

                    {/* LEFT: Chart (8 cols) */}
                    <div className="col-span-12 lg:col-span-8 h-[500px] lg:h-full">
                        <TradingChart />
                    </div>

                    {/* MIDDLE: Order Book (2 cols) */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-2 h-[400px] lg:h-full">
                        <OrderBook />
                    </div>

                    {/* RIGHT: Order Form (2 cols) */}
                    <div className="col-span-12 md:col-span-6 lg:col-span-2 h-auto lg:h-full">
                        <OrderForm />
                    </div>

                </div>
            </div>
        </div>
    );
}
