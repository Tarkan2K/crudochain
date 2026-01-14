import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private mapSize = 20;
    private tileWidth = 64;
    private tileHeight = 32;
    private centerX = 0;
    private centerY = 0;

    constructor() {
        super('GameScene');
    }

    create() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 4; // Start higher up

        this.createMap();
        this.createPlayer();
        this.createBuildings();
        this.setupCamera();
        this.setupInput();
    }

    update() {
        this.handleMovement();
        this.updateDepth();
    }

    private createMap() {
        // Map Generation Logic
        // 0 = Grass, 1 = Burnt
        const mapData: number[][] = [];

        for (let y = 0; y < this.mapSize; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.mapSize; x++) {
                // Calculate distance from center (10, 10)
                const dist = Math.sqrt(Math.pow(x - 10, 2) + Math.pow(y - 10, 2));

                if (dist < 4) {
                    row.push(1); // Burnt/Exclusion Zone
                } else {
                    row.push(0); // Grass
                }
            }
            mapData.push(row);
        }

        // Render Tiles
        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoPt = this.cartesianToIso(x, y);
                const tileType = mapData[y][x];
                const texture = tileType === 1 ? 'tile_burnt' : 'tile_grass';

                const tile = this.add.image(isoPt.x, isoPt.y, texture);
                tile.setOrigin(0.5, 1); // Anchor at bottom center
                tile.setDepth(isoPt.y); // Basic depth sorting for floor
            }
        }
    }

    private createBuildings() {
        // 1. MONOLITH (Center)
        const centerIso = this.cartesianToIso(10, 10);
        const monolith = this.physics.add.staticImage(centerIso.x, centerIso.y, 'monolith');
        monolith.setOrigin(0.5, 0.9); // Anchor near bottom
        monolith.setDepth(centerIso.y + 1); // Always slightly in front of the tile it sits on

        // 2. SHOP (Village Ring)
        const shopIso = this.cartesianToIso(10, 15);
        const shop = this.physics.add.staticImage(shopIso.x, shopIso.y, 'shop');
        shop.setOrigin(0.5, 0.8);
        shop.setDepth(shopIso.y + 1);
        shop.setData('type', 'shop');

        // 3. HOUSE (Village Ring)
        const houseIso = this.cartesianToIso(15, 10);
        const house = this.physics.add.staticImage(houseIso.x, houseIso.y, 'house');
        house.setOrigin(0.5, 0.8);
        house.setDepth(houseIso.y + 1);
        house.setData('type', 'house');

        // Add Colliders
        this.physics.add.collider(this.player, monolith);
        this.physics.add.collider(this.player, shop, this.handleShopCollision, undefined, this);
        this.physics.add.collider(this.player, house, this.handleHouseCollision, undefined, this);
    }

    private createPlayer() {
        const startIso = this.cartesianToIso(10, 16); // Start near shop
        this.player = this.physics.add.sprite(startIso.x, startIso.y, 'player');
        this.player.setOrigin(0.5, 1);
        this.player.setScale(1.5); // Hi-Bit scale

        // Adjust hitbox
        this.player.body.setSize(32, 32);
        this.player.body.setOffset(16, 32); // Center hitbox at feet
    }

    private setupCamera() {
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
    }

    private setupInput() {
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    private handleMovement() {
        const speed = 160;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        body.setVelocity(0);

        // Isometric Movement:
        // Up = Up-Right (-x, -y) ? No, in Iso:
        // W (Up) -> -Y (Cartesian) -> -X, -Y (Iso)
        // S (Down) -> +Y (Cartesian) -> +X, +Y (Iso)
        // A (Left) -> -X (Cartesian) -> -X, +Y (Iso)
        // D (Right) -> +X (Cartesian) -> +X, -Y (Iso)

        // Simplified for "Screen Space" control (W moves UP on screen):
        // W -> y - 1
        // S -> y + 1
        // A -> x - 1
        // D -> x + 1

        let velX = 0;
        let velY = 0;

        if (this.cursors.left.isDown) {
            velX = -speed;
        } else if (this.cursors.right.isDown) {
            velX = speed;
        }

        if (this.cursors.up.isDown) {
            velY = -speed;
        } else if (this.cursors.down.isDown) {
            velY = speed;
        }

        body.setVelocity(velX, velY);
    }

    private updateDepth() {
        // Dynamic Depth Sorting
        this.player.setDepth(this.player.y);
    }

    private cartesianToIso(x: number, y: number): Phaser.Math.Vector2 {
        const isoX = (x - y) * (this.tileWidth / 2);
        const isoY = (x + y) * (this.tileHeight / 2);
        return new Phaser.Math.Vector2(isoX, isoY);
    }

    private handleShopCollision(player: any, shop: any) {
        // Emit event to React
        const event = new CustomEvent('game-interaction', { detail: { type: 'SHOP_PROXIMITY', active: true } });
        window.dispatchEvent(event);
    }

    private handleHouseCollision(player: any, house: any) {
        const event = new CustomEvent('game-interaction', { detail: { type: 'HOUSE_PROXIMITY', active: true } });
        window.dispatchEvent(event);
    }
}
