import { X_OFFSET, Y_OFFSET, 
    GRID, MODES, STYLE_DEFAULT, 
    GState, DIRS, commaInt, PLAYER_STATS, 
    INVENTORY_ITEMS,INVENTORY_DATA,
    BOOST_ADD_FLOOR, COMBO_ADD_FLOOR, 
    SPACE_BOY, PERSISTS,
    COLOR_FOCUS_HEX } from "../SnakeHole.js";
import { Food } from "../classes/Food.js";
import { Snake } from "../classes/Snake.js";
import { PORTAL_COLORS} from '../const.js';

import { ITEMS } from "./items.js";

export const STAGE_OVERRIDES = new Map();

/*
STAGE_OVERRIDES.set("tmp", {
    tmp: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
        },
    }
});
*/

STAGE_OVERRIDES.set("World_4-4", {
    4_4: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {

            var transTile = scene.wallLayer.findByIndex(11);
            transTile.index = -1;

            if (!INVENTORY_ITEMS.get("gearbox")) {
                scene.gearbox = scene.add.sprite(transTile.pixelX + X_OFFSET, transTile.pixelY + Y_OFFSET, 'inventoryIcons',26)
                .setOrigin(0, 0).setDepth(100);

                scene.gearbox.play('coin01idle');

                scene.tweens.add( {
                    targets: scene.gearbox,
                    originY: [0.1875 - .0466,0.1875 + .0466],
                    ease: 'sine.inout',
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                });


                if (scene.interactLayer[(scene.gearbox.x - X_OFFSET)/GRID][(scene.gearbox.y - Y_OFFSET)/GRID] === "empty") {

                    scene.interactLayer[(scene.gearbox.x - X_OFFSET)/GRID][(scene.gearbox.y - Y_OFFSET)/GRID] = scene.gearbox;

                } else {
                    // Sanity debugger.
                    debugger
                }

                scene.gearbox.onOver = this.onOver;
            }
        },
        onOver: function () {
            INVENTORY_ITEMS.set("gearbox", true);
            localStorage.setItem("inventory-items", JSON.stringify(Object.fromEntries(INVENTORY_ITEMS)));

            this.interactLayer[(this.gearbox.x - X_OFFSET)/GRID][(this.gearbox.y - Y_OFFSET)/GRID] = "empty";
            
            this.gearbox.destroy();

            var spaceboy = this.scene.get("SpaceBoyScene");
            ITEMS.get("gearbox").addToInventory(spaceboy);

        }
    }
});

STAGE_OVERRIDES.set("World_2-4", {
    2_4: null,
    methods: {
        preFix: function (scene) {

        },
        postFix: function (scene) {

            var piggyTile = scene.wallLayer.findByIndex(11);
            piggyTile.index = -1;

            if (!INVENTORY_ITEMS.get("piggybank")) {
                scene.piggy = scene.add.sprite(piggyTile.pixelX + X_OFFSET, piggyTile.pixelY + Y_OFFSET, 'inventoryIcons',3)
                    .setOrigin(0, 0).setDepth(100);

                scene.tweens.add( {
                    targets: scene.piggy,
                    originY: [0.1875 - .0466,0.1875 + .0466],
                    ease: 'sine.inout',
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                });


                if (scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] === "empty") {

                    scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] = scene.piggy;

                } else {
                    // Sanity debugger.
                    debugger
                }
            


                scene.piggy.onOver = function() {
                    INVENTORY_ITEMS.set("piggybank", true);
                    localStorage.setItem("inventor-items", JSON.stringify(Object.fromEntries(INVENTORY_ITEMS)));

                    scene.interactLayer[(scene.piggy.x - X_OFFSET)/GRID][(scene.piggy.y - Y_OFFSET)/GRID] = "empty";
                    
                    scene.piggy.destroy();

                    var spaceboy = scene.scene.get("SpaceBoyScene");
                    ITEMS.get("piggybank").addToInventory(spaceboy);
                }
            }
        }
    }
});

/**
 * Bonus Levels
 */

// Summon Walls
STAGE_OVERRIDES.set("Bonus_X-1", {
    X_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.stopOnBonk = true;
            scene.stageConfig.tickCounter = 0;
        },
        postFix: function (scene) {
            // Override

            scene.oldBonk = scene.onBonk;
            scene.onBonk = this.onBonk;
            scene.checkWinCon = this.checkWinCon;

        },
        afterEat: function (scene, food) {

            //if (scene.tickCounter >= 15) {

                var valid = scene.validSpawnLocations();
                var times = 2

                while (times > 0) {

                    var chords = Phaser.Math.RND.pick(valid);
                    var _x = (chords.x - X_OFFSET) / GRID;
                    var _y = (chords.y - Y_OFFSET) / GRID;
                    

                    var wall = scene.wallLayer.getTileAt(0, 0, true, scene.wallVarient);
                    var tile = scene.wallLayer.getTileAt(_x, _y, true, scene.wallVarient);
                    
                    tile.index = 5;
                    tile.properties.hasCollision = true;

                    times--;
                    
                }
        },
        onBonk: function () { // .this = GameScene
            var ourPersist = this.scene.get("PersistScene");
            this.coinsUIIcon.setVisible(false);
            ourPersist.coins = Math.max(ourPersist.coins -1, 1);

            if (ourPersist.coins != 1) {
                ourPersist.loseCoin();
            }
            this.coinUIText.setHTML(
            `${commaInt(ourPersist.coins).padStart(2, '0')}`
            );

            this.stageConfig.maxScore = Math.max(this.stageConfig.maxScore - 10, 1);

            debugger;

            this.snake.head;

            // Add check for stuck on self.  
        },
        checkWinCon: function () {

            let head = this.snake.head;

            var above = {x:head.x , y: head.y - GRID};
            var down = {x:head.x , y: head.y + GRID};
            var left = {x:head.x - GRID , y: head.y};
            var right = {x:head.x + GRID , y: head.y};

            var check = [above, down, left, right].every( pos => {
                return this.snake.body.some( part => {
                    return pos.x === part.x && pos.y === part.y
                })
            });

            if (check) {
                this.bonk = this.oldBonk; // This needs to be verified it works.
                this.events.emit('win');
            }
             

        }
    }
});

