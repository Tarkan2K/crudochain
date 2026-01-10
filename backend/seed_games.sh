#!/bin/bash

# Sample Game 1: Cyber Solitaire
curl -X POST http://localhost:18080/games/publish \
     -H "Content-Type: application/json" \
     -d '{
           "title": "Cyber Solitaire",
           "description": "Classic solitaire with a cyberpunk twist. Hack the deck and win big.",
           "price": 0,
           "developerAddress": "0xDevAlpha",
           "gameUrl": "https://zv1y2.github.io/solitaire/",
           "imageUrl": "https://img.freepik.com/free-vector/cyberpunk-futuristic-city-background_23-2148293394.jpg"
         }'

echo ""

# Sample Game 2: Neon Racer
curl -X POST http://localhost:18080/games/publish \
     -H "Content-Type: application/json" \
     -d '{
           "title": "Neon Racer 2077",
           "description": "High speed racing in a neon-drenched metropolis. Earn CRDO by winning races.",
           "price": 50,
           "developerAddress": "0xSpeedDemon",
           "gameUrl": "https://hexgl.bkcore.com/play/",
           "imageUrl": "https://img.freepik.com/free-vector/neon-lights-background-concept_23-2148674534.jpg"
         }'

echo ""

# Sample Game 3: Space Invaders Retro
curl -X POST http://localhost:18080/games/publish \
     -H "Content-Type: application/json" \
     -d '{
           "title": "Space Invaders Retro",
           "description": "Defend the blockchain from alien invaders. Classic arcade action.",
           "price": 10,
           "developerAddress": "0xRetroKing",
           "gameUrl": "https://funhtml5games.com/spaceinvaders/index.html",
           "imageUrl": "https://img.freepik.com/free-vector/pixel-art-alien-background_23-2148965778.jpg"
         }'

echo ""

echo "✅ Games Seeded!"
