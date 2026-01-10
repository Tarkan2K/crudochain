'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminCMSPage() {
    const { role, isLoggedIn } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author: 'Admin',
        imageUrl: '',
        type: 'NEWS' // NEWS or BLOG
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (!isLoggedIn) {
            // router.push('/login'); // Optional: redirect to login
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn || role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white font-sans flex flex-col items-center justify-center">
                <Nav />
                <h1 className="text-4xl font-black text-red-500 mb-4">ACCESS DENIED</h1>
                <p className="text-gray-400">You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('http://127.0.0.1:18080/cms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ ...formData, title: '', content: '' });
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans">
            <Nav />

            <main className="pt-24 px-4 pb-12 max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        CMS DASHBOARD
                    </h1>
                    <p className="text-gray-400">Create and publish content to CrudoChain.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'NEWS' })}
                                className={`p-4 rounded-xl font-bold transition-all ${formData.type === 'NEWS'
                                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                📝 NEWS ARTICLE
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'BLOG' })}
                                className={`p-4 rounded-xl font-bold transition-all ${formData.type === 'BLOG'
                                    ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.5)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                👨‍💻 DEV BLOG
                            </button>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">TITLE</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Enter post title..."
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">IMAGE URL</label>
                            <input
                                type="text"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="https://..."
                            />
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">AUTHOR</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">CONTENT</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors h-64 font-mono text-sm"
                                placeholder="Write your content here..."
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full py-4 rounded-xl font-black text-lg transition-all ${status === 'loading'
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]'
                                }`}
                        >
                            {status === 'loading' ? 'PUBLISHING...' : 'PUBLISH POST'}
                        </button>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-center font-bold border border-green-500/50">
                                ✅ Post published successfully!
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-xl text-center font-bold border border-red-500/50">
                                ❌ Failed to publish post. Try again.
                            </div>
                        )}
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