// Big Boost Balls
STAGE_OVERRIDES.set("Bonus_X-2", {
    X_2: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.stopOnBonk = true;
        
            scene.stageConfig.boostCost = 8;
            scene.stageConfig.boostAdd = 0;
            
            scene.stageConfig.speedSprint = 99;
            scene.stageConfig.speedWalk = 33;
        },
        postFix: function (scene) {

            scene.atoms.forEach( atom => {
                atom.scale = 2;
                atom.electrons.scale = 2;

                atom.move(scene);

            });
        },
        afterEat: function(scene, food) {
            // Grow 3 more times.
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            
        },
        afterMoveFood: function (scene, food) {

            var foodX = (food.prevX - X_OFFSET) / GRID;
            var foodY = (food.prevY - Y_OFFSET) / GRID;

            scene.interactLayer[foodX + 1][foodY] = "empty";
            scene.interactLayer[foodX][foodY + 1] = "empty";
            scene.interactLayer[foodX + 1][foodY + 1] = "empty";

            var foodX = (food.x - X_OFFSET) / GRID;
            var foodY = (food.y - Y_OFFSET) / GRID;

            scene.interactLayer[foodX + 1][foodY] = food;
            scene.interactLayer[foodX][foodY + 1] = food;
            scene.interactLayer[foodX + 1][foodY + 1] = food;

        }
        /*afterMove: function (scene) {

            var onGridX = (scene.snake.head.x - X_OFFSET) / GRID;
            var onGridY = (scene.snake.head.y - Y_OFFSET) / GRID;
            //remove decimals to prevent erroring
            onGridX = Math.round(onGridX);
            onGridY = Math.round(onGridY);

            if (scene.gState === GState.PLAY) {

                if (typeof scene.interactLayer[Math.min(onGridX + 1, 29)][onGridY].onOver === 'function') {
                    scene.interactLayer[Math.min(onGridX + 1, 29)][onGridY].onOver(scene);
                }
                if (typeof scene.interactLayer[Math.min(onGridX + 1, 29)][Math.min(onGridY + 1, 27)].onOver === 'function') {
                    scene.interactLayer[Math.min(onGridX + 1, 29)][Math.min(onGridY + 1, 27)].onOver(scene);
                }
                if (typeof scene.interactLayer[onGridX][Math.min(onGridY + 1, 27)].onOver === 'function') {
                    scene.interactLayer[onGridX][Math.min(onGridY + 1, 27)].onOver(scene);
                }
            }


        */
    }
});

// Million Apples
STAGE_OVERRIDES.set("Bonus_X-3", {
    X_3: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 221;
        },
        postFix: function (scene) {
            scene.atoms.forEach( atom => {
                atom.electrons.alpha = 0;
            });
        },
        afterEat: function (stage, food) {
            stage.atoms.delete(food);
            food.delayTimer.destroy();
            food.electrons.destroy();
            food.destroy();
        }
    }
});

// Disarm the Bomb Stage
STAGE_OVERRIDES.set("Bonus_X-6", {
    X_6: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.bombTime = 40;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.bombAtom = new Food(scene, Phaser.Math.RND.pick(scene.validSpawnLocations())); //CODESMELL

            var pos = scene.bombAtom.getBottomRight();

            scene.bombAtom.timerText = scene.mapProgressPanelText = scene.add.bitmapText(pos.x, pos.y, 'mainFont', 
                Math.trunc(scene.bombTime / 10), 
                8).setOrigin(1,1).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);
            
            
            scene.bombAtom.setTint(0x000000);
    
        },
        afterEat: function (scene, food) {
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);

            var pos = scene.bombAtom.getBottomRight()

            scene.bombAtom.timerText.x = pos.x;
            scene.bombAtom.timerText.y = pos.y;
        },
        afterTick: function (scene) {
            var diff = scene.stageConfig.maxScore - scene.stageConfig.bombTime;
            var time = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10 ;

            scene.bombAtom.timerText.setText(
                Math.max(Math.trunc((time - diff - 1) / 10) + 1
                , 0)
            );
        },
        checkWinCon: function () {
            if (this.currentScoreTimer() < this.stageConfig.maxScore - this.stageConfig.bombTime) {
                this.events.emit('win');  
            }
            return ;
        }, 
    }
});

// Tail Eating the Snake
STAGE_OVERRIDES.set("Bonus_X-8", {
    X_8: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.attackTimer = 12;
            scene.stageConfig.tickCounter = 0;
            scene.stageConfig.countDownTicker = scene.stageConfig.attackTimer * 10;
            scene.length = -12;
        },
        postFix: function (scene) {

            var times = 12;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }

            //scene.length = scene.length - 12;

            scene.attackerText = scene.add.bitmapText(0, 0, 'mainFont', 
                scene.stageConfig.attackTimer, 
                8).setOrigin(1,1).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

            scene.snake.body[scene.snake.body.length -1].setTint(0xCC0000);
            

            scene.checkWinCon = this.checkWinCon;
        },
        checkWinCon: function () {
            if (this.snake.body.length < 2) {
                this.events.emit('win');
            }
            return
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.stageConfig.tickCounter++;
            scene.stageConfig.countDownTicker--;

            if (scene.stageConfig.countDownTicker < 1) {
                scene.stageConfig.attackTimer--;
                scene.stageConfig.countDownTicker = scene.stageConfig.attackTimer * 10;
                
            }
            if (scene.stageConfig.tickCounter >= scene.stageConfig.attackTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }

                scene.attackerText.setText(scene.stageConfig.attackTimer);

                scene.stageConfig.tickCounter = 0;
            }    
        },
        afterEat: function (scene) {
            if (scene.snake.body.length > 1){
                scene.snake.body[scene.snake.body.length -1].setTexture('snakeDefault',[4]);
                scene.snake.body[scene.snake.body.length -1].setTint(0xCC0000);
                scene.snake.body[scene.snake.body.length -2].clearTint();
            }
        },
        afterMove: function (scene) {
            var tail = scene.snake.body[scene.snake.body.length -1].getBottomRight();

            scene.attackerText.x = tail.x;
            scene.attackerText.y = tail.y;

        },
    }
});

