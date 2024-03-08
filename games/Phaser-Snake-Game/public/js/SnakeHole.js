import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';

//******************************************************************** */
// GameSettings           SnakeHole
//******************************************************************** */

export const GRID = 24;  //.................. Size of Sprites and GRID
var FRUIT = 4;           //.................. Number of fruit to spawn
export const FRUITGOAL = 24; //24 //............................. Win Condition

var SPEEDWALK = 96; // 96 In milliseconds  
var SPEEDSPRINT = 24; // 24


var SCORE_FLOOR = 24; // Floor of Fruit score as it counts down.
var BOOST_FLOOR = 80;
var SCORE_MULTI_GROWTH = 0.01;

// DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0.0;   // Between 0,1 to make portal areas appear

// Game Objects
var snake;
var crunchSounds = [];

// Tilemap variables
var map;  // Phaser.Tilemaps.Tilemap 
var tileset;

//  Direction consts
export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
const START_SPRINT = 4;
const STOP_SPRINT = 5;

var PORTAL_COLORS = [
    // This color order will be respected. TODO add Slice
    '#fc0303',
    '#06f202',
    '#e2f202',
    '#fc03f8',
    //'#AABBCC'
];

var SOUND_CRUNCH = [
    ['crunch01', [ 'crunch01.ogg', 'crunch01.mp3' ]],
    ['crunch02', [ 'crunch02.ogg', 'crunch02.mp3' ]],
    ['crunch03', [ 'crunch03.ogg', 'crunch03.mp3' ]],
    ['crunch04', [ 'crunch04.ogg', 'crunch04.mp3' ]],
    ['crunch05', [ 'crunch05.ogg', 'crunch05.mp3' ]],
    ['crunch06', [ 'crunch06.ogg', 'crunch06.mp3' ]],
    ['crunch07', [ 'crunch07.ogg', 'crunch07.mp3' ]],
    ['crunch08', [ 'crunch08.ogg', 'crunch08.mp3' ]]
];

// TODOL: Need to truncate this list based on number of portals areas.
// DO this dynamically later based on the number of portal areas.


class StartScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'StartScene', active: true});
    }

    preload()
    {
        this.load.image('howToCard', 'assets/howToCard.webp');
    }

    create()
    {
        
        this.add.text(SCREEN_WIDTH/2 - GRID*6, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'});
        
        var card = this.add.image(5*GRID, 6*GRID, 'howToCard').setDepth(10);
        card.setOrigin(0,0);

        card.setScale(0.7);

        
        var continueText = this.add.text(SCREEN_WIDTH/2 - GRID*10, GRID*25, 'PRESS TO CONTINUE',{"fontSize":'48px'});
        
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
          });

        this.input.keyboard.on('keydown', e => {
            this.scene.start('GameScene');
            this.scene.start('UIScene');
            //console.log(e)
            this.scene.stop()
        })
    }

    end()
    {

    }


}


