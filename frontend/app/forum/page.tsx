'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Nav from '../components/Nav';
import Link from 'next/link';

interface Thread {
    _id: string;
    title: string;
    content: string;
    author: {
        email: string;
        role: string;
    };
    category: string;
    createdAt: string;
}

const CATEGORIES = ['General', 'Game Discussion', 'Marketplace', 'Off-Topic'];

export default function ForumPage() {
    const { isLoggedIn, token } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('General');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchThreads();
    }, [activeCategory]);

    const fetchThreads = async () => {
        setLoading(true);
        try {
            // In a real app, we'd filter by category in the backend
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/content?type=FORUM_THREAD&limit=50`);
            const data = await res.json();
            // Client-side filter for now as backend doesn't support category filter yet
            const filtered = data.filter((t: any) => t.category === activeCategory);
            setThreads(filtered);
        } catch (error) {
            console.error('Failed to fetch threads', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn || !token) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newThread.title,
                    content: newThread.content,
                    type: 'FORUM_THREAD',
                    category: activeCategory
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewThread({ title: '', content: '' });
                fetchThreads();
            } else {
                alert('Failed to create thread');
            }
        } catch (error) {
            console.error('Error creating thread', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-purple-500/30 pt-24">
            <Nav />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                            COMMUNITY FORUM
                        </h1>
                        <p className="text-gray-400">Join the discussion about CrudoChain.</p>
                    </div>

                    {isLoggedIn ? (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-purple-600/20"
                        >
                            NEW TOPIC
                        </button>
                    ) : (
                        <div className="text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            Connect Wallet to Post
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Categories */}
                    <div className="space-y-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`w-full text-left px-6 py-4 rounded-xl transition-colors font-bold ${activeCategory === cat
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Thread List */}
                    <div className="md:col-span-3 space-y-4">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading discussions...</div>
                        ) : threads.length > 0 ? (
                            threads.map(thread => (
                                <div key={thread._id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{thread.title}</h3>
                                        <span className="text-xs text-gray-500">{new Date(thread.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{thread.content}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                        <span className={thread.author.role === 'ADMIN' ? 'text-red-400 font-bold' : thread.author.role === 'BLOGGER' ? 'text-purple-400 font-bold' : ''}>
                                            {thread.author.email}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed text-gray-500">
                                No threads in this category yet. Be the first!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1025] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Create New Topic</h2>
                        <form onSubmit={handleCreateThread} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newThread.title}
                                    onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Content</label>
                                <textarea
                                    value={newThread.content}
                                    onChange={e => setNewThread({ ...newThread, content: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-48 resize-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2 text-gray-400 hover:text-white font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                                >
                                    Post Topic
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