// Timer Tail Stage (Timed Bonus)
STAGE_OVERRIDES.set("Bonus_X-9", {
    X_9: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.deathTimer = 10;
            scene.stageConfig.tickCounter = 0;
            scene.length = -50;
        },
        postFix: function (scene) {

            var times = 50;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }

            scene.snake.body[scene.snake.body.length -1].setTint(0x000000);
            scene.snake.body[scene.snake.body.length -1].setDepth(45);

            scene.attackerText = scene.add.bitmapText(
                scene.startCoords.x + GRID - 1, 
                scene.startCoords.y + GRID - 1, 
                'mainFont', 
                scene.stageConfig.deathTimer, 
                8
            ).setOrigin(1,1).setDepth(50).setAlpha(1).setTintFill(0xFFFFFF);

            scene.checkWinCon = this.checkWinCon;
            scene.oldGrow = this.snake.grow;
            scene.snake.grow = this.grow;
        },
        checkWinCon: function () {
            if (this.snake.body.length < 2) {
                scene.snake.grow = this.oldGrow;
                this.events.emit('win');
            }
            return 
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        afterTick: function (scene) {
            
            scene.stageConfig.tickCounter++;
            if (scene.stageConfig.tickCounter >= scene.stageConfig.deathTimer){

                if (scene.snake.body.length > 1) {
                    scene.snake.tail = scene.snake.body.slice(-1);

                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 2,1);

                    oldPart[0].destroy();  
                }
                scene.stageConfig.tickCounter = 0;
            }
            scene.attackerText.setText(scene.stageConfig.deathTimer - scene.stageConfig.tickCounter);    
        },
        afterEat: function (scene) {
            if (scene.snake.body.length > 1){
                scene.snake.body[scene.snake.body.length -1].setTexture('snakeDefault',[1]);
                scene.snake.body[scene.snake.body.length -1].setTint(0x000000);
                scene.snake.body[scene.snake.body.length -2].clearTint();

                scene.snake.body[scene.snake.body.length -1].setDepth(45);
                scene.snake.body[scene.snake.body.length -2].setDepth(40);
                
            }
        },
        afterMove: function (scene) {
            
            var tail = scene.snake.body[scene.snake.body.length -1].getBottomRight();

            if (isNaN(tail.x) || isNaN(tail.y)) {
                scene.attackerText.x = scene.startCoords.x + GRID;
                scene.attackerText.y = scene.startCoords.y + GRID;  
            } else {
                scene.attackerText.x = tail.x;
                scene.attackerText.y = tail.y;    
            }


        },
        grow: function (scene)
        {
            const ourSpaceBoy = scene.scene.get("SpaceBoyScene");
            scene.length += 1;
            scene.globalFruitCount += 1; // Run Wide Counter

            var length = `${scene.length}`;

            ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
            
            this.tail = this.body.slice(-1);
        
            scene.applyMask()
        },
    }
});

// Reverse Snake (Lackluster but could be item?)
STAGE_OVERRIDES.set("Bonus_X-7", {
    X_7: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
        },
        postFix: function (scene) {

            var times = 28;
            while (times > 0) {
                scene.snake.grow(scene);
                times--;
            }
            
            scene.checkWinCon = this.checkWinCon;

            scene.oldGrow = this.snake.grow;
            scene.snake.grow = this.grow;
            scene.snake.grow = this.oldGrow;
    
        },
        checkWinCon: function () {
            if (this.length < 1) {
                this.events.emit('win');
            }
            return ;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < 1;
        
        },
        grow: function (scene)
        {
            const ourSpaceBoy = scene.scene.get("SpaceBoyScene");
            scene.length -= 1;
            scene.globalFruitCount += 1; // Run Wide Counter
    
            var length = `${scene.length}`;
            
            //ourSpaceBoy.lengthGoalUI.setAlpha(1);
            ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
    
    
            /*
            if (scene.boostOutlinesBody.length > 1) {
                //newPart.setTint(0xFF00FF);
                // Make the new one
                var boostOutline = scene.add.sprite(
                    this.body[this.body.length - 2].x, 
                    this.body[this.body.length - 2].y
                ).setOrigin(.083333,.083333).setDepth(15);
                 
                boostOutline.play("snakeOutlineAnim");
                scene.boostOutlinesBody.unshift(boostOutline);
            }
            */
            
            if (this.body.length > 1) {
                this.tail = this.body.slice(-1);
                Math.random()

                var oldPart = this.body.splice(1,1);

                oldPart[0].destroy();
                
            } else {
                scene.snake.grow = this.oldGrow;
                scene.winned = true;
            }
    
    
            if (this.body.length > 1){
                this.body[this.body.length -1].setTexture('snakeDefault',[4])
                
            }
            //this.body.push(newPart);
            scene.applyMask();
    
    
        },
    }
});

/**
 * Training Levels - 2
 */

// Combo Trainer
STAGE_OVERRIDES.set("Bonus_X-13", {
    X_13: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.stopOnBonk = true;
            scene.stageConfig.highScore = INVENTORY_DATA.get("comboTrainerPB");
        },
        postFix: function (scene) {
            scene.snake.grow(scene);
            scene.snake.grow(scene);
            scene.snake.grow(scene);

            scene.comboText = scene.add.bitmapText(0, 0, 'mainFont', 
                scene.snake.comboCounter, 
                8).setOrigin(0.5,0.5).setDepth(100).setAlpha(1).setTintFill(0xFFFFFF);

        },
        afterMove: function (scene) {
            if (scene.snake.comboCounter === 0) {
                if (scene.snake.body.length > 3) {
                    scene.snake.tail = scene.snake.body.slice(-1);
                    var oldPart = scene.snake.body.splice(scene.snake.body.length - 1,1);

                    oldPart[0].destroy();  

                    scene.snake.body[scene.snake.body.length - 1].setFrame(8);
                }
            }


            if (scene.snake.comboCounter > scene.stageConfig.highScore) {
                debugger
                scene.stageConfig.highScore = scene.snake.comboCounter;
                scene.scene.get("SpaceBoyScene").comboTrainertPB.setText(scene.stageConfig.highScore);

                INVENTORY_DATA.set("comboTrainerPB", scene.snake.comboCounter);
                localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));
            }
            //debugger

            var head = scene.snake.body[1].getCenter();

            scene.comboText.x = head.x;
            scene.comboText.y = head.y;
            scene.comboText.setText(scene.snake.comboCounter);

        },
    }
});

// Trainer Level 2
STAGE_OVERRIDES.set("Bonus_X-5", {
    X_5: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.highScore = INVENTORY_DATA.get("comboTrainerXPB");
            scene.stageConfig.firstFood = false;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;
        },
        afterMove: function (scene) {
            if (scene.snake.comboCounter > scene.stageConfig.highScore) {
                scene.stageConfig.highScore = scene.snake.comboCounter;
                scene.scene.get("SpaceBoyScene").comboTrainerX_PB.setText(scene.stageConfig.highScore);

                INVENTORY_DATA.set("comboTrainerXPB", scene.snake.comboCounter);
                localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));
            }

            if (scene.snake.comboCounter === 0 && scene.stageConfig.firstFood) {
                scene.snake.bonk(scene);
                scene.stageConfig.firstFood = false;
            }
        },
        afterBonk: function (scene) {
            var toRemove = scene.snake.body.splice(1, scene.snake.body.length -1);
            toRemove.forEach( bodyPart => {
                bodyPart.destroy();
            });
        },
        afterEat: function(scene) {
            if (scene.snake.comboCounter > 0) {
                // Something is off with the combo counter. It doesn't start after the first combo.
                // This if statment shouldn't need be.
                scene.stageConfig.firstFood = true;
            }
        },
        checkWinCon: function () {
            return false;
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },   
    }
});


