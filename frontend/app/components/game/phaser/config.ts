import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true, // Enable debug to see hitboxes
            gravity: { x: 0, y: 0 } // Top-down, no gravity
        }
    },
    scene: [BootScene, PreloadScene, GameScene]
};

export default config;
