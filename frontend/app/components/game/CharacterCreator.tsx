'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface CharacterCreatorProps {
    onComplete: () => void;
    initialName: string;
}

const SKIN_COLORS = ['#FCD5B5', '#E0AC69', '#8D5524', '#C68642', '#FFDBAC'];
const HAIR_STYLES = ['🦱', '🦳', '🦲', '👱', '🦁']; // Placeholders for hair sprites

export default function CharacterCreator({ onComplete, initialName }: CharacterCreatorProps) {
    const { userId } = useAuth();
    const [skinColor, setSkinColor] = useState(SKIN_COLORS[0]);
    const [hairStyle, setHairStyle] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleBorn = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/update-character', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    character: {
                        skinColor,
                        hairStyle
                    },
                    name: initialName
                })
            });

            if (res.ok) {
                onComplete();
            } else {
                const text = await res.text();
                console.error("Server Error:", text);
                alert(`Error creating character: ${text}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error connecting to server: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-40">
            <h2 className="text-4xl font-bold text-white mb-12">CREA A TU CRUDO</h2>

            <div className="flex gap-12 items-center mb-12">
                {/* Character Preview */}
                <div className="relative w-64 h-64 bg-gray-800 rounded-xl border-4 border-gray-700 flex items-center justify-center shadow-2xl">
                    <div
                        className="w-32 h-48 rounded-full relative"
                        style={{ backgroundColor: skinColor }}
                    >
                        {/* Eyes */}
                        <div className="absolute top-16 left-6 w-4 h-4 bg-black rounded-full"></div>
                        <div className="absolute top-16 right-6 w-4 h-4 bg-black rounded-full"></div>
                        {/* Mouth */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-12 h-4 bg-black/20 rounded-full"></div>
                        {/* Hair */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl">
                            {HAIR_STYLES[hairStyle]}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-8">
                    <div>
                        <label className="block text-gray-400 mb-4 text-sm tracking-widest uppercase">Piel</label>
                        <div className="flex gap-4">
                            {SKIN_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSkinColor(color)}
                                    className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${skinColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-4 text-sm tracking-widest uppercase">Pelo</label>
                        <div className="flex gap-4">
                            {HAIR_STYLES.map((style, index) => (
                                <button
                                    key={index}
                                    onClick={() => setHairStyle(index)}
                                    className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl border-2 transition-all hover:bg-gray-700 ${hairStyle === index ? 'border-green-500 bg-gray-700' : 'border-gray-700'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBorn}
                disabled={loading}
                className="px-12 py-4 bg-green-500 text-black font-black text-xl rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'CREANDO...' : 'NACER'}
            </motion.button>
        </div>
    );
}
