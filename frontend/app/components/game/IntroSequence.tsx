'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroSequenceProps {
    onComplete: (name: string) => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
    const [text, setText] = useState('');
    const fullText = "BIENVENIDO MI AMIGO";
    const [showInput, setShowInput] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
                setShowInput(true);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = () => {
        if (name.trim()) {
            onComplete(name);
        }
    };

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
            {/* Typewriter Text */}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-widest font-mono h-20 text-center">
                {text}
                <span className="animate-pulse">_</span>
            </h1>

            {/* Bouncing Caveman Placeholder */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                className="mb-12"
            >
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                >
                    <span className="text-6xl">🦴</span>
                </motion.div>
            </motion.div>

            {/* Name Input & Start Button */}
            {showInput && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6"
                >
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="NOMBRE DE TU CRUDO"
                        className="px-6 py-3 bg-gray-900 border-2 border-purple-500 rounded-lg text-white text-xl text-center focus:outline-none focus:border-pink-500 transition-colors uppercase tracking-widest"
                        maxLength={12}
                    />

                    {name.trim() && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold tracking-widest shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            COMENZAR AVENTURA
                        </motion.button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
