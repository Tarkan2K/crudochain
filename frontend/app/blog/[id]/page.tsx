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

export default function BlogDetailPage() {
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
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#0f0518] text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                <Link href="/blog" className="text-green-400 hover:underline">Return to Blog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0518] text-white font-sans selection:bg-green-500 selection:text-white">
            <Nav />

            <main className="pt-32 pb-16 max-w-4xl mx-auto px-4">
                <Link href="/blog" className="text-green-400 font-bold tracking-widest text-sm mb-8 inline-block hover:text-white transition-colors">
                    &larr; BACK TO BLOG
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-6 text-gray-400 mb-12 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center font-bold text-white text-lg">
                                {post.author[0]}
                            </div>
                            <span className="font-bold text-white">{post.author}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(post.createdAt * 1000).toLocaleDateString()}</span>
                    </div>

                    <div className="mb-12 rounded-3xl overflow-hidden border border-white/10">
                        <img
                            src={post.imageUrl || `https://picsum.photos/seed/${post.id}/1200/600`}
                            alt={post.title}
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="prose prose-lg prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-lg font-light">
                            {post.content}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
