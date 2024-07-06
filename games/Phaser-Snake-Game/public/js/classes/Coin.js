import {GRID} from "../SnakeHole.js";

var Coin = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Coin(scene, coinArray, x, y) {
        Phaser.GameObjects.Sprite.call(this, scene);

        this.setPosition(x * GRID, y * GRID);
        this.setOrigin(0.125,0.125);
        this.setDepth(24);
        this.play('coin01idle');

        coinArray.push(this);
        debugger

        
    },
    
});


export { Coin };

        