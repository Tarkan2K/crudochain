import { Scene } from 'phaser';

export class GameScene extends Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private mapWidth: number = 256;
    private mapHeight: number = 256;
    private tileWidth: number = 64;
    private tileHeight: number = 32;
    private map: Phaser.Tilemaps.Tilemap | null = null;

    constructor() {
        super('GameScene');
    }

    create() {
        this.cameras.main.zoom = 1.0;

        // Try to create from Tiled JSON
        if (this.cache.tilemap.exists('map')) {
            this.createTiledMap();
        } else {
            this.createProceduralMap();
        }

        this.createPlayer();

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Set Camera Bounds (Isometric world is wider than just width * tileWidth)
        // Approx bounds for isometric:
        // Width is roughly mapWidth * tileWidth
        // Height is mapHeight * tileHeight
        // But we want to bound it so player doesn't see black.
        // For now, let's set a generous bound.
        this.cameras.main.setBounds(-2000, 0, this.mapWidth * this.tileWidth * 2, this.mapHeight * this.tileHeight * 2);
    }

    update() {
        this.handlePlayerMovement();
        this.depthSort();
        // Interaction check is less critical for this specific "console ready" task but good to keep
        // this.checkInteractions(); 
    }

    private createTiledMap() {
        try {
            this.map = this.make.tilemap({ key: 'map' });
            // Assuming the tileset name in Tiled is 'tileset' and matches the key 'tiles'
            // If not, we might need to adjust or ask user to ensure names match.
            // For robustness, we try to add the tileset image 'tiles' to the map.
            const tileset = this.map.addTilesetImage('tileset', 'tiles');
            if (tileset) {
                this.map.createLayer(0, tileset, 0, 0); // Create first layer
            }
        } catch (e) {
            console.error("Failed to load Tiled map, falling back", e);
            this.createProceduralMap();
        }
    }

    private createProceduralMap() {
        // We will use a Tilemap even for procedural to handle 256x256 efficiently
        // 0: Grass (Wildlands)
        // 1: Dirt (Exclusion)
        // 2: Stone (Monolith)
        // 3: Grass/Village (Era 1)

        const data: number[][] = [];
        const centerX = this.mapWidth / 2;
        const centerY = this.mapHeight / 2;

        for (let y = 0; y < this.mapHeight; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

                if (dist < 20) {
                    row.push(2); // Monolith Base
                } else if (dist < 50) {
                    row.push(1); // Exclusion Zone
                } else if (dist < 150) {
                    row.push(3); // Era 1
                } else {
                    row.push(0); // Wildlands
                }
            }
            data.push(row);
        }

        // Create Tilemap from data
        this.map = this.make.tilemap({ data: data, tileWidth: this.tileWidth, tileHeight: this.tileHeight });
        this.map.orientation = 'isometric';

        // We need to map these indices (0,1,2,3) to the generated textures
        // 'tile_grass' and 'tile_dirt' were generated in PreloadScene
        // But Tilemap needs a single tileset image usually.
        // For this fallback to work with Tilemap, we ideally need a single tileset image.
        // Since we generated separate textures, we can't easily use Tilemap with them without a canvas stitch.

        // ALTERNATIVE: For the fallback, since we don't have a real tileset image for the Tilemap,
        // we might have to stick to the "Add Image" approach BUT 256x256 is too big.
        // OR we just create a "Fallback Tileset" in Preload that combines them?
        // OR we just render the visible ones.

        // Let's go with a simpler approach for the fallback to ensure it works NOW:
        // Render a smaller area OR just render the images but accept it might be heavy.
        // ACTUALLY, the user said "Fallack... create a code of 'test' that generates a basic isometric floor...".
        // Let's stick to the Image loop but maybe optimize by only rendering if close to player?
        // No, that's complex for this step.

        // Let's try to render it. 65k images is heavy but maybe Chrome handles it?
        // No, 65k sprites is too much.

        // Let's use a CULLING approach in renderMap/update?
        // Or better: Just render the central area for the fallback?
        // User said: "Configura el WorldBounds de Phaser para un mapa de 256 x 256 Tiles."

        // Let's use the Tilemap approach but we need a tileset.
        // I will assume 'tiles' image loaded in Preload (or the generated one) can be used.
        // In PreloadScene, I generated 'tile_grass' and 'tile_dirt'.
        // I can't easily use them in a Tilemap without a combined texture.

        // REVERT to Image Loop but with a check:
        // Only render tiles within X distance of player? 
        // Or just render them all and see. 
        // Let's try rendering them all but using a Container or Blitter? Blitter is fast.

        // Let's use the Image Loop but optimize:
        // We will only render the ones around the center for the "Test" if Tiled fails,
        // OR we assume the user WILL provide assets.
        // The user said "create a code of 'test'...".

        // Let's stick to the Image Loop but maybe reduce the visual count for the fallback if it's too slow.
        // But I will implement the 256x256 logic.

        // Wait, I can use `this.add.group()` and `runChildUpdate` false?

        // Let's just do the loop. It's a "test" fallback.

        const group = this.add.group();

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                // Optimization: Only render if within a certain range of "civilization" for the fallback?
                // No, user wants scale.

                // Let's skip rendering "Wildlands" (Ring 3) tiles to save performance in fallback?
                // Ring 3 starts at 150.
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (dist > 160) continue; // Cull the far edges for performance in fallback

                let texture = 'tile_grass';
                const tileType = data[y][x];

                if (tileType === 1 || tileType === 2) texture = 'tile_dirt';
                if (tileType === 3) texture = 'tile_grass';

                const isoX = (x - y) * (this.tileWidth / 2);
                const isoY = (x + y) * (this.tileHeight / 2);

                // Center the map
                const finalX = isoX + 400; // Arbitrary offset, camera follows anyway
                const finalY = isoY;

                const tile = this.add.image(finalX, finalY, texture);
                tile.setOrigin(0.5, 1);
                tile.setDepth(finalY);

                if (tileType === 2) tile.setTint(0x555555); // Monolith
                if (tileType === 1) tile.setTint(0x888888); // Ash/Exclusion
            }
        }
    }

    private createPlayer() {
        // Spawn player in Era 1 (Radius 50-150)
        // Center is 128, 128. Let's spawn at 128, 100 (Distance 28) -> Wait, that's Exclusion (20-50).
        // Spawn at 128, 60 (Distance 68) -> Era 1.

        const spawnX = 128;
        const spawnY = 60;

        const isoX = (spawnX - spawnY) * (this.tileWidth / 2) + 400;
        const isoY = (spawnX + spawnY) * (this.tileHeight / 2);

        this.player = this.add.sprite(isoX, isoY, 'player');
        this.player.setOrigin(0.5, 0.9);
        this.player.setScale(0.5);

        // Camera start
        this.cameras.main.centerOn(isoX, isoY);
    }

    private handlePlayerMovement() {
        const speed = 300; // Faster for big map

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown) dx = -1;
        else if (this.cursors.right.isDown) dx = 1;

        if (this.cursors.up.isDown) dy = -1;
        else if (this.cursors.down.isDown) dy = 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            this.player.x += dx * speed * (this.game.loop.delta / 1000);
            this.player.y += dy * speed * (this.game.loop.delta / 1000);
        }
    }

    private depthSort() {
        this.player.setDepth(this.player.y);
    }
}
