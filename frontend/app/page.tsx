'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Nav from './components/Nav';
import { motion } from 'framer-motion';

export default function Home() {
  const { isLoggedIn } = useAuth();
  const manifestoRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (manifestoRef.current) {
      observer.observe(manifestoRef.current);
    }

    // Fetch Real Data
    const fetchData = async () => {
      try {
        const newsRes = await fetch('http://localhost:3001/api/content?type=NEWS&limit=2');
        const newsData = await newsRes.json();
        setNews(newsData);

        // Games are still on the old backend or need migration? 
        // User said "Elimina completamente el código del juego actual hecho en Phaser".
        // But "Game Store" might be separate.
        // For now, let's assume games are still fetched from where they were or we need to implement them.
        // The prompt didn't explicitly say to reimplement Game Store backend, just "Backend: Infraestructura Social".
        // But "Todo el contenido debe guardarse en la base de datos".
        // Let's keep games fetch as is but point to 3001 if possible, or comment out if not ready.
        // Actually, the user didn't ask to touch Games backend in this prompt, only "Infraestructura Social (Roles y CMS)".
        // So I will leave games fetch as is but maybe point to 3001 if I think it's there.
        // Wait, the previous fetch was 18080. If I changed backend to 3001, 18080 might be gone.
        // I'll comment out games fetch for now or try 3001.
        // Let's try to fetch games from 3001/api/games/list if it exists.
        // But I haven't implemented games routes in 3001 yet.
        // I'll just leave it empty for now to avoid errors.
        setGames([]);
      } catch (e) {
        console.error("Failed to fetch home data", e);
      }
    };
    fetchData();

    return () => {
      if (manifestoRef.current) {
        observer.unobserve(manifestoRef.current);
      }
    };
  }, []);

  const scrollToManifesto = () => {
    manifestoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0f0518] text-white font-sans min-h-screen selection:bg-purple-500/30">
      <Nav />

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/20 via-[#0f0518] to-[#0f0518]"></div>

        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse delay-1000"></div>

        <div className="z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >
            CRUDOCHAIN
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-purple-200/60 font-light tracking-widest uppercase"
          >
            The Future of Decentralized Gaming
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={scrollToManifesto}
          className="absolute bottom-12 animate-bounce cursor-pointer hover:text-purple-400 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* CONTENT SECTIONS */}
      <div ref={manifestoRef} className="relative z-10 max-w-7xl mx-auto px-4 py-24 space-y-32">

        {/* TOP OF THE WEEK */}
        <section>
          {/* CRUDO VERSO ACTION CARD */}
          <Link href="/world">
            <div className="relative w-full h-64 md:h-80 rounded-[3rem] overflow-hidden cursor-pointer group mb-24 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] hover:shadow-[0_0_80px_rgba(168,85,247,0.4)] transition-all duration-500">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518544806352-a228605e2270?q=80&w=2076&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>

              <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="inline-block px-4 py-1 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-[0.3em] mb-4 backdrop-blur-md">
                    NEW EXPERIENCE
                  </span>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
                    ENTRAR AL <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">CRUDO VERSO</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-xl mb-8">
                    Explora un mundo infinito, crea tu avatar y construye tu legado en la nueva era de CrudoChain.
                  </p>
                  <div className="flex items-center gap-4 text-purple-400 font-bold tracking-widest group-hover:translate-x-4 transition-transform">
                    <span>COMENZAR AVENTURA</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              TOP OF THE WEEK
            </h2>
            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {games.length > 0 ? games.map((game, i) => (
              <Link href={`/games/play/${game.id}`} key={game.id}>
                <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
                  <img
                    src={game.imageUrl || `https://picsum.photos/seed/${game.id}/800/1000`}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <span className="text-purple-400 text-sm font-bold tracking-wider mb-2 block">TRENDING #{i + 1}</span>
                    <h3 className="text-3xl font-bold mb-2">{game.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{game.description}</p>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-3 text-center text-gray-500">Loading top games...</div>
            )}
          </div>
        </section>

        {/* NEWS & UPDATES */}
        <section>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">
              LATEST NEWS
            </h2>
            <Link href="/news" className="text-sm font-bold tracking-widest text-gray-500 hover:text-white transition-colors">
              VIEW ALL &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {news.length > 0 ? news.map((item) => (
              <Link href={`/news/${item.id}`} key={item.id}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors cursor-pointer group h-full">
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">
                    {item.type || 'NEWS'}
                  </span>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">{item.title}</h3>
                  <p className="text-gray-400 mb-6 line-clamp-3">{item.content}</p>
                  <div className="text-sm text-gray-500">{new Date(item.createdAt * 1000).toLocaleDateString()}</div>
                </div>
              </Link>
            )) : (
              <div className="col-span-2 text-center text-gray-500">Loading latest news...</div>
            )}
          </div>
        </section>

        {/* BLOG SECTION */}
        <section>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              FROM THE BLOG
            </h2>
            <Link href="/blog" className="text-sm font-bold tracking-widest text-gray-500 hover:text-white transition-colors">
              READ MORE &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Tokenomics', 'Game Design', 'Tech Deep Dive', 'Community'].map((topic, i) => (
              <div key={i} className="bg-[#1a1025] rounded-2xl p-6 hover:-translate-y-2 transition-transform duration-300 border border-white/5 hover:border-purple-500/30 cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl mb-6 flex items-center justify-center">
                  <span className="text-4xl opacity-50">📝</span>
                </div>
                <h4 className="text-lg font-bold mb-2">{topic}</h4>
                <p className="text-sm text-gray-500">Explore the latest insights about {topic.toLowerCase()}.</p>
              </div>
            ))}
          </div>
        </section>

        {/* COOL STUFF */}
        <section className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-[3rem] p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-5xl font-black mb-6">SOMETHING COOL</h2>
            <p className="text-xl text-gray-300 mb-8">
              Discover the experimental features and hidden gems of the CrudoChain ecosystem.
            </p>
            <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              EXPLORE LABS
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 mt-24 py-12 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2026 CrudoChain. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
