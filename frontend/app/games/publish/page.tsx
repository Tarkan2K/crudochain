"use client";

import { useState } from 'react';
import Nav from '../../components/Nav';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PublishGamePage() {
    const { isLoggedIn, userAddress } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        gameUrl: '',
        imageUrl: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setUploadProgress('');

        if (!isLoggedIn) {
            setError('You must be logged in to publish a game.');
            setLoading(false);
            return;
        }

        if (!file) {
            setError('Please upload a game file (.zip).');
            setLoading(false);
            return;
        }

        try {
            // 1. Upload the file
            setUploadProgress('Uploading game file...');
            const uploadData = new FormData();
            uploadData.append('file', file);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (!uploadRes.ok) {
                throw new Error('File upload failed');
            }

            const uploadJson = await uploadRes.json();
            const gameUrl = uploadJson.url;

            // 2. Publish to Blockchain/Backend
            setUploadProgress('Registering game on Crudochain...');
            const res = await fetch('http://127.0.0.1:18080/games/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    gameUrl: gameUrl, // Use the uploaded file URL
                    developerAddress: userAddress,
                    price: Number(formData.price)
                })
            });

            if (res.ok) {
                router.push('/games');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to publish game');
            }
        } catch (err) {
            console.error(err);
            setError('Error publishing game. Check console.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />
            <main className="pt-32 px-4 pb-12 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
                >
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        Publish Your Game
                    </h1>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Game Title</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
                                placeholder="e.g. Super Crudo RPG"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
                                placeholder="Describe your masterpiece..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Price (CRDO)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Image URL (Cover)</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Game File (.zip)</label>
                            <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-black/20">
                                <input
                                    type="file"
                                    accept=".zip"
                                    required
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none">
                                    <p className="text-purple-400 font-bold text-lg mb-1">
                                        {file ? file.name : 'Click to Upload Game File'}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Only .zip files containing index.html
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (uploadProgress || 'Publishing...') : '🚀 Publish Game'}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
