'use client';

import Nav from '../components/Nav';


export default function WorldPage() {
    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
            <Nav />

            {/* Game Viewport - Calculated height to exclude Nav space if needed, 
                but since Nav is fixed/overlay, we can use full height or adjust padding.
                The user asked for: height: calc(100vh - [NavbarHeight]).
                Nav is p-8 (approx 32px + content). Let's assume approx 80-100px.
                However, to center content perfectly in the "remaining" space:
            */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pt-20">
                <div className="relative w-full max-w-2xl h-[70vh] flex flex-col items-center justify-center">
                    {/* Monolith Image */}
                    <img
                        src="/monolito.png"
                        alt="Monolith"
                        className="w-full h-full object-contain opacity-90 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    />

                    {/* Simple Text */}
                    <div className="absolute bottom-0 text-center">
                        <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
                            PRÓXIMAMENTE
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
