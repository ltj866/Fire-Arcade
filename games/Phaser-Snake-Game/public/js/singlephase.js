import MainScene from "./mainscene.js";

const config = {
    width: 656,
    height: 656,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    scene: [MainScene]
};

new Phaser.Game(config);
