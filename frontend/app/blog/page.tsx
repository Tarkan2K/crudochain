'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    imageUrl: string;
    createdAt: number;
}

export default function BlogPage() {
    const { isLoggedIn, token, role } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '' });

    const fetchBlog = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/content?type=BLOG`);
            const data = await res.json();
            // Map backend data to frontend format
            const mapped = data.map((item: any) => ({
                id: item._id,
                title: item.title,
                content: item.content,
                author: item.author?.email || 'Admin',
                imageUrl: item.imageUrl,
                createdAt: new Date(item.createdAt).getTime() / 1000
            }));
            setPosts(mapped);
        } catch (e) {
            console.error("Failed to fetch blog", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBlog();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newPost,
                    type: 'BLOG'
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewPost({ title: '', content: '', imageUrl: '' });
                fetchBlog(); // Refresh list
            } else {
                alert('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-green-500 selection:text-white">
            <Nav />

            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                        BLOG <span className="text-white">CRUDO</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Inmersiones profundas, actualizaciones técnicas y perspectivas del equipo CrudoChain.
                    </p>

                    {(role === 'ADMIN' || role === 'BLOGGER') && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-green-600/20"
                        >
                            ESCRIBIR NUEVO POST ✍️
                        </button>
                    )}
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <Link href={`/blog/${post.id}`} key={post.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="group bg-[#1a1025] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-green-500/50 transition-all duration-300 h-full flex flex-col"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/400`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-black/50 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full border border-white/10">
                                                {new Date(post.createdAt * 1000).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {post.author[0]}
                                            </div>
                                            <span className="text-sm text-gray-400 font-bold">{post.author}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="text-center text-gray-500 mt-12">
                        No hay posts aún.
                    </div>
                )}
            </main>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1025] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Write New Blog Post</h2>
                        <form onSubmit={handleCreatePost} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={newPost.imageUrl}
                                    onChange={e => setNewPost({ ...newPost, imageUrl: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">Content</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 h-64 resize-none"
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
                                    className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl"
                                >
                                    Publish Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
