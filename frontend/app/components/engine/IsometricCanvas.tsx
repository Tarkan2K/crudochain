'use client';

import { useEffect, useRef, useState } from 'react';

// --- CONFIGURACIÓN DEL MOTOR ---
const TILE_WIDTH = 64;  // Ancho del tile en pixeles
const TILE_HEIGHT = 32; // Alto del tile en pixeles (Isométrico 2:1)
const MAP_SIZE = 10;    // Tamaño del mapa 10x10

// --- TIPOS ---
interface Point {
    x: number;
    y: number;
}

interface CharacterData {
    skinColor: string;
    hairStyle: number;
    name: string;
}

interface IsometricCanvasProps {
    character?: CharacterData | null;
}

export default function IsometricCanvas({ character }: IsometricCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Estado del Jugador (Posición lógica exacta)
    const playerPos = useRef({ x: 5, y: 5 });
    const targetPos = useRef({ x: 5, y: 5 }); // A donde se mueve

    // Sprite Loading
    const [sprite, setSprite] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = '/assets/images/cavernicola.png';
        img.onload = () => setSprite(img);
    }, []);

    // Mapa de prueba (0 = Pasto, 1 = Muro)
    const map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // --- MATEMÁTICAS ISOMÉTRICAS ---
    const cartesianToIso = (x: number, y: number): Point => {
        const isoX = (x - y) * (TILE_WIDTH / 2);
        const isoY = (x + y) * (TILE_HEIGHT / 2);
        return { x: isoX, y: isoY };
    };

    // --- LOOP PRINCIPAL ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // 1. Limpiar Canvas
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Centrar la cámara
            const playerIso = cartesianToIso(playerPos.current.x, playerPos.current.y);
            const offsetX = canvas.width / 2 - playerIso.x;
            const offsetY = canvas.height / 2 - playerIso.y;

            ctx.save();
            ctx.translate(offsetX, offsetY);

            // 3. Lógica de Movimiento (Lerp)
            const speed = 0.1;
            const dx = targetPos.current.x - playerPos.current.x;
            const dy = targetPos.current.y - playerPos.current.y;

            if (Math.abs(dx) > 0.01) playerPos.current.x += dx * speed;
            else playerPos.current.x = targetPos.current.x;

            if (Math.abs(dy) > 0.01) playerPos.current.y += dy * speed;
            else playerPos.current.y = targetPos.current.y;


            // 4. ALGORITMO DEL PINTOR
            for (let y = 0; y < MAP_SIZE; y++) {
                for (let x = 0; x < MAP_SIZE; x++) {
                    drawTile(ctx, x, y, map[y][x]);
                }
            }

            // 5. Dibujar al Jugador
            drawPlayer(ctx, playerPos.current.x, playerPos.current.y);

            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        // --- FUNCIONES DE DIBUJO ---

        const drawTile = (ctx: CanvasRenderingContext2D, x: number, y: number, type: number) => {
            const pos = cartesianToIso(x, y);

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
            ctx.lineTo(pos.x, pos.y + TILE_HEIGHT);
            ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
            ctx.closePath();

            if (type === 1) { // MURO
                ctx.fillStyle = '#7f8c8d';
                ctx.fill();
                ctx.strokeStyle = '#566573';
                ctx.stroke();

                const wallHeight = 40;
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(pos.x - TILE_WIDTH / 2, pos.y - wallHeight + TILE_HEIGHT / 2, TILE_WIDTH, wallHeight);

                ctx.fillStyle = '#bdc3c7';
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y - wallHeight);
                ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 - wallHeight);
                ctx.lineTo(pos.x, pos.y + TILE_HEIGHT - wallHeight);
                ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 - wallHeight);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

            } else { // PASTO
                ctx.fillStyle = (x + y) % 2 === 0 ? '#2ecc71' : '#27ae60';
                ctx.fill();
                ctx.strokeStyle = '#1e8449';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        };

        const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
            const pos = cartesianToIso(x, y);

            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + TILE_HEIGHT / 2, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            if (sprite) {
                // Dibujar Sprite
                const scale = 1.5; // Escala del sprite
                const spriteWidth = 64 * scale;
                const spriteHeight = 64 * scale;

                // Dibujar imagen centrada en X y ajustada en Y para que los pies toquen el suelo
                ctx.drawImage(
                    sprite,
                    pos.x - spriteWidth / 2,
                    pos.y - spriteHeight + 16, // Ajuste manual para pies
                    spriteWidth,
                    spriteHeight
                );
            } else {
                // Fallback (Cuadrado Rojo) si no ha cargado
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(pos.x - 10, pos.y - 30, 20, 30);
            }

            // --- NOMBRE ---
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.fillText(character?.name || 'Tu', pos.x, pos.y - 80);
            ctx.shadowBlur = 0;
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [character, sprite]); // Re-render si cambia el personaje o carga el sprite

    // --- INPUT HANDLING ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentX = Math.round(targetPos.current.x);
            const currentY = Math.round(targetPos.current.y);
            let nextX = currentX;
            let nextY = currentY;

            switch (e.key) {
                case 'w': case 'ArrowUp': nextY -= 1; break;
                case 's': case 'ArrowDown': nextY += 1; break;
                case 'a': case 'ArrowLeft': nextX -= 1; break;
                case 'd': case 'ArrowRight': nextX += 1; break;
            }

            // Colisiones
            if (nextX >= 0 && nextX < MAP_SIZE && nextY >= 0 && nextY < MAP_SIZE) {
                if (map[nextY][nextX] === 0) { // 0 es caminable
                    targetPos.current = { x: nextX, y: nextY };
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full block"
        />
    );
}
