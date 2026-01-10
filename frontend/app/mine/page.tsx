'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { signMessage } from '../lib/crypto';

export default function MinePage() {
    const [mining, setMining] = useState(false);
    const [lastMinedBlock, setLastMinedBlock] = useState<any>(null);

    // Form State
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [myKeys, setMyKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);

    useEffect(() => {
        const savedKeys = localStorage.getItem('crudo_keys');
        if (savedKeys) {
            setMyKeys(JSON.parse(savedKeys));
        }
    }, []);

    const mineBlock = async () => {
        if (!myKeys || !toAddress || !amount) return;

        setMining(true);
        setLastMinedBlock(null);

        try {
            const amountInt = parseInt(amount);
            if (isNaN(amountInt)) throw new Error("Invalid amount");

            // 1. Construct Message
            // MUST MATCH BACKEND: from + to + amount
            const message = myKeys.publicKey + toAddress + amountInt.toString();

            // 2. Sign Message
            const signature = signMessage(message, myKeys.privateKey);

            // 3. Create Payload
            const payload = {
                from: myKeys.publicKey,
                to: toAddress,
                amount: amountInt,
                signature: signature
            };

            console.log("Sending payload:", payload);

            const res = await fetch('http://127.0.0.1:18080/mine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            setLastMinedBlock(data);
            setToAddress('');
            setAmount('');
            alert('Block successfully mined! Transaction confirmed.');
        } catch (error) {
            console.error('Failed to mine block:', error);
            alert('Mining failed! Signature rejected or server error.');
        } finally {
            setMining(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8 selection:bg-green-900">
            <div className="max-w-4xl mx-auto">
                <Nav />

                <div className="bg-gray-900/50 border border-green-900 p-8 shadow-[0_0_50px_rgba(0,255,0,0.05)] backdrop-blur">
                    <h2 className="text-3xl font-light mb-8 flex items-center justify-center tracking-widest border-b border-green-900 pb-4">
                        SECURE MINING STATION
                    </h2>

                    {!myKeys ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 mb-4">NO WALLET DETECTED</p>
                            <p className="opacity-70 mb-6">You need a cryptographic identity to sign transactions.</p>
                            <a href="/wallet" className="bg-green-600 text-black font-bold py-3 px-8 rounded hover:bg-green-500">
                                CREATE WALLET
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase opacity-50 mb-1">From (You)</label>
                                    <input
                                        type="text"
                                        value={myKeys.publicKey}
                                        disabled
                                        className="w-full bg-black border border-green-900 rounded p-4 text-xs opacity-50 cursor-not-allowed truncate"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase opacity-50 mb-1">Amount (CRDO)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black border border-green-700 rounded p-4 focus:outline-none focus:border-green-400"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase opacity-50 mb-1">To Address (Receiver)</label>
                                <input
                                    type="text"
                                    value={toAddress}
                                    onChange={(e) => setToAddress(e.target.value)}
                                    className="w-full bg-black border border-green-700 rounded p-4 focus:outline-none focus:border-green-400 text-xs font-mono"
                                    placeholder="Paste public key here..."
                                />
                            </div>

                            <div className="p-4 border border-green-900/50 rounded bg-green-900/10 text-xs opacity-70">
                                <p>🔒 <strong>SECURITY CHECK:</strong> This transaction will be cryptographically signed with your private key using Ed25519.</p>
                            </div>

                            <button
                                onClick={mineBlock}
                                disabled={mining || !toAddress || !amount}
                                className={`w-full py-6 text-xl rounded font-bold text-black transition-all transform hover:scale-[1.02] ${mining ? 'bg-yellow-500 cursor-wait' : 'bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(0,255,0,0.5)]'}`}
                            >
                                {mining ? 'SIGNING & MINING...' : 'SIGN & MINE TRANSACTION'}
                            </button>

                            {lastMinedBlock && (
                                <div className="mt-8 p-4 border border-green-500 rounded bg-green-900/20">
                                    <h3 className="text-xl font-bold mb-2">✅ Block Mined & Verified!</h3>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="block opacity-50">Hash</span>
                                            <span className="font-bold break-all">{lastMinedBlock.hash}</span>
                                        </div>
                                        <div>
                                            <span className="block opacity-50">Nonce</span>
                                            <span className="font-bold">{lastMinedBlock.nonce}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
