'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
    const pathname = usePathname();
    const { isLoggedIn, login, logout, userAddress, email } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const isActive = (path: string) => pathname === path ? 'text-green-400' : 'text-gray-400 hover:text-white';

    const Dropdown = ({ title, items }: { title: string, items: { label: string, href: string }[] }) => (
        <div
            className="relative"
            onMouseEnter={() => setActiveDropdown(title)}
            onMouseLeave={() => setActiveDropdown(null)}
        >
            <button className={`text-[10px] tracking-[0.2em] transition-colors py-2 ${activeDropdown === title ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}>
                {title} ▾
            </button>
            <AnimatePresence>
                {activeDropdown === title && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#0f0518]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        <div className="py-2 flex flex-col">
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-3 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-center"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0f0518]/80 backdrop-blur-xl border-b border-white/10 px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {/* Logo Area - Can be added here */}
                <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hover:opacity-80 transition-opacity">
                    CRUDOCHAIN
                </Link>
            </div>

            <div className="flex gap-6 items-center">
                {isLoggedIn ? (
                    <div className="flex items-center gap-8">
                        <Dropdown
                            title="JUEGOS"
                            items={[
                                { label: "TIENDA", href: "/games" },
                                { label: "MI BIBLIOTECA", href: "/games/library" },
                                { label: "PUBLICAR", href: "/games/publish" }
                            ]}
                        />

                        <Dropdown
                            title="ACTIVOS"
                            items={[
                                { label: "BILLETERA", href: "/wallet" },
                                { label: "INTERCAMBIO", href: "/swap" },
                                { label: "GANAR", href: "/earn" },
                                { label: "MINAR", href: "/mine" }
                            ]}
                        />

                        <Dropdown
                            title="SOCIAL"
                            items={[
                                { label: "CRUDO NOTICIAS", href: "/news" },
                                { label: "BLOG CRUDO", href: "/blog" },
                                { label: "FORO", href: "/forum" }
                            ]}
                        />

                        <Link href="/world" className="relative group px-5 py-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                            <div className="relative flex items-center gap-2 bg-black px-4 py-1.5 rounded-full border border-purple-500/50">
                                <span className="text-xl">🚀</span>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 group-hover:text-white transition-colors">
                                    MUNDOCRUDO
                                </span>
                            </div>
                        </Link>

                        <Link href="/launch" className={`text-xs font-bold tracking-[0.2em] hover:text-yellow-400 transition-colors ${isActive('/launch')}`}>LANZAMIENTO 🚀</Link>

                        <div className="h-6 w-px bg-white/20 mx-2"></div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 p-[2px] shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            </div>
                            <button onClick={logout} className="text-xs font-bold tracking-[0.2em] text-purple-500 hover:text-purple-400 transition-colors">SALIR</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/login">
                            <button className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors px-8 py-3 border border-white/10 rounded-full hover:bg-white/5 backdrop-blur-sm">
                                INICIAR SESIÓN
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                REGISTRARSE
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav >
    );
}