/**
 * Atom Types - 2 (Future Content, trainer ball levels?);
 */

// Double Apple
STAGE_OVERRIDES.set("Bonus_X-4", {
    X_4: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;

            scene.atoms.forEach( atom => {
                atom.setTint(0xFFD700);
            })
        },
        afterEat: function (scene, food) {
            // These are done for a second time.
            scene.snake.grow(scene);
            scene.events.emit('addScore', food); 
        },
        checkWinCon: function () {
            if (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < BOOST_ADD_FLOOR) {
                this.events.emit('win');
            }
        
        },
    }
});

// Ghost Atom Stage
STAGE_OVERRIDES.set("Bonus_X-10", {
    X_10: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.collideSelf = false;
            return true
        },
        postFix: function (scene) {
            scene.checkWinCon = this.checkWinCon;
        },
        checkWinCon: function () {
            return false;
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        }, 
    }
});



/**
 * Possible New World Types - 2 New
 * Currently - Ghost Walls and Dark Levels
 */

const EVIL_TRANSFORM = Object.freeze({ 
    CLOCKWISE: 0,
    NORMAL: 1, 
    INVERSE: 2, 
    COUNTER_CLOCKWISE: 3, 
}); 

var evilSnake = function (scene, upInv, downInv, leftInv, rightInv, vect2d, color) {



    if (!vect2d) {
        var spawnTile = scene.map.findByIndex(10, 0, false, scene.wallVarient); // Evil Snake Head Index
        var evilStartCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};

        spawnTile.index = -1;
        
    } else {
        var evilStartCoords = vect2d;
    }
    

    var evilSnake = new Snake(scene, evilStartCoords.x, evilStartCoords.y);

    if (!color) {
        evilSnake.bodyColor = 0x66666;
        
    } else {
        evilSnake.bodyColor = color;
    }

    

    evilSnake.startCoords = evilStartCoords;


    scene.evil = true;
    evilSnake.head.setTint(evilSnake.bodyColor);
    evilSnake.head.setDepth(50);
    evilSnake.head.alpha = 1;

    evilSnake.chevrons = new Map();

    var up = scene.add.sprite(evilSnake.head.getCenter().x, evilSnake.head.getCenter().y, 'evilSnakeChevron' , upInv
    ).setDepth(70);

    var down = scene.add.sprite(evilSnake.head.getCenter().x, evilSnake.head.getCenter().y, 'evilSnakeChevron' , downInv
    ).setDepth(70).toggleFlipY();

    var left = scene.add.sprite(evilSnake.head.getCenter().x, evilSnake.head.getCenter().y, 'evilSnakeChevron' , leftInv
    ).setDepth(70).toggleFlipY();
    left.angle = 90;

    var right = scene.add.sprite(evilSnake.head.getCenter().x, evilSnake.head.getCenter().y, 'evilSnakeChevron' , rightInv
    ).setDepth(70);
    right.angle = 90;

    evilSnake.updateChevrons = function (scene, toX, toY) {
        this.chevrons.forEach( (val,key) => {

                val.x = toX + GRID / 2;
                val.y = toY + GRID / 2;

                if (key === scene.snake.direction) {
                    val.setTint(COLOR_FOCUS_HEX);
                } else {
                    val.clearTint();
                }
            });
    }

    evilSnake.changeDir = function(scene) {
        let xN;
        let yN;

        switch (scene.snake.direction) {
            case DIRS.RIGHT:
                switch (this.chevrons.get(DIRS.RIGHT).frame.name) {
                    case EVIL_TRANSFORM.CLOCKWISE: // Clockwise Right
                        yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID)
                        xN = this.head.x;
                        break;
                    case EVIL_TRANSFORM.NORMAL: // Normal
                        yN = this.head.y;
                        xN = Phaser.Math.Wrap(this.head.x  + GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.INVERSE: // Inverted
                        yN = this.head.y;
                        xN = Phaser.Math.Wrap(this.head.x  - GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.COUNTER_CLOCKWISE: // Counter-clockwise Left
                        yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID)
                        xN = this.head.x;   

                        break;
                
                    default:
                        break;
                }
                

                break;

            case DIRS.LEFT:
                switch (this.chevrons.get(DIRS.LEFT).frame.name) {
                    case EVIL_TRANSFORM.CLOCKWISE: // Clockwise Right
                        yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID)
                        xN = this.head.x;
                        break;
                    case EVIL_TRANSFORM.NORMAL: // Normal
                        yN = this.head.y;
                        xN = Phaser.Math.Wrap(this.head.x - GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.INVERSE: // Inverted
                        yN = this.head.y;
                        xN = Phaser.Math.Wrap(this.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.COUNTER_CLOCKWISE: // Counter-clockwise Left
                        yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID)
                        xN = this.head.x;
                        break;
                
                    default:
                        break;
                }
                

                break;

            case DIRS.DOWN:
                switch (this.chevrons.get(DIRS.DOWN).frame.name) {
                    case EVIL_TRANSFORM.CLOCKWISE: // Clockwise Right
                        xN = Phaser.Math.Wrap(this.head.x - GRID, X_OFFSET, X_OFFSET + 29 * GRID)
                        yN = this.head.y;
                        break;
                    case EVIL_TRANSFORM.NORMAL: // Normal
                        xN = this.head.x;
                        yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.INVERSE: // Inverted
                        xN = this.head.x;
                        yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.COUNTER_CLOCKWISE: // Counter-clockwise Left
                        xN = Phaser.Math.Wrap(this.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID)
                        yN = this.head.y;

                        break;
                
                    default:
                        break;
                }
                

                break;

            case DIRS.UP:
                switch (this.chevrons.get(DIRS.UP).frame.name) {
                    case EVIL_TRANSFORM.CLOCKWISE: // Clockwise Right
                        xN = Phaser.Math.Wrap(this.head.x + GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                        yN = this.head.y
                        break;
                    case EVIL_TRANSFORM.NORMAL: // Normal
                        xN = this.head.x;
                        yN = Phaser.Math.Wrap(this.head.y - GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.INVERSE: // Inverted
                        xN = this.head.x;
                        yN = Phaser.Math.Wrap(this.head.y + GRID, Y_OFFSET, Y_OFFSET + 27 * GRID);
                       
                        break;
                    case EVIL_TRANSFORM.COUNTER_CLOCKWISE: // Counter-clockwise Left
                        xN = Phaser.Math.Wrap(this.head.x - GRID, X_OFFSET, X_OFFSET + 29 * GRID);
                        yN = this.head.y

                        break;
                
                    default:
                        break;
                }
                break;
                
            default:
                debugger;
                break;
        }

        return { x: xN, y: yN }
    }

    evilSnake.checkFood = function(scene) {
        if (scene.interactLayer[(this.head.x - X_OFFSET) / GRID][ (this.head.y - Y_OFFSET) / GRID
            ].constructor.name === "Food") {
                var _food = scene.interactLayer[
                    (this.head.x - X_OFFSET) / GRID]
                    [(this.head.y - Y_OFFSET) / GRID
                ].onOver(scene);
            } else {
            }

    }

    evilSnake.inversePortal = function(scene, portal, portalTime) {

        let toX;
        let toY;

        var dX = portal.x - portal.target.x;
        var dy = portal.y - portal.target.y;

        var xOffset = 0;
        var yOffset = 0;

        //**
        // *
        // * No idea why this makes the math work, but it makes it work.
        // * Otherwise the evil snake is off by one when portaling.
        //  */


        switch (scene.snake.direction) {
            case DIRS.LEFT:
                xOffset = GRID;
                
                break;
            case DIRS.RIGHT:
                xOffset = GRID * -1;
                break;

            case DIRS.UP:
                yOffset = GRID;
                break;

            case DIRS.DOWN:
                yOffset = GRID * -1;
                break;

            default:
                debugger
                break;
        }


        if (this.chevrons.get(DIRS.UP).frame.name === EVIL_TRANSFORM.CLOCKWISE) {
            toX = this.head.x - dy;
            toY = this.head.y - dX;
            
            xOffset = xOffset * 0;
            yOffset = yOffset * 0;
            
        } else if (this.chevrons.get(DIRS.UP).frame.name === EVIL_TRANSFORM.COUNTER_CLOCKWISE) {
            toX = this.head.x + dy;
            toY = this.head.y + dX;

            xOffset = xOffset * 0;
            yOffset = yOffset * 0;

        } else {
            if (this.chevrons.get(DIRS.RIGHT).frame.name === EVIL_TRANSFORM.INVERSE) {
                toX = this.head.x + dX;
            } else { 
                toX = this.head.x - dX;
                xOffset = xOffset * -1;
            }

            if (this.chevrons.get(DIRS.UP).frame.name === EVIL_TRANSFORM.INVERSE) {
                toY = this.head.y + dy;
            } else {
                toY = this.head.y - dy;
                yOffset = yOffset * -1;
            }

        }

        

        

        Phaser.Math.Wrap(toY + yOffset, Y_OFFSET, Y_OFFSET + 27 * GRID)
        Phaser.Math.Wrap(toX + xOffset, X_OFFSET, X_OFFSET + 29 * GRID)
    
        var _tween = scene.tweens.add({
            targets: this.body[0], 
            x: toX + xOffset,
            y: toY + yOffset,
            yoyo: false,
            duration: portalTime,
            ease: 'Linear',
            repeat: 0,
            //delay: 500
            onStart: function () {       
            }
        });
    }

    //var right = scene.add.sprite(scene.evilSnake.head.x, scene.evilSnake.head.y, 'evilSnakeChevron' , 2
    //).setDepth(70).setOrigin(0,0).toggleFlipY();

    evilSnake.chevrons.set(DIRS.UP, up);
    evilSnake.chevrons.set(DIRS.DOWN, down);
    evilSnake.chevrons.set(DIRS.LEFT, left);
    evilSnake.chevrons.set(DIRS.RIGHT, right);

    return evilSnake;

}

// Mirror Snake
STAGE_OVERRIDES.set("World_14-XY1", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 2, 2, 2, 2);

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-XY2", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 2, 2, 2, 2);

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});


