'use client';

import { useState, useEffect } from 'react';
import Nav from '../../components/Nav';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    imageUrl: string;
    createdAt: number;
}

export default function NewsDetailPage() {
    const { id } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const res = await fetch(`http://localhost:3001/api/content/${id}`);
                if (res.ok) {
                    const item = await res.json();
                    setPost({
                        id: item._id,
                        title: item.title,
                        content: item.content,
                        author: item.author?.email || 'Admin',
                        imageUrl: item.imageUrl,
                        createdAt: new Date(item.createdAt).getTime() / 1000
                    });
                }
            } catch (e) {
                console.error("Failed to fetch post", e);
            }
            setLoading(false);
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0518] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
                <Link href="/news" className="text-blue-400 hover:underline">Return to News</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-blue-500 selection:text-white">
            <Nav />

            {/* Hero Image */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1920/1080`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518] via-[#0f0518]/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link href="/news" className="text-blue-400 font-bold tracking-widest text-sm mb-4 inline-block hover:text-white transition-colors">
                            &larr; BACK TO NEWS
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight max-w-4xl">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 text-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    {post.author[0]}
                                </div>
                                <span className="font-bold">{post.author}</span>
                            </div>
                            <span>•</span>
                            <span>{new Date(post.createdAt * 1000).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-lg prose-invert max-w-none"
                >
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg">
                        {post.content}
                    </div>
                </motion.div>

                {/* Share / Tags */}
                <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                    <div className="flex gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-400">#CrudoChain</span>
                        <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-400">#News</span>
                    </div>
                    <button className="text-blue-400 font-bold hover:text-white transition-colors">
                        SHARE ARTICLE
                    </button>
                </div>
            </main>
        </div>
    );
}
