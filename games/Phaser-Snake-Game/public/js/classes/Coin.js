import {GRID} from "../SnakeHole.js";

var Coin = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Coin(scene, pos) {
        Phaser.GameObjects.Sprite.call(this, scene);

        this.setPosition(pos.x * GRID, pos.y * GRID);
        this.setOrigin(0.125,0.125);
        this.setDepth(24);
        this.play('coin01idle');

        scene.coins.push(this);

        
    },
    
});


export { Coin };

        