import MainScene from "./mainscene.js";

const config = {
    width: 1280,
    height: 320,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene]
};

new Phaser.Game(config);