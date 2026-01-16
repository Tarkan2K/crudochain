'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';

interface Token {
    ticker: string;
    name: string;
    description: string;
    imageUrl: string;
    creator: string;
    currentSupply: number;
    marketCap: number;
    price: number;
}

export default function LaunchPage() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [showForm, setShowForm] = useState(false);
    const { userAddress, userId } = useAuth();
    const [crdoBalance, setCrdoBalance] = useState(0);

    // Form State
    const [name, setName] = useState('');
    const [ticker, setTicker] = useState('');
    const [desc, setDesc] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        fetchTokens();
        fetchBalance();
        const interval = setInterval(fetchTokens, 2000);
        return () => clearInterval(interval);
    }, [userId]);

    const fetchBalance = async () => {
        if (userId) {
            try {
                const res = await fetch(`/api/user/balance?userId=${userId}`);
                const data = await res.json();
                if (data.crdoBalance !== undefined) {
                    setCrdoBalance(data.crdoBalance);
                }
            } catch (e) {
                console.error("Failed to fetch balance");
            }
        }
    };

    const handleStartClick = () => {
        if (crdoBalance < 500) {
            alert("Necesitas comprar $CRDO para lanzar tu token (Min: 500 CRDO)");
            window.location.href = "/wallet";
            return;
        }
        setShowForm(!showForm);
    };

    const fetchTokens = async () => {
        try {
            const res = await fetch('/api/tokens');
            const data = await res.json();
            setTokens(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, ticker, description: desc, imageUrl: image, creator: userAddress
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    alert('¡Token Creado!');
                    setShowForm(false);
                    fetchTokens();
                } else {
                    alert('Error: ' + data.message);
                }
            } else {
                alert('Error al crear token');
            }
        } catch (e) {
            alert('Error conectando al backend');
        }
    };

    const handleDelete = async (ticker: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar ${ticker}?`)) return;
        try {
            const res = await fetch('http://127.0.0.1:18080/launcher/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });
            if (res.ok) {
                fetchTokens();
            } else {
                alert('Error al eliminar token');
            }
        } catch (e) {
            alert('Error conectando al backend');
        }
    };

    const handleBuy = async (ticker: string) => {
        const amount = prompt(`¿Cuánto USDT quieres gastar en ${ticker}?`);
        if (!amount) return;

        try {
            const res = await fetch('http://127.0.0.1:18080/launcher/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker, amount: parseFloat(amount), address: userAddress
                })
            });
            if (res.ok) {
                alert('¡Compra exitosa! El precio debería subir.');
                fetchTokens();
            } else {
                alert('Error al comprar token');
            }
        } catch (e) {
            alert('Error conectando al backend');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <Nav />

            <div className="container mx-auto p-6">
                <div className="flex flex-col items-center mb-12 mt-20">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-6 text-center tracking-tighter">LANZADOR CRUDO 🚀</h1>
                    <p className="text-gray-400 mb-8 text-xl text-center max-w-2xl">Crea tu propia memecoin en segundos. Lanzamiento justo, liquidez instantánea, sin preventa.</p>
                    <button
                        onClick={handleStartClick}
                        className="bg-yellow-400 text-black text-xl px-12 py-4 rounded-full font-bold hover:bg-yellow-300 transition transform hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                    >
                        {showForm ? 'CANCELAR CREACIÓN' : 'INICIAR NUEVA MONEDA 🪙'}
                    </button>
                    <p className={`mt-4 text-sm ${crdoBalance >= 500 ? 'text-green-400' : 'text-red-400'}`}>
                        Tu Saldo: {crdoBalance} CRDO (Min: 500)
                    </p>
                </div>

                {showForm && (
                    <div className="bg-gray-900 p-6 rounded-xl border border-yellow-400/30 mb-8 max-w-2xl mx-auto animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-yellow-400">Crea tu Token</h2>
                        <div className="space-y-4">
                            <input placeholder="Nombre del Token" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={name} onChange={e => setName(e.target.value)} />
                            <input placeholder="Ticker (ej. PEPE)" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={ticker} onChange={e => setTicker(e.target.value)} />
                            <textarea placeholder="Descripción" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={desc} onChange={e => setDesc(e.target.value)} />
                            <input placeholder="URL de Imagen" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={image} onChange={e => setImage(e.target.value)} />
                            <button onClick={handleCreate} className="w-full bg-green-500 text-black font-bold py-3 rounded hover:bg-green-400">LANZAR MONEDA</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tokens.map((token) => (
                        <div key={token.ticker} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-yellow-400/50 transition-all relative group">
                            <button
                                onClick={() => handleDelete(token.ticker)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Token"
                            >
                                🗑️
                            </button>
                            <div className="flex gap-4 mb-4">
                                <img src={token.imageUrl || "https://via.placeholder.com/100"} className="w-24 h-24 rounded object-cover bg-gray-800" />
                                <div>
                                    <h3 className="font-bold text-xl">{token.name} <span className="text-gray-500 text-sm">({token.ticker})</span></h3>
                                    <p className="text-xs text-gray-400 mt-1">Creado por: {token.creator}</p>
                                    <p className="text-green-400 font-bold mt-2">Precio: ${token.price.toFixed(8)}</p>
                                    <p className="text-gray-500 text-xs">Cap. de Mercado: ${token.marketCap.toFixed(2)}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 h-12 overflow-hidden">{token.description}</p>

                            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (token.marketCap / 69000) * 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-center text-gray-500 mb-4">Progreso de Curva de Vinculación: {(token.marketCap / 69000 * 100).toFixed(2)}%</p>

                            <button
                                onClick={() => handleBuy(token.ticker)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded transition"
                            >
                                COMPRAR
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