STAGE_OVERRIDES.set("World_14-NY1", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.NORMAL, // UP
                EVIL_TRANSFORM.NORMAL, // DOWN
                EVIL_TRANSFORM.INVERSE, // LEFT
                EVIL_TRANSFORM.INVERSE  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-NY2", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.NORMAL, // UP
                EVIL_TRANSFORM.NORMAL, // DOWN
                EVIL_TRANSFORM.INVERSE, // LEFT
                EVIL_TRANSFORM.INVERSE  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-NX1", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.INVERSE, // UP
                EVIL_TRANSFORM.INVERSE, // DOWN
                EVIL_TRANSFORM.NORMAL, // LEFT
                EVIL_TRANSFORM.NORMAL  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-NX2", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.INVERSE, // UP
                EVIL_TRANSFORM.INVERSE, // DOWN
                EVIL_TRANSFORM.NORMAL, // LEFT
                EVIL_TRANSFORM.NORMAL  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-CR1", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.CLOCKWISE, // UP
                EVIL_TRANSFORM.CLOCKWISE, // DOWN
                EVIL_TRANSFORM.CLOCKWISE, // LEFT
                EVIL_TRANSFORM.CLOCKWISE  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-CR2", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.CLOCKWISE, // UP
                EVIL_TRANSFORM.CLOCKWISE, // DOWN
                EVIL_TRANSFORM.CLOCKWISE, // LEFT
                EVIL_TRANSFORM.CLOCKWISE  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-CR3", {
    w14_CL1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.evilAtoms = false;
            scene.stageConfig.evilCollision = true;
        },
        postFix: function (scene) {

            //var tiles = [];

            //var spawnTile = scene.map.findByIndex(10, 0, false, scene.wallVarient); // Evil Snake Head Index
            //tiles.push(spawnTile);
            scene.evilSnakes = [];

            var evilTiles = scene.map.filterTiles( tile => {
                if (tile.index === 10)  {
                    return true;
                } else {
                    return false;
                }
            });


            evilTiles.forEach( spawnTile => {
                var evilStartCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};

                spawnTile.index = -1;

                scene.evilSnakes.push(
                    evilSnake(scene, 
                    EVIL_TRANSFORM.CLOCKWISE, // UP
                    EVIL_TRANSFORM.CLOCKWISE, // DOWN
                    EVIL_TRANSFORM.CLOCKWISE, // LEFT
                    EVIL_TRANSFORM.CLOCKWISE,  // RIGHT
                    evilStartCoords
                ));
            });



            scene.atoms.forEach( atom => {
                //atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {

            scene.evilSnakes.forEach( snake => {
                snake.grow(scene);
                snake.body[snake.body.length - 1].setTint(0x66666);
            });
            
        },
        afterMove: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var nextVec = evilSnake.changeDir(scene);
                
                if (scene.stageConfig.evilAtoms) {
                    evilSnake.checkFood(scene); 
                }

                if (scene.stageConfig.evilCollision) {
                    var hitCheck = evilSnake.body.some( part => {
                        if (scene.snake.head.x === part.x && scene.snake.head.y === part.y) {
                            
                            return true
                        }
                    });

                    if (hitCheck) {
                        scene.snake.bonk(scene);
                        
                    } else {
                        Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                    }


                } else {
                    Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                }

                evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 

            });

            

            

            

            
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnakes.forEach( evilSnake => {
                evilSnake.inversePortal(scene, portal, portalTime);
            });
        },
        beforeBonk: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var evilRespawn = scene.vortexIn(
                evilSnake.body, 
                evilSnake.startCoords.x, 
                evilSnake.startCoords.y, 
                500
                );
            });
        },
    }
});

