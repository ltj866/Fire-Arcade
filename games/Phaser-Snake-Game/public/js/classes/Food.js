import {DEBUG, END_X, END_Y, SCREEN_WIDTH, GRID, SCREEN_HEIGHT} from "../SnakeHole.js";

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Food (scene) {
        Phaser.GameObjects.Sprite.call(this, scene);


        if (DEBUG) { // Add Timer Text next to fruit
            const ourUI = scene.scene.get('UIScene');
            this.fruitTimerText = scene.add.text(this.x , this.y , 
                ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
                { font: '11px Arial', 
                    fill: '#FFFFFF',
                    fontSize: "32px"
                    
            });
            this.fruitTimerText.setOrigin(0,0);  
        }

        this.setOrigin(0,-.0625);
        this.setDepth(47);
        
        
        this.electrons = scene.add.sprite().setOrigin(.22,.175).setDepth(48);
        this.electrons.playAfterDelay("electronIdle", Phaser.Math.RND.integerInRange(0,30)*10);
        this.electrons.anims.msPerFrame = 66;
        this.electrons.visible = false;
        

        //this.setTexture('blocks', 8).setDepth(10); // Fresh now!
        //this.decayStage01 = scene.time.addEvent({ delay: 1000, callback: fruit => { //was 2000
            //this.electrons.anims.msPerFrame = 112;
            //this.play("atom02idle");
        //}, callbackScope: scene });

        //his.decayStage02 = scene.time.addEvent({ delay: 2000, callback: fruit => { //was 7600
            //this.play("atom03idle");
            //this.electrons.play("electronDispersion01");
            //this.electrons.setVisible(false);
            //this.stop();
            //this.setTexture('blocks', 10).setDepth(10);
        //}, callbackScope: scene });

        //this.decayStage03 = scene.time.addEvent({ delay: 7600, callback: fruit => {
            //this.play("atom04idle");
        //}, callbackScope: scene });

        //this.startDecay(scene);

        this.move(scene);

        scene.atoms.push(this);

        scene.children.add(this); // Shows on screen
    },
    
    move: function (scene) {
        const ourInputScene = scene.scene.get("InputScene");

        this.playAfterDelay('atom05spawn',Phaser.Math.RND.integerInRange(0,100));
        this.chain(['atom01idle']);
        
        
        var validLocations = scene.validSpawnLocations();
        
        var pos = Phaser.Math.RND.pick(validLocations);
        

        this.setPosition(pos.x * GRID, pos.y * GRID); // This seems to magically reset the fruit timers
        scene.foodHistory.push([pos.x, pos.y, ourInputScene.moveCount]);
        //console.log(this.x,this.y)
        this.electrons.setPosition(pos.x * GRID, pos.y * GRID);
        //console.log(this.electrons.x,this.electrons.y)

        if (DEBUG) { // Reset Fruit Timer Text
            this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice
        }
    },

    startDecay: function(scene) {
        //this.electrons.play("electronIdle");
        //this.electrons.anims.msPerFrame = 66; // Setting electron framerate here to reset it after slowing in delay 2

        //this.chain(['atom05spawn', 'atom']);

            
        
        //this.decayStage01.destroy(); // Destory Old Timers
        //this.decayStage02.destroy();

        //this.decayStage01 = scene.time.addEvent({ delay: 1000, callback: fruit => {
            //this.electrons.setVisible(false);
            //this.play("atom02idle");
            //this.electrons.anims.msPerFrame = 112;
        //}, callbackScope: scene });

        //this.decayStage02 = scene.time.addEvent({ delay:2000, callback: fruit => {
            //this.play("atom03idle");
            //this.electrons.play("electronDispersion01");
        //this.decayStage03 = scene.time.addEvent({ delay: 7600, callback: fruit => {
            //this.play("atom04idle");
        //}, callbackScope: scene });
        //}, callbackScope: scene });

    },

});

export { Food };