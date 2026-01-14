import { Scene } from 'phaser';

export class PreloadScene extends Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load character sprite
        this.load.image('player', '/assets/images/cavernicola.png');

        // Placeholder for tileset - we will generate a texture if not found, 
        // but for now let's try to load a hypothetical one or just use a graphic in GameScene
        // this.load.image('tiles', '/assets/images/tileset.png'); 
    }

    create() {
        // Generate a placeholder tile texture if we don't have one
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // Draw a simple isometric tile shape (diamond)
        graphics.fillStyle(0x3e8948); // Grass green
        graphics.beginPath();
        graphics.moveTo(32, 0);
        graphics.lineTo(64, 16);
        graphics.lineTo(32, 32);
        graphics.lineTo(0, 16);
        graphics.closePath();
        graphics.fillPath();

        // Add a darker border for depth
        graphics.lineStyle(1, 0x2a5d31);
        graphics.strokePath();

        graphics.generateTexture('tile_grass', 64, 32);

        // Dirt tile
        graphics.clear();
        graphics.fillStyle(0x7c5e42); // Dirt brown
        graphics.beginPath();
        graphics.moveTo(32, 0);
        graphics.lineTo(64, 16);
        graphics.lineTo(32, 32);
        graphics.lineTo(0, 16);
        graphics.closePath();
        graphics.fillPath();
        graphics.lineStyle(1, 0x5a4230);
        graphics.strokePath();

        graphics.generateTexture('tile_dirt', 64, 32);

        this.scene.start('GameScene');
    }
}