STAGE_OVERRIDES.set("World_14-CR4", {
    w14_CL1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.evilAtoms = false;
            scene.stageConfig.evilCollision = true;
        },
        postFix: function (scene) {

            //var tiles = [];

            //var spawnTile = scene.map.findByIndex(10, 0, false, scene.wallVarient); // Evil Snake Head Index
            //tiles.push(spawnTile);
            scene.evilSnakes = [];

            var evilTiles = scene.map.filterTiles( tile => {
                if (tile.index === 10)  {
                    return true;
                } else {
                    return false;
                }
            });


            evilTiles.forEach( spawnTile => {
                var evilStartCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};

                spawnTile.index = -1;

                scene.evilSnakes.push(
                    evilSnake(scene, 
                    EVIL_TRANSFORM.CLOCKWISE, // UP
                    EVIL_TRANSFORM.CLOCKWISE, // DOWN
                    EVIL_TRANSFORM.CLOCKWISE, // LEFT
                    EVIL_TRANSFORM.CLOCKWISE,  // RIGHT
                    evilStartCoords, 0xe71010
                ));
            });



            scene.atoms.forEach( atom => {
                //atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {

            scene.evilSnakes.forEach( snake => {
                snake.grow(scene);
                snake.body[snake.body.length - 1].setTint(snake.bodyColor);
            });
            
        },
        afterMove: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var nextVec = evilSnake.changeDir(scene);
                
                if (scene.stageConfig.evilAtoms) {
                    evilSnake.checkFood(scene); 
                }

                if (scene.stageConfig.evilCollision) {
                    var hitCheck = evilSnake.body.some( part => {
                        if (scene.snake.head.x === part.x && scene.snake.head.y === part.y) {
                            
                            return true
                        }
                    });

                    if (hitCheck) {
                        scene.snake.bonk(scene);
                        
                    } else {
                        Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                    }


                } else {
                    Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                }

                evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 

            });

            

            

            

            
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnakes.forEach( evilSnake => {
                evilSnake.inversePortal(scene, portal, portalTime);
            });
        },
        beforeBonk: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var evilRespawn = scene.vortexIn(
                evilSnake.body, 
                evilSnake.startCoords.x, 
                evilSnake.startCoords.y, 
                500
                );
            });
        },
    }
});

STAGE_OVERRIDES.set("World_14-CL1", {
    w14_CL1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // UP
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // DOWN
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // LEFT
                EVIL_TRANSFORM.COUNTER_CLOCKWISE  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-CL2", {
    w14_CL1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = false;
            scene.stageConfig.evilCollision = true;
        },
        postFix: function (scene) {

            var spawnTile = scene.map.findByIndex(10, 0, false, scene.wallVarient); // Evil Snake Head Index
            var evilStartCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};

            spawnTile.index = -1;

            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // UP
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // DOWN
                EVIL_TRANSFORM.COUNTER_CLOCKWISE, // LEFT
                EVIL_TRANSFORM.COUNTER_CLOCKWISE,  // RIGHT
                evilStartCoords
            );

            scene.atoms.forEach( atom => {
                //atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            if (scene.stageConfig.evilAtoms) {
                scene.evilSnake.checkFood(scene); 
            }

            if (scene.stageConfig.evilCollision) {
                var hitCheck = scene.evilSnake.body.some( part => {
                    if (scene.snake.head.x === part.x && scene.snake.head.y === part.y) {
                        
                        return true
                    }
                });

                if (hitCheck) {
                    scene.snake.bonk(scene);
                    
                } else {
                    Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);
                }


            } else {
                Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);
            }

            

            

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-1", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.NORMAL, // UP
                EVIL_TRANSFORM.NORMAL, // DOWN
                EVIL_TRANSFORM.NORMAL, // LEFT
                EVIL_TRANSFORM.NORMAL  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-2", {
    14_1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
            scene.stageConfig.evilAtoms = true;
        },
        postFix: function (scene) {
            scene.evilSnake = evilSnake(scene, 
                EVIL_TRANSFORM.NORMAL, // UP
                EVIL_TRANSFORM.NORMAL, // DOWN
                EVIL_TRANSFORM.NORMAL, // LEFT
                EVIL_TRANSFORM.NORMAL  // RIGHT
            );

            scene.atoms.forEach( atom => {
                atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {
            scene.evilSnake.grow(scene);
            scene.evilSnake.body[scene.evilSnake.body.length - 1].setTint(0x66666);

        },
        afterMove: function(scene) {

            var nextVec = scene.evilSnake.changeDir(scene);

            scene.evilSnake.checkFood(scene); 

            Phaser.Actions.ShiftPosition(scene.evilSnake.body, nextVec.x, nextVec.y, scene.evilSnake.tail);

            scene.evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnake.inversePortal(scene, portal, portalTime);
        },
        beforeBonk: function(scene) {

            var evilRespawn = scene.vortexIn(
                scene.evilSnake.body, 
                scene.evilSnake.startCoords.x, 
                scene.evilSnake.startCoords.y, 
                500
            );
        },
    }
});