class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super({key: 'GameScene', active: false});
    }
    
    preload ()
    {
        this.load.image('bg01', 'assets/sprites/background01.png');
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });
        this.load.spritesheet('portals', 'assets/sprites/portalSheet.png', { frameWidth: 32, frameHeight: 32 });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/snakeMap.png');
        this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

        // Audio
        this.load.setPath('assets/audio');

        SOUND_CRUNCH.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
    }

    create ()
    {
        //RESET
        this.crunchSounds = [];
        crunchSounds = this.crunchSounds; // Still don't know why this works, but still do it.

        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: GRID, tileHeight: GRID });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
        
        // add background
        this.add.image(286, 286, 'bg01').setDepth(-1);

        // Audio
        SOUND_CRUNCH.forEach(soundID =>
            {
                this.crunchSounds.push(this.sound.add(soundID[0]));
            });


        this.crunchSounds = crunchSounds.slice(); // This copies. Does it need to copy here?

        // Arrays for collision detection
        this.apples = [];
        this.walls = [];
        this.portals = [];

        this.fruitCount = 0;

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice(); 
        

        
        this.lastMoveTime = 0; // The last time we called move()

        // define keys       
        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        var ourInputScene = this.scene.get('InputScene');
        this.input.keyboard.on('keydown', e => {
            ourInputScene.updateDirection(this, e);
        })

        this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
            if (DEBUG) { console.log(event.code+" unPress", this.time.now); }
            ourInputScene.inputSet.push([STOP_SPRINT, this.time.now]);
        }) 

        var makePair = function (scene, to, from){
            
            var colorHex = Phaser.Utils.Array.RemoveRandomElement(scene.portalColors); // May Error if more portals than colors.
            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, color, to, from);
            var p2 = new Portal(scene, color, from, to)
        }

        snake = new Snake(this, 11, 6);
        
        // width 25 grid
        // width 19

        this.map.forEachTile( tile => {
            // Empty tiles are indexed at -1. So any tilemap object that is not empty will be considered a wall
            // Index is the sprite value, not the array index. Normal wall is Index 4
            if (tile.index > 0) {  
                var wall = new Phaser.Geom.Point(tile.x,tile.y);
                this.walls.push(wall);
            }

        });

        for (let index = 0; index < FRUIT; index++) {
            var food = new Food(this);
        }


        var spawnAreaA = new SpawnArea(this, 2,3,6,5, 0x6666ff);
        var spawnAreaB = new SpawnArea(this, 10,3,6,5, 0x6666ff);
        var spawnAreaC = new SpawnArea(this, 24,3,6,5, 0x6666ff);
        var spawnAreaF = new SpawnArea(this, 2,23,6,5, 0x6666ff);

        var spawnAreaG = new SpawnArea(this, 10,13,6,5, 0x6666ff);
        var spawnAreaH = new SpawnArea(this, 24,23,6,5, 0x6666ff);

        var spawnAreaJ = new SpawnArea(this, 16,13,6,5, 0x6666ff);
        var spawnAreaI = new SpawnArea(this, 16,23,6,5, 0x6666ff);





        var A1 = spawnAreaA.genPortalChords(this);
        var H1 = spawnAreaH.genPortalChords(this);

        var B1 = spawnAreaB.genPortalChords(this);
        var G1 = spawnAreaG.genPortalChords(this);

        var C1 = spawnAreaC.genPortalChords(this);
        var F1 = spawnAreaF.genPortalChords(this);

        var J1 = spawnAreaJ.genPortalChords(this);
        var I1 = spawnAreaI.genPortalChords(this);

        makePair(this, A1, H1);
        makePair(this, B1, G1);
        makePair(this, C1, F1);
        makePair(this, J1, I1);

    }

    update (time, delta) 
    {
    // console.log("update -- time=" + time + " delta=" + delta);
        if (!snake.alive)
            {
                // game.scene.scene.restart(); // This doesn't work correctly
                if (DEBUG) { console.log("DEAD"); }
                
                this.events.emit('saveScore');
                //game.destroy();
                this.scene.restart();
                return;
            }

        
        // Only Calculate things when snake is moved.
        if(time >= this.lastMoveTime + this.moveInterval){
            //console.log(time, this.lastMoveTime, this.moveInterval);
            this.lastMoveTime = time;
 
            // Calculate Closest Portal to Snake Head
            let closestPortal = Phaser.Math.RND.pick(this.portals); // Start with a random portal
            closestPortal.fx.setActive(false);
            
            // Distance on an x y grid

            var closestPortalDist = Phaser.Math.Distance.Between(snake.head.x/GRID, snake.head.y/GRID, 
                                                                closestPortal.x/GRID, closestPortal.y/GRID);

            this.portals.forEach( portal => {
                var dist = Phaser.Math.Distance.Between(snake.head.x/GRID, snake.head.y/GRID, 
                                                    portal.x/GRID, portal.y/GRID);

                if (dist < closestPortalDist) { // Compare and choose closer portals
                    closestPortalDist = dist;
                    closestPortal = portal;
                }
            });


            // This is a bit eccessive because I only store the target portal coordinates
            // and I need to get the portal object to turn on the effect. Probably can be optimized.
            // Good enough for testing.
            if (closestPortalDist < 6) {
                this.portals.forEach(portal => {
                    if (portal.x/GRID === closestPortal.target.x && portal.y/GRID === closestPortal.target.y) {
                        portal.fx.setActive(true);
                        
                        //portal.fx.innerStrength = 6 - closestPortalDist*0.5;
                        portal.fx.outerStrength = 6 - closestPortalDist;

                        closestPortal.fx.setActive(true);
                        closestPortal.fx.innerStrength = 3 - closestPortalDist;
                        closestPortal.fx.outerStrength = 0;

                    }
                });
            };
            const ourUI = this.scene.get('UIScene');
            if (ourUI.fruitCount >= FRUITGOAL) { // not winning instantly
                console.log("YOU WIN");
    
                
                /*this.winText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 , 
                ["YOU WIN YAY!"
                ],
                { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', 
                    fontSize: "32px",
                    align: "center",
                });*/
    
                this.scene.pause();
                this.scene.start('WinScene');
            }
       
            if (DEBUG) {
                const ourUI = this.scene.get('UIScene');
                var timeTick = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
                if (timeTick < SCORE_FLOOR ) {
                    
                } else {
                    this.apples.forEach( fruit => {
                        fruit.fruitTimerText.setText(timeTick);
                    });
                }
                
            } 
            
            // Move at last second
            snake.move(this);
        }
        
        // Boost and Boot Multi Code
        var ourUI = this.scene.get('UIScene'); // Probably don't need to set this every loop. Consider adding to a larger context.
        var timeLeft = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10; // VERY INEFFICIENT WAY TO DO THIS

        if (!this.spaceBar.isDown){
            this.moveInterval = SPEEDWALK;} // Less is Faster
        else{
            this.moveInterval = SPEEDSPRINT; // Sprinting now 
            if (timeLeft >= BOOST_FLOOR ) { 
                // Don't add boost multi after 20 seconds
                ourUI.scoreMulti += SCORE_MULTI_GROWTH;
                //console.log(Math.sqrt(ourUI.scoreMulti));
            } else {
            }
        }
        if (timeLeft <= BOOST_FLOOR && timeLeft >= SCORE_FLOOR) {
            // Boost meter slowly drains after boost floor and before score floor
            ourUI.scoreMulti += SCORE_MULTI_GROWTH * -0.5;
            //console.log(ourUI.scoreMulti);
        }
    }
}

class WinScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'WinScene', active: false});
    }

    preload()
    {
        //this.load.image('howToCard', 'assets/howToCard.webp');
    }

    create()
    {
        
        const ourUI = this.scene.get('UIScene');
        const ourInputScene = this.scene.get('InputScene');

        const scoreScreenStyle = {
            width: '440px',
            //height: '22px',
            color: 'white',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '2px 0px 2px 12px',
            'font-weight': 'bold',
            //'border-radius': '24px',
            outline: 'solid',
        }
        ///////
        
        this.add.text(SCREEN_WIDTH/2 - GRID*6, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'});
        
        //var card = this.add.image(5*GRID, 5*GRID, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);
        
        var scoreScreen = this.add.dom(GRID*7, GRID * 7.5, 'div', scoreScreenStyle);
        scoreScreen.setOrigin(0,0);

        
        
        scoreScreen.setText(
        ` 
        /************ WINNING SCORE **************/
        SCORE: ${ourUI.score}
        TURNS: ${ourInputScene.turns}

        ................RUN STATS...................
        TOTAL FRUIT COLLECTED:  ${ourUI.globalFruitCount}
        RESPAWNS: 
        `);

        //card.setScale(0.7);

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, event => {
            var continueText = this.add.text(SCREEN_WIDTH/2 - GRID*11, GRID*25, '[PRESS TO CONTINUE]',{"fontSize":'48px'});

            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });
            
            this.input.keyboard.on('keydown', e => {
                ourUI.fruitCount = -1; // Ghost fruit is counted somewhere *shrug*
                ourUI.score = 0;
                ourUI.bestScore = 0;
                ourUI.globalFruitCount = -1;
    
                ourInputScene.turns = 0;
                ourInputScene.inputSet = [];
            
                this.scene.start('GameScene');
                this.scene.start('UIScene');
                this.scene.stop()
            });
        }, [], this);

        


    }

    end()
    {

    }

}

