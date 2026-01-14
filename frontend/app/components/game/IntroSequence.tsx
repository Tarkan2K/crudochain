'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroSequenceProps {
    onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
    const [text, setText] = useState('');
    const fullText = "BIENVENIDO MI AMIGO";
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
                setShowButton(true);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
            {/* Typewriter Text */}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-widest font-mono h-20">
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

            {/* Start Button */}
            {showButton && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold tracking-widest shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    COMENZAR AVENTURA
                </motion.button>
            )}
        </div>
    );
}
