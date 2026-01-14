import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load Player Sprite
        this.load.image('player', '/assets/images/cavernicola.png');

        // Generate Placeholder Textures for Map Tiles if real assets are missing
        // We will use these keys in the GameScene
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // 1. Grass Tile (Isometric Diamond)
        graphics.fillStyle(0x2ecc71);
        graphics.beginPath();
        graphics.moveTo(32, 0);
        graphics.lineTo(64, 16);
        graphics.lineTo(32, 32);
        graphics.lineTo(0, 16);
        graphics.closePath();
        graphics.fill();
        graphics.generateTexture('tile_grass', 64, 32);
        graphics.clear();

        // 2. Burnt Ground (Exclusion Zone)
        graphics.fillStyle(0x5d4037); // Dark Brown
        graphics.beginPath();
        graphics.moveTo(32, 0);
        graphics.lineTo(64, 16);
        graphics.lineTo(32, 32);
        graphics.lineTo(0, 16);
        graphics.closePath();
        graphics.fill();
        graphics.generateTexture('tile_burnt', 64, 32);
        graphics.clear();

        // 3. Wall/Block
        graphics.fillStyle(0x7f8c8d);
        graphics.fillRect(0, 0, 64, 64); // Simple block for now
        graphics.generateTexture('wall', 64, 64);
        graphics.clear();

        // 4. Tower Base (Monolith) - Large
        graphics.fillStyle(0x2c3e50); // Dark Blue/Grey
        graphics.fillRect(0, 0, 128, 256); // Tall tower
        graphics.generateTexture('monolith', 128, 256);
        graphics.clear();

        // 5. Shop Building
        graphics.fillStyle(0xf1c40f); // Yellowish
        graphics.fillRect(0, 0, 96, 96);
        graphics.generateTexture('shop', 96, 96);
        graphics.clear();

        // 6. House Building
        graphics.fillStyle(0x9b59b6); // Purple
        graphics.fillRect(0, 0, 80, 80);
        graphics.generateTexture('house', 80, 80);
        graphics.clear();
    }

    create() {
        this.scene.start('GameScene');
    }
}
