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

interface Entity {
    x: number; // Coordenada lógica (grid)
    y: number;
    type: 'PLAYER' | 'NPC';
}

export default function IsometricCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Estado del Jugador (Posición lógica exacta)
    // Usamos useRef para el loop de renderizado para evitar re-renders de React
    const playerPos = useRef({ x: 5, y: 5 });
    const targetPos = useRef({ x: 5, y: 5 }); // A donde se mueve

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

    // Convierte coordenadas de Grid (x,y) a Pantalla (px, py)
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

        // Función de Renderizado (60 FPS)
        const render = () => {
            // 1. Limpiar Canvas
            ctx.fillStyle = '#1a1a2e'; // Fondo oscuro
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Centrar la cámara en el jugador
            // Calculamos dónde está el jugador en pixeles
            const playerIso = cartesianToIso(playerPos.current.x, playerPos.current.y);
            const offsetX = canvas.width / 2 - playerIso.x;
            const offsetY = canvas.height / 2 - playerIso.y;

            ctx.save();
            ctx.translate(offsetX, offsetY);

            // 3. Lógica de Movimiento (Interpolación Lineal - Lerp)
            // Acercamos suavemente la posición actual al destino
            const speed = 0.1; // Velocidad de interpolación
            const dx = targetPos.current.x - playerPos.current.x;
            const dy = targetPos.current.y - playerPos.current.y;

            if (Math.abs(dx) > 0.01) playerPos.current.x += dx * speed;
            else playerPos.current.x = targetPos.current.x;

            if (Math.abs(dy) > 0.01) playerPos.current.y += dy * speed;
            else playerPos.current.y = targetPos.current.y;


            // 4. ALGORITMO DEL PINTOR (Painter's Algorithm)
            // Dibujamos de atrás hacia adelante (Back-to-Front)
            // En isométrico, la profundidad es (x + y).
            // Iteramos el mapa de tal forma que dibujamos las filas superiores primero.

            for (let y = 0; y < MAP_SIZE; y++) {
                for (let x = 0; x < MAP_SIZE; x++) {
                    drawTile(ctx, x, y, map[y][x]);
                }
            }

            // 5. Dibujar al Jugador
            // IMPORTANTE: Para que el jugador tenga profundidad correcta respecto a los muros,
            // debería ordenarse junto con los tiles. 
            // SIMPLIFICACIÓN: Aquí lo dibujamos después del suelo pero antes de los techos si hubiera.
            // Para "Runescape Classic" real, el jugador debe ser parte del sort loop.
            // Aquí lo dibujamos "encima" para simplificar la demo visual.
            drawPlayer(ctx, playerPos.current.x, playerPos.current.y);

            ctx.restore();

            // Loop
            animationFrameId = requestAnimationFrame(render);
        };

        // --- FUNCIONES DE DIBUJO ---

        const drawTile = (ctx: CanvasRenderingContext2D, x: number, y: number, type: number) => {
            const pos = cartesianToIso(x, y);

            // Dibujar Suelo (Rombo)
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
            ctx.lineTo(pos.x, pos.y + TILE_HEIGHT);
            ctx.lineTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
            ctx.closePath();

            // Color según tipo
            if (type === 1) { // MURO
                // Base del muro
                ctx.fillStyle = '#7f8c8d';
                ctx.fill();
                ctx.strokeStyle = '#566573';
                ctx.stroke();

                // Altura del muro (Extrusión falsa)
                const wallHeight = 40;
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(pos.x - TILE_WIDTH / 2, pos.y - wallHeight + TILE_HEIGHT / 2, TILE_WIDTH, wallHeight);

                // Techo del muro
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
                ctx.fillStyle = (x + y) % 2 === 0 ? '#2ecc71' : '#27ae60'; // Patrón ajedrezado sutil
                ctx.fill();
                // Borde suave
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
            ctx.ellipse(pos.x, pos.y + TILE_HEIGHT / 2, 10, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cuerpo (Sprite Placeholder - Rectángulo Rojo)
            const playerHeight = 30;
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(pos.x - 10, pos.y - playerHeight, 20, playerHeight);

            // Cabeza
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(pos.x - 8, pos.y - playerHeight - 10, 16, 16);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

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
