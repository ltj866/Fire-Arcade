import MainScene from "./mainscene.js";

const config = {
    width: 1312,
    height: 1312,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene]
};

new Phaser.Game(config);