STAGE_OVERRIDES.set("World_14-3", {
    w14_CL1: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.evilAtoms = false;
            scene.stageConfig.evilCollision = true;
        },
        postFix: function (scene) {

            //var tiles = [];

            //var spawnTile = scene.map.findByIndex(10, 0, false, scene.wallVarient); // Evil Snake Head Index
            //tiles.push(spawnTile);
            scene.evilSnakes = [];

            var evilTiles = scene.map.filterTiles( tile => {
                if (tile.index === 10)  {
                    return true;
                } else {
                    return false;
                }
            });


            evilTiles.forEach( spawnTile => {
                var evilStartCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};

                spawnTile.index = -1;

                scene.evilSnakes.push(
                    evilSnake(scene, 
                    EVIL_TRANSFORM.NORMAL, // UP
                    EVIL_TRANSFORM.NORMAL, // DOWN
                    EVIL_TRANSFORM.INVERSE, // LEFT
                    EVIL_TRANSFORM.INVERSE,  // RIGHT
                    evilStartCoords, 0xe71010
                ));
            });



            scene.atoms.forEach( atom => {
                //atom.setTint(0x66666);

            });
    
        },
        afterEat: function (scene) {

            scene.evilSnakes.forEach( snake => {
                snake.grow(scene);
                snake.body[snake.body.length - 1].setTint(snake.bodyColor);
            });
            
        },
        afterMove: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var nextVec = evilSnake.changeDir(scene);
                
                if (scene.stageConfig.evilAtoms) {
                    evilSnake.checkFood(scene); 
                }

                if (scene.stageConfig.evilCollision) {
                    var hitCheck = evilSnake.body.some( part => {
                        if (scene.snake.head.x === part.x && scene.snake.head.y === part.y) {
                            
                            return true
                        }
                    });

                    if (hitCheck) {
                        scene.snake.bonk(scene);
                        
                    } else {
                        Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                    }


                } else {
                    Phaser.Actions.ShiftPosition(evilSnake.body, nextVec.x, nextVec.y, evilSnake.tail);
                }

                evilSnake.updateChevrons(scene, nextVec.x, nextVec.y); 

            });

            

            

            

            
        },
        onPortal: function (scene, portal, portalTime) {

            scene.evilSnakes.forEach( evilSnake => {
                evilSnake.inversePortal(scene, portal, portalTime);
            });
        },
        beforeBonk: function(scene) {

            scene.evilSnakes.forEach( evilSnake => {
                var evilRespawn = scene.vortexIn(
                evilSnake.body, 
                evilSnake.startCoords.x, 
                evilSnake.startCoords.y, 
                500
                );
            });
        },
    }
});



// Laser Wall  Don't need this anymore.
STAGE_OVERRIDES.set("Bonus_X-12", {
    X_12: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = Infinity;
            scene.stageConfig.laserWallX = -1;
            scene.stageConfig.laserWalls = [];
            scene.stageConfig.laserSpeed = 12;
            scene.stageConfig.laserLastTime = 1;

            //scene.stageConfig.tickCount = 1;
            
            
        },
        postFix: function (scene) {
            //scene.snake.grow(scene);
        
            scene.moveWall = this.moveWall;
        },
        afterTick: function (scene) {
            scene.stageConfig.laserTickCount++;

            if (scene.timeTickCount - scene.stageConfig.laserLastTime > scene.stageConfig.laserSpeed) {
                scene.stageConfig.laserLastTime = scene.timeTickCount;
                console.log("moved", scene.timeTickCount);

                scene.moveWall();

                console.log("Wall will move every", scene.stageConfig.wallSpeed,"Wall move count = ",  scene.stageConfig.wallMovedCount);
            }

        },
        afterMove: function(scene) {
            if (scene.stageConfig.laserWallX * GRID + X_OFFSET === scene.snake.head.x) {
                scene.snake.bonk(scene);
            }
            
        },
        checkWinCon: function () {
            if (scene.snake.body.length < 2) {
                this.moveWall = undefined;
                this.events.emit("win");
            }
            return
            //return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR;
        
        },
    }
});

STAGE_OVERRIDES.set("Tutorial_T-1", {
    T_1: null,
    methods: {
        preFix: function (scene) {
            
            scene.mode = MODES.TUTORIAL;
            scene.stageConfig.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {
            
            // Override checkWinCon()
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 7) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y, 500);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {
                        debugger

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["walls","screenwrap"],
                            toStage: "Tutorial_T-2",
                        });
                    });

                });
            }
        }  
    }
});

STAGE_OVERRIDES.set("Tutorial_T-2", {
    T_2: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.stageConfig.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {
            
            let counter = 7;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 14) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y, 500);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["portals"],
                            toStage: "Tutorial_T-3",
                        });
                    });

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-3", {
    T_3: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.stageConfig.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {

            let counter = 14;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }
        
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 21) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y, 500);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["coins"],
                            toStage: "Tutorial_T-4",
                        });
                    });

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-4", {
    T_4: null,
    methods: {
        preFix: function (scene) {
            scene.mode = MODES.TUTORIAL;
            scene.scene.get('PersistScene').coins = 20
        },
        postFix: function (scene) {

            let counter = 21;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }
            
            // Override checkWinCon()
            scene.checkWinCon = this.checkWinCon;        
        },
        checkWinCon: function () {
            if (this.length >= 28) {
                    
                this.winned = true;
                this.gState = GState.TRANSITION;
                this.snake.direction = DIRS.STOP;

                var vTween = this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y, 500);

                vTween.on("complete", () => {
                    this.time.delayedCall(200, () => {

                        debugger
                        this.gameSceneFullCleanup();

                        this.scene.start('TutorialScene', {
                            cards: ["blackholes"],
                            toStage: "Tutorial_T-5",
                        });
                    }, this);

                });
            }
        } 
    }
});

STAGE_OVERRIDES.set("Tutorial_T-5", {
    T_5: null,
    methods: {
        preFix: function (scene) {
            scene.mode = MODES.TUTORIAL;
        },
        postFix: function (scene) {

            scene.winned = true;
            scene.events.emit('spawnBlackholes', scene.snake.direction);

            let counter = 28; //28
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }
 
        },
    }
});

STAGE_OVERRIDES.set("Tutorial_T-6", {
    T_6: null,
    methods: {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20

            //window.location.reload();

            //temporary solution for resetting the game -- doesn't preserve object permanence
            //window.location.reload();

        },
        postFix: function (scene) {
            scene.gameSceneFullCleanup();
            scene.scene.start('MainMenuScene');
        }
    }
});

