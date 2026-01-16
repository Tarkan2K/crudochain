'use client';

import Nav from '../components/Nav';
import GameManager from '../components/game/GameManager';

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
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <div className="relative w-full max-w-4xl aspect-square flex flex-col items-center justify-center">
                    {/* Monolith Image */}
                    <img
                        src="/monolith_endless.png"
                        alt="Monolith"
                        className="w-full h-full object-contain opacity-80 drop-shadow-[0_0_50px_rgba(168,85,247,0.4)]"
                    />

                    {/* Overlay Text */}
                    <div className="absolute bottom-10 text-center space-y-4 bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse">
                            MOTOR C++ NATIVO
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 tracking-widest font-light">
                            EN CONSTRUCCIÓN
                        </p>
                        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                        <p className="text-sm md:text-base text-purple-300/80 tracking-[0.3em] uppercase">
                            LA ERA DE LA PIEDRA SE ACERCA
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
