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
        <nav className="absolute top-0 right-0 p-8 z-50 w-full flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto">
                {/* Logo Area */}
            </div>

            <div className="flex gap-4 pointer-events-auto">
                {isLoggedIn ? (
                    <div className="flex items-center gap-8 bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg">
                        <Link href="/" className={`text-[10px] tracking-[0.2em] transition-colors ${isActive('/')}`}>INICIO</Link>

                        <Dropdown
                            title="GAMES"
                            items={[
                                { label: "GAME STORE", href: "/games" },
                                { label: "MY LIBRARY", href: "/games/library" }, // Placeholder
                                { label: "PUBLISH", href: "/games/publish" }     // Placeholder
                            ]}
                        />

                        <Dropdown
                            title="CASINO"
                            items={[
                                { label: "BLACKJACK", href: "/casino" }, // Currently main casino page
                                { label: "POKER", href: "/casino/poker" },
                                { label: "SLOTS", href: "/casino/slots" } // Placeholder
                            ]}
                        />

                        <Dropdown
                            title="ASSETS"
                            items={[
                                { label: "WALLET", href: "/wallet" },
                                { label: "SWAP", href: "/swap" },
                                { label: "EARN", href: "/earn" },
                                { label: "MINE", href: "/mine" }
                            ]}
                        />

                        <Link href="/launch" className={`text-[10px] tracking-[0.2em] hover:text-yellow-400 transition-colors ${isActive('/launch')}`}>LAUNCH 🚀</Link>

                        <div className="h-4 w-px bg-white/20 mx-2"></div>

                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono tracking-widest text-gray-300">
                                {email || userAddress}
                            </span>
                        </div>

                        <button onClick={logout} className="text-[10px] tracking-[0.2em] text-red-500 hover:text-red-400 ml-2">LOGOUT</button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/login">
                            <button className="text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 backdrop-blur-sm">
                                Log In
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="text-[10px] uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all px-6 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </nav >
    );
}