STAGE_OVERRIDES.set("World_4-1", {
    4_1: null,
    methods: {
        preFix: function (scene) {
            scene.startEWraps = PLAYER_STATS.eWraps;
            scene.startWWraps = PLAYER_STATS.wWraps;
            scene.stageConfig.delta = 0;
            scene.stageConfig.deltaCache = 0;

            scene.secretPortal = undefined;

        },
        postFix: function (scene) {
            scene.events.once('secret', function (tile){
                scene.secretPortal = scene.add.sprite(tile.pixelX + X_OFFSET + GRID * 3.5, tile.pixelY + Y_OFFSET + GRID * 0.5);
                scene.secretPortal.play('blackholeForm');

                scene.tweens.addCounter({
                    from: 0,
                    to: 360,
                    duration: 3000,
                    loop: -1,
                    onUpdate: (tween) => {
                        let hueValue = tween.getValue();
                        
                        // Add an offset to the hue for each segment
                        let partHueValue = (hueValue * 12.41) % 360;
            
                        // Reduce saturation and increase lightness
                        let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
            
                        if (color) {// only update color when it's not null
                            scene.secretPortal.setTint(color.color);
                        }
                        
                    }
                });

    
                console.log("SPAWNING SECRET BLACKHOLE");
                //scene.nextStagePortals.pop(scene.secretPortal);
                //scene.interactLayer[tile.x][tile.y] = scene.secretPortal
            }, scene)


        },
        afterMove: function (scene) {
            var currentEWraps = PLAYER_STATS.eWraps - scene.startEWraps;
            var currentWWraps = PLAYER_STATS.wWraps - scene.startWWraps;

            scene.stageConfig.delta = currentWWraps - currentEWraps;
            if (scene.stageConfig.delta < 1) {
                scene.stageConfig.delta = 0;
            } 

            if (scene.wallVarient === "Wall_2" && scene.stageConfig.delta != scene.stageConfig.deltaCache) {

                var tile = scene.wallLayer.getTileAt(16, 12);


                if (scene.stageConfig.delta > 1) {
                    scene.events.emit("secret", tile);
                }
                // add in code here to tint based on the delta size.
                tile.tint = 0xFF0000;
                scene.stageConfig.deltaCache = scene.stageConfig.delta;
            }
  
        }
    }
});
STAGE_OVERRIDES.set("World_5-1_Racing", {
    8_1: null,
    methods: {
        preFix: function (scene) {
            scene.tem = {};
            scene.tem.racingTimerStart = 90;
            scene.tem.racingTimer = scene.tem.racingTimerStart;

            
        },
        postFix: function (scene) {

        scene.tem.countText = scene.add.dom(390, 243, 'div', Object.assign({}, STYLE_DEFAULT, {
            'color': '#FF2222',
            'text-shadow': '0 0 4px #FF9405, 0 0 8px #FF2222',
            'font-size': '22px',
            'font-weight': '400',
            'font-family': 'Oxanium',
            'padding': '2px 7px 0px 0px',
            })).setHTML(
                scene.tem.racingTimer.toString().padStart(3,"0")
        ).setOrigin(1,0).setScale(.5);
        scene.tem.countText.setScrollFactor(0);
        scene.tem.countText.name = "racingTimer";
            
        },
        afterTick: function (scene) {
            scene.tem.racingTimer--;
            scene.tem.countText.setHTML(scene.tem.racingTimer.toString().padStart(3,"0"));

            if (scene.tem.racingTimer < 1) {

                var cutOff = scene.snake.body.splice(Math.floor(scene.snake.body.length / 2), scene.snake.body.length + 1);
                
                scene.scoreHistory.splice(cutOff.length, scene.scoreHistory.length + 1);

                SPACE_BOY.lengthGoalUI.setText(scene.scoreHistory.length);

                scene.snake.bonk(scene);
                scene.tem.racingTimer = scene.tem.racingTimerStart;

                scene.tweens.add({
                    targets: cutOff,
                    alpha: 0,
                    duration: 5000,
                    ease: 'Sine.Out',
                    onComplete: (tween, targets) => {
                        targets.forEach( part => {
                            part.destroy();
                        })
                    }
                });
            }
            
        },
    }
});

STAGE_OVERRIDES.set("World_8-1_Adv_Portaling", {
    8_1: null,
    methods: {
        preFix: function (scene) {
            // Secret Portal Reset in Init
        },
        postFix: function (scene) {
            scene.events.once('secret', function (tile){
                scene.secretPortal = scene.add.sprite(tile.pixelX + X_OFFSET + GRID * 3.5, tile.pixelY + Y_OFFSET + GRID * 0.5);
                scene.secretPortal.play('blackholeForm');

                scene.tweens.addCounter({
                    from: 0,
                    to: 360,
                    duration: 3000,
                    loop: -1,
                    onUpdate: (tween) => {
                        let hueValue = tween.getValue();
                        
                        // Add an offset to the hue for each segment
                        let partHueValue = (hueValue * 12.41) % 360;
            
                        // Reduce saturation and increase lightness
                        let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
            
                        if (color) {// only update color when it's not null
                            scene.secretPortal.setTint(color.color);
                        }
                        
                    }
                });

    
                console.log("SPAWNING SECRET BLACKHOLE");
                //scene.nextStagePortals.pop(scene.secretPortal);
                //scene.interactLayer[tile.x][tile.y] = scene.secretPortal
            }, scene)


        },
    }
});

STAGE_OVERRIDES.set("World_0-1", {
    zero_1: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
            if (scene.mode === MODES.CLASSIC && INVENTORY_DATA.get("classicCardBank") > 0) {
                var coinTime = 250;

                scene.time.delayedCall(1250, () => {
                    for (let index = 1; index <= INVENTORY_DATA.get("classicCardBank"); index++) {
                        scene.time.delayedCall(coinTime * index, () => {
                            PERSISTS.coins += 1;
                            console.log('adding classicCardCoin +1');
                            scene.coinSound.play();
                            scene.coinUIText.setHTML(`${commaInt(PERSISTS.coins).padStart(2, '0')}`);

                            INVENTORY_DATA.set("classicCardBank", INVENTORY_DATA.get("classicCardBank") - 1);
                            localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));

                            SPACE_BOY.invItems.get("classicCard").invText.setText(INVENTORY_DATA.get("classicCardBank"));

                            if (INVENTORY_DATA.get("classicCardBank") === 0) {
                                SPACE_BOY.invItems.get("classicCard").invText.setText("");
                            }

                        }, scene);
                    }
                }, scene);  
            } 
        },
        beforeScoreScreen: function (scene) {
            scene.collapsePortals();
        }
    }
});

STAGE_OVERRIDES.set("World_1-3", {
    1_3: null,
    methods: {
        preFix: function (scene) {
        },
        postFix: function (scene) {
        },
    }
});

// #region Gauntlet Levels

STAGE_OVERRIDES.set("Gauntlet_1-1", {
    1_3: null,
    methods: {
        preFix: function (scene) {
            scene.lengthGoal = 28 * 1;
        },
        postFix: function (scene) {
            scene.growN(28 * 0);
        },
    }
});

STAGE_OVERRIDES.set("Gauntlet_1-2", {
    1_3: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 2;
        },
        postFix: function (scene) {
            scene.growN(28 * 1);
        },
    }
});

STAGE_OVERRIDES.set("Gauntlet_1-3", {
    1_3: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 3;
        },
        postFix: function (scene) {
            scene.growN(28 * 2);
        },
    }
});

STAGE_OVERRIDES.set("Gauntlet_1-4", {
    1_3: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 4;
        },
        postFix: function (scene) {
            scene.growN(28 * 3);
        },
    }
});

STAGE_OVERRIDES.set("Gauntlet_1-5", {
    1_3: null,
    methods: {
        preFix: function (scene) {
            scene.stageConfig.lengthGoal = 28 * 5;
        },
        postFix: function (scene) {
            scene.growN(28 * 4);
        },
    }
});