class UIScene extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'UIScene', active: false });

        this.score = 0;
        this.bestScore = 0;
        this.fruitCount = 0;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
    }

    create()
    {
        const ourGame = this.scene.get('GameScene');

        const UIStyle = {
            //width: '220px',
            //height: '22px',
            color: 'lightyellow',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '2px 9px 2px 9px',
            'font-weight': 'bold',
            //'border-radius': '24px',
            //outline: 'solid',
            'text-align': 'right',
        };
   
        const currentScore = this.add.dom(GRID * 1, GRID * 1, 'div', UIStyle);
        currentScore.setOrigin(0,0);
        currentScore.setText(`Score: ${this.score}`);
        
        const bestScore = this.add.dom(GRID * 7, GRID * 1, 'div', UIStyle);
        bestScore.setOrigin(0,0);
        //currentScore.setText(`Best: ${this.score}`)

        const fruitCountUI = this.add.dom(GRID * 28, GRID * 1, 'div', UIStyle);
        fruitCountUI.setOrigin(0,0);
        fruitCountUI.setText(`${this.fruitCount} / ${FRUITGOAL}`);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
         });
        
        if (DEBUG) {
            this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 27*GRID , 
            this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '30px Arial', 
              fill: '#FFFFFF',
              fontSize: "32px"
            });
        }
        
        //  Event: addScore
        ourGame.events.on('addScore', function (fruit)
        {

            const scoreStyle = {
                //width: '220px',
                //height: '22px',
                color: 'lightyellow',
                'font-size': '13px',
                'font-family': ["Sono", 'sans-serif'],
                'font-weight': '400',
                'padding': '2px 9px 2px 9px',
                'font-weight': 'bold',
                //'border-radius': '24px',
                //outline: 'solid',
                'text-align': 'right',
            };

            var scoreText = this.add.dom(fruit.x -10, fruit.y - GRID, 'div', scoreStyle);
            scoreText.setOrigin(0,0);
            
            // Remove score text after a time period.
            this.time.delayedCall(1000, event => {
                scoreText.removeElement();
            }, [], this);

            this.tweens.add({
                targets: scoreText,
                alpha: { from: 1, to: 0.1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
            //debugger
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            if (timeLeft > SCORE_FLOOR) {
                this.score += timeLeft;
                scoreText.setText(`+${timeLeft}`);
            } else {
                this.score += SCORE_FLOOR;
                scoreText.setText(`+${SCORE_FLOOR}`);
            }

            //this.score += this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            currentScore.setText(`Score: ${this.score}`);
            
            this.fruitCount += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            fruitCountUI.setText(`${this.fruitCount} / ${FRUITGOAL}`);
            

             // Restart Score Timer
            this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
            });

            var multiScore = Math.sqrt(this.scoreMulti);
            
            console.log(
                //ourGame.fruitCount + 1,
                timeLeft,
                this.score, 
                multiScore.toFixed(2), 
                (this.score * multiScore).toFixed(2));
            //console.log(this.score, Math.sqrt(this.scoreMulti), this.score * (Math.sqrt(this.scoreMulti)));
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function ()
        {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                bestScore.setText(`Best: ${this.bestScore}`);
            }
            
            // Reset Score for new game
            this.score = 0;
            this.scoreMulti = 0;
            this.fruitCount = 0;
            currentScore.setText(`Score: ${this.score}`); // Update Text on Screen
            fruitCountUI.setText(`${this.fruitCount} / ${FRUITGOAL}`);

            this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                delay: 10000,
                paused: false
             });

        }, this);
        
    }
    update()
    {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
        
        if (DEBUG) {
            if (timeTick < SCORE_FLOOR) {
            
            } else {
                this.timerText.setText(timeTick);
            }  
        }
    }
    
}

class InputScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'InputScene', active: true});
    }

    preload()
    {

    }
    create()
    {
        this.inputSet = [];
        this.turns = 0;
    }
    update()
    {
    }
    updateDirection(gameScene, event) 
    {
        // console.log(event.keyCode, this.time.now); // all keys
        //console.profile("UpdateDirection");
        //console.time("UpdateDirection");
        //console.log(this.turns);
        switch (event.keyCode) {
            case 87: // w

            if (snake.heading === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 6);
                snake.heading = UP; // Prevents backtracking to death
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 65: // a

            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) {
                snake.head.setTexture('blocks', 4);
                snake.heading = LEFT;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 83: // s

            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 7);
                snake.heading = DOWN;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 68: // d

            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 5);
                snake.heading = RIGHT;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 38: // UP

            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) {
                snake.head.setTexture('blocks', 6);
                snake.heading = UP;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 37: // LEFT

            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 4);
                snake.heading = LEFT;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 40: // DOWN

            if (snake.heading  === LEFT || snake.heading  === RIGHT || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 7);
                snake.heading = DOWN;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 39: // RIGHT

            if (snake.heading  === UP || snake.heading  === DOWN || snake.body.length <= 2) { 
                snake.head.setTexture('blocks', 5);
                snake.heading = RIGHT;
                snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 32: // SPACE
            if (DEBUG) { console.log(event.code, gameScene.time.now); }
            this.inputSet.push([START_SPRINT, gameScene.time.now]);

        }
    }
}

var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 768,
    height: 720,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    fx: {
        glow: {
            distance: 32,
            quality: 0.1
        }
    },
    dom: {
        createContainer: true
    },
    //scene: [ StartScene, InputScene]
    scene: [ StartScene, UIScene, GameScene, InputScene, WinScene]

};

// Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
export const END_X = SCREEN_WIDTH/GRID -1;
export const END_Y = SCREEN_HEIGHT/GRID -1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

export const game = new Phaser.Game(config);




