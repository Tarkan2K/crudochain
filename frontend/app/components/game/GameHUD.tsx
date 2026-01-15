import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoreModal from './StoreModal';
import CavernModal from './CavernModal';

export default function GameHUD() {
    const { email } = useAuth();
    const { level, xp, inventory } = useGame();
    const [balance, setBalance] = useState(0);
    const [showInventory, setShowInventory] = useState(false);
    const [showStore, setShowStore] = useState(false);
    const [showCavern, setShowCavern] = useState(false);

    useEffect(() => {
        // Fetch real balance
        const fetchBalance = async () => {
            if (!email) return;
            try {
                const res = await fetch(`/api/user/balance?email=${email}`);
                const data = await res.json();
                if (data.crdoBalance !== undefined) setBalance(data.crdoBalance);
            } catch (e) {
                console.error(e);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 5000); // Poll balance
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="absolute inset-0 pointer-events-none z-50 p-6 flex flex-col justify-between">
                {/* TOP BAR */}
                <div className="flex justify-between items-start pointer-events-auto">
                    {/* Profile (Top Left) */}
                    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10">
                        <div className="w-12 h-12 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-2xl">
                            🦴
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm tracking-wider">{email?.split('@')[0] || 'CAVERNICOLA'}</h3>
                            {/* Level Bar */}
                            <div className="w-32 h-3 bg-gray-800 rounded-full mt-1 overflow-hidden border border-white/20 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                                    style={{ width: `${(xp % (level * 100)) / (level * 100) * 100}%` }}
                                ></div>
                                <span className="absolute inset-0 text-[8px] flex items-center justify-center text-white font-bold">LVL {level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Economy (Top Right) */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                <span className="text-yellow-400 font-black text-xl tracking-widest">
                                    {balance.toLocaleString()} CRDO
                                </span>
                            </div>
                            <button
                                onClick={() => document.getElementById('buy-crdo-trigger')?.click()}
                                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xl hover:scale-110 transition-transform shadow-lg border-2 border-white"
                            >
                                +
                            </button>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">ERA 1: CAVERNAS</div>
                    </div>
                </div>

                {/* BOTTOM BAR (Menus) */}
                <div className="flex justify-center gap-4 pointer-events-auto mb-4">
                    {[
                        { icon: '🎒', label: 'INVENTARIO' },
                        { icon: '📖', label: 'DIARIO' },
                        { icon: '⚒️', label: 'CRAFTING' },
                        { icon: '🗺️', label: 'MAPA' },
                        { icon: '🛡️', label: 'EQUIPO' },
                        { icon: '⚙️', label: 'AJUSTES' }
                    ].map((item) => (
                        <button
                            key={item.label}
                            className="w-14 h-14 bg-[#3e2723] rounded-xl border-b-4 border-[#1b110f] flex items-center justify-center hover:scale-105 transition-all group relative shadow-lg mx-1"
                            style={{ backgroundImage: 'linear-gradient(to bottom, #5d4037, #3e2723)' }}
                        >
                            <div className="text-2xl drop-shadow-md">{item.icon}</div>
                            <span className="absolute -top-10 bg-black px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-50 pointer-events-none">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showInventory && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-[#1a1025] border border-white/20 p-8 rounded-3xl shadow-2xl max-w-2xl w-full relative"
                        >
                            <button
                                onClick={() => setShowInventory(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-6">MOCHILA</h2>

                            <div className="grid grid-cols-5 gap-4">
                                {inventory.length > 0 ? inventory.map((item) => (
                                    <div key={item.id} className="bg-white/5 p-4 rounded-xl flex flex-col items-center border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="text-4xl mb-2">{item.icon}</div>
                                        <span className="text-xs font-bold text-gray-300">{item.name}</span>
                                        <span className="text-xs text-yellow-400">x{item.count}</span>
                                    </div>
                                )) : (
                                    <div className="col-span-5 text-center text-gray-500 py-12">
                                        Tu mochila está vacía. ¡Ve a minar!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
                {showStore && <StoreModal onClose={() => setShowStore(false)} />}
                {showCavern && <CavernModal onClose={() => setShowCavern(false)} />}
            </AnimatePresence>
        </>
    );
}
