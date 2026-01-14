import { Scene } from 'phaser';

export class GameScene extends Scene {
    private player!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private mapWidth: number = 20;
    private mapHeight: number = 20;
    private tileWidth: number = 64;
    private tileHeight: number = 32;
    private mapData: number[][] = []; // 0: Grass, 1: Dirt (Exclusion), 2: Tower, 3: Village

    constructor() {
        super('GameScene');
    }

    create() {
        this.createMapData();
        this.renderMap();
        this.createPlayer();
        this.cameras.main.zoom = 1.0;

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update() {
        this.handlePlayerMovement();
        this.depthSort();
        this.checkInteractions();
    }

    private createMapData() {
        // Initialize map
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                // Distance from center
                const centerX = this.mapWidth / 2;
                const centerY = this.mapHeight / 2;
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

                if (dist < 2) {
                    this.mapData[y][x] = 2; // Monolith/Tower Base
                } else if (dist < 6) {
                    this.mapData[y][x] = 1; // Exclusion Zone (Dirt)
                } else if (dist > 6 && dist < 9) {
                    this.mapData[y][x] = 3; // Village Ring
                } else {
                    this.mapData[y][x] = 0; // Grass
                }
            }
        }
    }

    private renderMap() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 4; // Start higher up

        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileType = this.mapData[y][x];
                let texture = 'tile_grass';

                if (tileType === 1 || tileType === 2) texture = 'tile_dirt';
                if (tileType === 3) texture = 'tile_grass'; // Village on grass for now

                // Isometric projection
                const isoX = (x - y) * (this.tileWidth / 2) + 400; // Offset to center
                const isoY = (x + y) * (this.tileHeight / 2);

                const tile = this.add.image(isoX, isoY, texture);
                tile.setOrigin(0.5, 1);
                tile.setDepth(isoY); // Simple depth sorting for static tiles

                // Add some visual flair for "Monolith" (just taller blocks or different tint for now)
                if (tileType === 2) {
                    tile.setTint(0x555555);
                }
            }
        }
    }

    private createPlayer() {
        // Spawn player in the village ring
        const spawnX = 10;
        const spawnY = 15;

        const isoX = (spawnX - spawnY) * (this.tileWidth / 2) + 400;
        const isoY = (spawnX + spawnY) * (this.tileHeight / 2);

        this.player = this.add.sprite(isoX, isoY, 'player');
        this.player.setOrigin(0.5, 0.9); // Anchor at feet
        this.player.setScale(0.5); // Adjust scale if sprite is too big
    }

    private handlePlayerMovement() {
        const speed = 200; // px/sec

        // Simple isometric movement vector
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown) {
            dx = -1;
        } else if (this.cursors.right.isDown) {
            dx = 1;
        }

        if (this.cursors.up.isDown) {
            dy = -1;
        } else if (this.cursors.down.isDown) {
            dy = 1;
        }

        if (dx !== 0 || dy !== 0) {
            // Normalize
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            this.player.x += dx * speed * (this.game.loop.delta / 1000);
            this.player.y += dy * speed * (this.game.loop.delta / 1000);
        }
    }

    private checkInteractions() {
        // Simple distance check for now
        // Convert player position to grid coordinates
        // Iso to Grid:
        // x = (isoY / tileHeight) + (isoX - centerX) / tileWidth
        // y = (isoY / tileHeight) - (isoX - centerX) / tileWidth

        const isoX = this.player.x - 400; // Remove offset
        const isoY = this.player.y;

        // Approximate grid conversion
        const gridX = Math.floor((isoY / (this.tileHeight / 2) + isoX / (this.tileWidth / 2)) / 2);
        const gridY = Math.floor((isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2);

        // Check bounds
        if (gridX >= 0 && gridX < this.mapWidth && gridY >= 0 && gridY < this.mapHeight) {
            const onInteraction = this.registry.get('onInteraction');

            // Mock Shop Location at (10, 10)
            if (gridX === 10 && gridY === 10) {
                if (onInteraction) onInteraction('SHOP_PROXIMITY', true);
            }
            // Mock House Location at (5, 5)
            else if (gridX === 5 && gridY === 5) {
                if (onInteraction) onInteraction('HOUSE_PROXIMITY', true);
            }
        }
    }

    private depthSort() {
        // Dynamic depth sorting for player
        this.player.setDepth(this.player.y);
    }
}
