import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the preload scene itself (e.g., loading bar)
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
