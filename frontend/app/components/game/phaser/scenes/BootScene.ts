import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load minimal assets here if needed (e.g. loading bar)
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
