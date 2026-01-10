'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

interface Block {
    index: number;
    timestamp: number;
    data: any;
    prevHash: string;
    hash: string;
    nonce: number;
}

export default function LedgerPage() {
    const [chain, setChain] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChain = async () => {
        try {
            const res = await fetch('http://127.0.0.1:18080/chain');
            const data = await res.json();
            setChain(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch chain:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChain();
        const interval = setInterval(fetchChain, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8 selection:bg-green-900">
            <div className="max-w-6xl mx-auto">
                <Nav />

                <h2 className="text-3xl font-light mb-8 flex items-center justify-between border-b border-green-900 pb-4 tracking-widest">
                    <span>IMMUTABLE LEDGER</span>
                    <span className="text-sm font-normal opacity-50">Height: {chain.length}</span>
                </h2>

                {loading ? (
                    <div className="text-center py-20 animate-pulse">CONNECTING TO NODE...</div>
                ) : (
                    <div className="space-y-6">
                        {chain.slice().reverse().map((block) => (
                            <div key={block.hash} className="group relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-green-900 group-hover:bg-green-500 transition-colors"></div>
                                <div className="bg-gray-900 border border-green-900 p-6 rounded hover:border-green-500 transition-colors overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-green-900 text-green-100 text-sm px-3 py-1 rounded font-bold">BLOCK #{block.index}</span>
                                        <span className="text-sm opacity-50">{new Date(block.timestamp * 1000).toLocaleString()}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-4">
                                        <div>
                                            <span className="block opacity-50 uppercase text-xs mb-1">Hash</span>
                                            <span className="font-bold truncate block font-mono text-green-300" title={block.hash}>{block.hash}</span>
                                        </div>
                                        <div>
                                            <span className="block opacity-50 uppercase text-xs mb-1">Prev Hash</span>
                                            <span className="truncate block font-mono opacity-70" title={block.prevHash}>{block.prevHash}</span>
                                        </div>
                                    </div>

                                    <div className="bg-black p-4 rounded border border-green-900/50 font-mono text-sm overflow-x-auto">
                                        <span className="block opacity-50 uppercase text-xs mb-2">Data Payload</span>
                                        <pre className="text-green-200">{JSON.stringify(block.data, null, 2)}</pre>
                                    </div>

                                    <div className="mt-4 text-right">
                                        <span className="text-xs opacity-40">NONCE: {block.nonce}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
