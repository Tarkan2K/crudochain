'use client';

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
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

export default function NewsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/api/content?type=NEWS`);
                const data = await res.json();
                // Map backend data to frontend format
                const mapped = data.map((item: any) => ({
                    id: item._id,
                    title: item.title,
                    content: item.content,
                    author: item.author?.email || 'Admin',
                    imageUrl: item.imageUrl, // Backend doesn't have imageUrl yet, but let's keep it optional
                    createdAt: new Date(item.createdAt).getTime() / 1000 // Convert to seconds timestamp
                }));
                setPosts(mapped);
            } catch (e) {
                console.error("Failed to fetch news", e);
            }
            setLoading(false);
        };
        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-blue-500 selection:text-white">
            <Nav />

            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        LATEST <span className="text-white">NEWS</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stay updated with the latest developments in the CrudoChain ecosystem.
                    </p>
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {posts.map((post, index) => (
                            <Link href={`/news/${post.id}`} key={post.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="h-64 overflow-hidden relative">
                                        <img
                                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/400`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] to-transparent opacity-60"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                NEWS
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span>{new Date(post.createdAt * 1000).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>By {post.author}</span>
                                        </div>
                                        <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-400 line-clamp-3">
                                            {post.content}
                                        </p>
                                        <div className="mt-6 text-blue-400 font-bold text-sm tracking-widest group-hover:translate-x-2 transition-transform inline-block">
                                            READ FULL ARTICLE &rarr;
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="text-center text-gray-500 mt-12">
                        No news yet. Check back later!
                    </div>
                )}
            </main>
        </div>
    );
}
