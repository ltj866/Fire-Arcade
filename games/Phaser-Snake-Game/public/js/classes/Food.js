import {DEBUG, END_X, END_Y, SCREEN_WIDTH, GRID, SCREEN_HEIGHT, X_OFFSET, Y_OFFSET, 
    COMBO_ADD_FLOOR, SPEED_WALK, SPEED_SPRINT, GState, PLAYER_STATS, MODES,
    PERSISTS, SPACE_BOY, INPUT,
    SOUND_RANK} from "../SnakeHole.js";
import { STAGE_OVERRIDES } from '../data/customLevels.js';

var Food = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Food (scene, pos) {
        Phaser.GameObjects.Sprite.call(this, scene);

        this.setOrigin(0,0);
        this.setDepth(47);
        this.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);

        this.play("atom05spawn");
        this.chain(['atom01idle']);

        this.respawnTimer = 0; // Tenths of seconds
        
        this.electrons = scene.add.sprite().setOrigin(.22,.175).setDepth(48);
        this.electrons.playAfterDelay("electronIdle", Phaser.Math.RND.integerInRange(0,30) * 10);
        this.electrons.anims.msPerFrame = 66;
        this.electrons.visible = false;

        this.setPosition(pos.x, pos.y ); 
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, INPUT.moveCount]);
        
        this.electrons.setPosition(pos.x, pos.y);
        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = this;

        scene.atoms.add(this);

        scene.children.add(this); // Shows on screen
    },

    onOver: function(scene) {
        if (this.visible) {
            scene.snakeEatingTween = scene.tweens.add({
                targets: scene.snake.body, 
                scale: [1.25,1],
                yoyo: false,
                duration: 64,
                ease: 'Linear',
                repeat: 0,
                delay: scene.tweens.stagger(scene.speedSprint),
            });
            
            var timeSinceFruit = scene.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            
            scene.scoreTimer.paused = true;

            // #region Combo
            if(timeSinceFruit > COMBO_ADD_FLOOR && scene.scoreHistory.length > 0){

                scene.snake.comboCounter++;
                scene.scene.get("PinballDisplayScene").comboCountText.setText(scene.snake.comboCounter);
                
                if (scene.snake.lastPlayedCombo > 0) {
                    scene.scene.get("PinballDisplayScene").comboBounce();
                };

                scene.pointSounds[scene.snake.lastPlayedCombo].play();
                
                if (scene.snake.lastPlayedCombo < 7) {
                    scene.snake.lastPlayedCombo += 1;
                }  
            }

            // #region OverEat
            if (scene.snake.body.length > 28) {
                    PLAYER_STATS.atomsOverEaten += 1;
                    if (scene.snake.body.length - 1 > PLAYER_STATS.longestBody) {
                        PLAYER_STATS.longestBody = scene.snake.body.length - 1;
                    }
            }

            this.visible = false;
            this.move(scene);


            // #region Last Atom
            if (scene.length != scene.gameSettings.lengthGoal -1) { 
                // Normal Case 
                if (!scene.winned) {
                    scene.events.emit('addScore', this, timeSinceFruit); 
                }

                scene.snake.grow(scene);
                // Avoid double _atom getting while in transition
                scene.playAtomSound();
            } else {
                // Last Atom!
                scene.winned = true;
                scene.gState = GState.TRANSITION;

                var _x = this.prevX;
                var _y = this.prevY;

                var finalAtomCopy = scene.add.sprite(_x, _y).setOrigin(0,0);
                finalAtomCopy.play("atom02idle", this.frame.name); // Needs to select the correct frame
                finalAtomCopy.setDepth(45); 

                var tempSounds = [];

                // Placeholder winning sounds. Should be its own sound. or music?
                SOUND_RANK.forEach(soundID => {
                    tempSounds.push(scene.sound.add(soundID[0]));
                });
                tempSounds[4].play();
                

                var finalFare = false;
                        
                switch (true) {
                    case scene.mode === MODES.CLASSIC || scene.mode === MODES.EXPERT:
                        if (scene.nextStagePortalLayer.findByIndex(616)){
                            finalFare = true;
                        }
                        break;
                    case scene.mode === MODES.GAUNTLET:
                        if (PERSISTS.gauntlet.length === 0) {
                            finalFare = true;
                        }
                        break;
                    case scene.mode === MODES.PRACTICE:
                        finalFare = false;
                        break;
                
                    default:
                        debugger // Saftey Break. Don't remove.
                        break;
                }

                

                if (!finalFare) {
                    // Normal Fan

                    /* Brightness Tween *shrug* not great
                    const brightness = scene.snake.head.preFX.addColorMatrix().brightness(2);
                    brightness.active = true;

                    scene.add.tween({
                        targets: brightness,
                        alpha: { from: 0, to: 1 },
                        yoyo: true, 
                        duration: 350, 
                        ease: 'Linear', 
                        repeat: -1,
                        onStart: () => {
                        //brightness.active = true;
                        },
                        onComplete: () => {
                        //brightness.active = false;
                        }
                    });
                    */
                    scene.snake.head.x = scene.snake.previous[0];
                    scene.snake.head.y = scene.snake.previous[1];

                    scene.tweens.add({
                        targets: scene.snake.head,
                        x: {from: scene.snake.previous[0], to:_x },
                        y: { from: scene.snake.previous[1], to:_y },
                        duration: 240,
                        delay: 600,
                        ease:'Expo.easeIn', // 'Expo.easeIn' 'Back.easeIn'
                        onComplete: () =>{

                            
                            const ourStartScene = scene.scene.get('StartScene');
                            
                            scene.events.emit('addScore', this, timeSinceFruit);
                            
                            this.electrons.visible = false;

                            var vortexTween = scene.vortexIn(scene.snake.body, _x, _y, 750, 'Back.easeIn'); // 'Back.easeIn' 'Expo.easeInOut'

                            vortexTween.on('complete', () => {

                                scene.hidePortals(120);
                            
                                scene.time.delayedCall(1, () => {

                                    //scene.playAtomSound();
                                    scene.snake.grow(scene);
                                    finalAtomCopy.destroy();
                                    scene.events.emit('win');
                                
                                    // Store speed values
                                    let _walkSpeed = scene.gameSettings.speedWalk;
                                    let _sprintSpeed = scene.gameSettings.speedSprint;
                            
                                    // Store initial camera position
                                    let initialCameraX = scene.cameras.main.scrollX;
                                    let initialCameraY = scene.cameras.main.scrollY
                            
                                    // Start slowMoValCopy at 1 (default time scale). It's copied to preserve its value outside the tween
                                    var slowMoValCopy = 1;

                                    // this is happening after the score screen is up and needs to be moved earlier. @holden

                                    scene.slowMoTween = scene.tweens.add({
                                        targets: { value: 1 },
                                        value: 0.2,
                                        duration: 500,
                                        delay:500,
                                        yoyo: true,
                                        ease: 'Sine.easeInOut',
                                        repeat: 0,
                                        onUpdate: (tween) => {
                                            let slowMoValue = tween.getValue();
                                            slowMoValCopy = slowMoValue;
                    
                                            // Apply the interpolated slowMoValue to all the timeScales
                                            scene.tweens.timeScale = slowMoValue;
                                            scene.anims.globalTimeScale = slowMoValue;
                                            scene.gameSettings.speedWalk = _walkSpeed  / slowMoValue;
                                            scene.gameSettings.speedSprint = _sprintSpeed / slowMoValue;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = slowMoValue;
                                            }
                                        },
                                        onComplete: () => {
                                            console.log('Slow motion effect completed');
                                            scene.tweens.timeScale = 1;
                                            scene.anims.globalTimeScale = 1;
                                            scene.gameSettings.speedWalk = _walkSpeed;
                                            scene.gameSettings.speedSprint = _sprintSpeed;
                                            if (scene.starEmitterFinal) {
                                                scene.starEmitterFinal.timeScale = 1;
                                            }
                                        }
                                    });
                                
                                    // #region Final Fare
                                    // Slow Motion Tween -- slows down all tweens and anim timeScales withing scene
                                    scene.snake.criticalStateTween.pause(); // stop flashing red if it exists
                                    console.log('should rainbow right now fr')
                                    scene.slowMoTween = scene.tweens.add({
                                        targets: { value: 1 },
                                        value: 0.2,
                                        duration: 500,
                                        yoyo: true,
                                        ease: 'Sine.easeInOut',
                                        repeat: 0,
                                            onUpdate: (tween) => {
                                                // Camera Restraints/Bounds -- isn't needed if not zooming
                                                //scene.cameras.main.setBounds(0, 0, 240, 320);
                                                //SPACE_BOY.cameras.main.setBounds(0, 0, 240, 320);
                                                //PERSISTS.cameras.main.setBounds(0, 0, 240, 320);
                        
                                                let slowMoValue = tween.getValue();
                                                slowMoValCopy = slowMoValue;
                        
                                                // Apply the interpolated slowMoValue to all the timeScales
                                                scene.tweens.timeScale = slowMoValue;
                                                scene.anims.globalTimeScale = slowMoValue;
                                                scene.gameSettings.speedWalk = _walkSpeed  / slowMoValue;
                                                scene.gameSettings.speedSprint = _sprintSpeed / slowMoValue;
                                                if (scene.starEmitterFinal) {
                                                    scene.starEmitterFinal.timeScale = slowMoValue;
                                                }
                                                // Camera Zoom
                                                //scene.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                                //SPACE_BOY.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                                //PERSISTS.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                                                
                                                // Continuously interpolate the camera's position to the snake's head -- not needed
                                                //let targetX = scene.snake.head.x - scene.cameras.main.width / 2;
                                                //let targetY = scene.snake.head.y - scene.cameras.main.height / 2;
                        
                                                /*if (slowMoValue <= 0.5) {
                                                    scene.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                    scene.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                        
                                                    SPACE_BOY.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                    SPACE_BOY.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                        
                                                    PERSISTS.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, scene.electronFanfare.x - scene.cameras.main.width / 2, 1);
                                                    PERSISTS.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, scene.electronFanfare.y - scene.cameras.main.height / 2, 1);
                                                } 
                                                else {
                                                    scene.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                    scene.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                        
                                                    SPACE_BOY.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                    SPACE_BOY.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                                                    
                                                    PERSISTS.cameras.main.scrollX = Phaser.Math.Linear(scene.cameras.main.scrollX, 0, 0.01);
                                                    PERSISTS.cameras.main.scrollY = Phaser.Math.Linear(scene.cameras.main.scrollY, 0, 0.01);
                                                }*/
                                            // Set scrollFactor to 1 for all game objects if using zoom-in
                                                // Get all game objects in the scene
                                                /*scene.children.list.forEach((child) => {
                                                    // Check if the child object has a scroll factor property set to 0
                                                    if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
                                                        child.setScrollFactor(1);
                                                        scene.UIScoreContainer.setScrollFactor(1);
                                                        }
                                                    });
                                                    // Iterate over each child in the container and set the scroll factor to 1
                                                    scene.UIScoreContainer.each((child) => {
                                                        child.setScrollFactor(1);
                                                });*/
                                            },
                                            onComplete: () => {
                                                console.log('Slow motion effect completed');
                                                
                                                scene.tweens.timeScale = 1;
                                                scene.anims.globalTimeScale = 1;
                                                scene.gameSettings.speedWalk = _walkSpeed;
                                                scene.gameSettings.speedSprint = _sprintSpeed;
                                                if (scene.starEmitterFinal) {
                                                    scene.starEmitterFinal.timeScale = 1;
                                                }
                                                
                                                scene.hsv = Phaser.Display.Color.HSVColorWheel();
                                                const spectrum = Phaser.Display.Color.ColorSpectrum(360);
                                                var colorIndex = 0;
                                                var color = spectrum[colorIndex];
                        
                                                scene.fxBoost = scene.boostBar.preFX.addColorMatrix();

                                                // #region Rainbow
                        
                                                /*
                                                scene.tweens.addCounter({
                                                    from: 0,
                                                    to: 360,
                                                    duration: 3000,
                                                    loop: -1,
                                                    onUpdate: (tween) => {
                                                        let hueValue = tween.getValue();
                                                        scene.fxBoost.hue(hueValue);
                                                
                                                        // Update each segment's tint with an offset and apply pastel effect
                                                        scene.snake.body.forEach((part, index) => {
                                                            // Add an offset to the hue for each segment
                                                            let partHueValue = (hueValue + index * 12.41) % 360;
                                                
                                                            // Reduce saturation and increase lightness
                                                            let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
                                                
                                                            if (color) {// only update color when it's not null
                                                                part.setTint(color.color);
                                                            }
                                                        });
                                                    }
                                                });
                                                
                        
                                                /*scene.cameras.main.scrollX = 0;
                                                scene.cameras.main.scrollY = 0;
                        
                                                SPACE_BOY.cameras.main.scrollX = 0;
                                                SPACE_BOY.cameras.main.scrollY = 0;
                        
                                                PERSISTS.cameras.main.scrollX = 0;
                                                PERSISTS.cameras.main.scrollY = 0;*/
                                                SPACE_BOY.CapSparkFinale = SPACE_BOY.add.sprite(X_OFFSET + GRID * 9 -3, GRID * 1.5).play(`CapSparkFinale`).setOrigin(.5,.5)
                                                .setDepth(100);
                                        }
                                    });
                        
                                    // check for extractHole so it doesn't fanfare in gauntlet and other modes
                                    if (scene.extractHole) {
                                        // atomic comet
                                        SPACE_BOY.atomComet = SPACE_BOY.add.sprite(scene.snake.head.x + 6,scene.snake.head.y + 6)
                                        .setDepth(100);
                                        SPACE_BOY.atomComet.play('atomCometSpawn');
                                        SPACE_BOY.atomComet.chain(['atomCometIdle']);
                        
                        
                                        // rainbow electronFanfare
                                        SPACE_BOY.electronFanfare = SPACE_BOY.add.sprite(scene.snake.head.x + 6,scene.snake.head.y + 6)
                                        .setDepth(100);
                                        SPACE_BOY.electronFanfare.play('electronFanfareForm');

                                        // Atomic Comet and Electron Fanfare Tween
                                    
                                        SPACE_BOY.electronFanfare.on('animationcomplete', (animation, frame) => {
                                            if (animation.key === 'electronFanfareForm') {
                                                scene.tweens.add({
                                                    targets: [SPACE_BOY.electronFanfare,SPACE_BOY.atomComet],
                                                    x: SPACE_BOY.scoreFrame.getCenter().x -6,
                                                    y: SPACE_BOY.scoreFrame.getCenter().y,
                                                    ease: 'Sine.easeIn',
                                                    duration: 1250,
                                                    onComplete: () => {
                                                        scene.countDownTimer.setAlpha(1);
                                                        scene.countDownTimer.x = X_OFFSET + GRID * 4 - 6;
                                                        scene.countDownTimer.y = 3;
                                                        SPACE_BOY.atomComet.destroy();
                                                    }
                                                });
                                                        scene.countDownTimer.setHTML('W1N');
                                                        scene.countDownTimer.x += 3
                                                }
                                                
                                        });
                            
                                        SPACE_BOY.electronFanfare.chain(['electronFanfareIdle']);
                                        }
                                    
                            
                                        /*this.starEmitter = this.add.particles(X_OFFSET, Y_OFFSET, "starIdle", { 
                                            x:{min: 0, max: SCREEN_WIDTH},
                                            y:{min: 0, max: SCREEN_HEIGHT},
                                            alpha: { start: 1, end: 0 },
                                            gravityX: -50,
                                            gravityY: 50,
                                            anim: 'starIdle',
                                            lifespan: 3000,
                                        }).setFrequency(300,[1]).setDepth(1);
                                
                                        // check if stage next is empty -- means it's the final extraction point
                                
                                        this.starEmitterFinal = this.add.particles(6,6,"starIdle", { 
                                            speed: { min: -20, max: 20 },
                                            angle: { min: 0, max: 360 },
                                            alpha: { start: 1, end: 0 },
                                            anim: 'starIdle',
                                            lifespan: 1000,
                                            follow:this.snake.head,
                                        }).setFrequency(150,[1]).setDepth(1);*/
                                        
                        
                                        // emit stars from electronFanfare
                                        scene.starEmitterFinal = scene.add.particles(6,6,"twinkle01", { 
                                            speed: { min: -20, max: 20 },
                                            angle: { min: 0, max: 360 },
                                            alpha: { start: 1, end: 0 },
                                            anim: 'starIdle',
                                            lifespan: 1000,
                                            follow: SPACE_BOY.electronFanfare,
                                        }).setFrequency(150,[1]).setDepth(1);
                        
                                        scene.countDownTimer.setAlpha(0);
                            
                                    /*
                                        scene.tweens.add({ //slower one-off snakeEating tween
                                        targets: scene.snake.body, 
                                        scale: [1.25,1],
                                        yoyo: false,
                                        duration: 128,
                                        ease: 'Linear',
                                        repeat: 0,
                                        timeScale: slowMoValCopy,
                                        delay: scene.tweens.stagger(scene.speedSprint),
                                        onUpdate: (tween) => {
                                            scene.timeScale = slowMoValCopy /2;
                                        }
                                    });*/
                                    
                                    console.log('tween finished, start electrons');
                        
                                }, this);           
                            }, this);
                        }
                    })
                    
                } else {
                    scene.snake.grow(scene);
                    // Avoid double _atom getting while in transition
                    this.visible = false;
                    scene.pathTweens = new Set();

                    scene.playAtomSound();

                    // #region BAR RAINBOW
                    // Boost Bar Rainbow Code.
                    //scene.fxBoost = scene.boostBar.preFX.addColorMatrix();
                    scene.tweens.addCounter({
                        from: 0,
                        to: 360,
                        duration: 3000,
                        loop: -1,
                        onUpdate: (tween) => {
                            let hueValue = tween.getValue();
                            //scene.fxBoost.hue(hueValue);
                    
                            // Update each segment's tint with an offset and apply pastel effect
                            scene.snake.body.forEach((part, index) => {
                                // Add an offset to the hue for each segment
                                let partHueValue = (hueValue + index * 12.41) % 360;
                    
                                // Reduce saturation and increase lightness
                                let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
                    
                                if (color) {// only update color when it's not null
                                    part.setTint(color.color);
                                }
                            });
                        }
                    });

                    // #endregion
                    
                    // Finalfare!

                    var timeToScoreScreen = 2250;
                    var delayHold = 1000;

                    

                    scene.snake.criticalStateTween.pause(); 
                    scene.tweens.add({
                        targets: scene.snake.head,
                        x: {from: scene.snake.previous[0], to:_x },
                        y: { from: scene.snake.previous[1], to:_y },
                        duration: timeToScoreScreen,
                        delay: 720,
                        ease:'Expo.easeIn', // 'Expo.easeIn' 'Back.easeIn'
                        onComplete: () => {
                            this.move(scene);
                            scene.hidePortals(120);
                            scene.countDownTimer.setHTML('W1N');
                            //scene.countDownTimer.x += 3;
                            scene.events.emit('win');
                            finalAtomCopy.destroy();
                            
                        }
                    });

                    // #region Spiral

                    var body = scene.snake.body.slice(1, scene.snake.body.length);

                    var graphics = scene.add.graphics();
                    graphics.lineStyle(1, 0xffffff, 1);

                    var flipCounter = 0;

                    body.forEach( segment => {
                        var path = new Phaser.Curves.Path();

                        segment.setOrigin(0.5,0.5);
                        segment.x = segment.x + GRID / 2;
                        segment.y = segment.y + GRID / 2;

                        var r = Phaser.Math.Distance.BetweenPoints(scene.snake.head.getCenter(), segment.getCenter());
                        var _angle = Phaser.Math.Angle.BetweenPoints(scene.snake.head, segment);

                        var _degrees = Phaser.Math.RadToDeg(_angle);

                        var clockwise;
                        flipCounter++;

                        if (flipCounter % 2 === 0) {
                            clockwise = true;
                        } else {
                            clockwise = false;
                        }
                        
                        
                        path.add(new Phaser.Curves.Ellipse(
                            scene.snake.head.getCenter().x, 
                            scene.snake.head.getCenter().y, 
                            r,
                            r,
                            0,
                            360,
                            clockwise,
                            _degrees  
                        ));

                        var follower = { t: 0, vec: new Phaser.Math.Vector2(segment.x, segment.y),  };

                        
                        // path.draw(graphics); // Draws the circle paths

                        

                        var pathTween = scene.tweens.add({
                            targets: follower,
                            t: 1,
                            ease: 'Linear',
                            duration: Phaser.Math.Between(2000,3000),
                            delay: delayHold,
                            repeat: -1,
                            onUpdate: (tween, targets) => {
                                path.getPoint(targets.t, targets.vec);
                                segment.x = targets.vec.x;
                                segment.y = targets.vec.y;

                            }
                        });

                        scene.pathTweens.add(pathTween);

                        var _radius = Phaser.Math.Between(22,27);
                        scene.tweens.add({
                            targets: path.curves,
                            ease: 'Back.easeIn',
                            delay: delayHold,
                            duration: timeToScoreScreen,
                            xRadius: _radius,
                            yRadius: _radius,
                        })
                    });

                    

                    // #endregion
                }
                
            }
            
            if (STAGE_OVERRIDES.has(scene.stage) && "afterEat" in STAGE_OVERRIDES.get(scene.stage).methods) {
                        STAGE_OVERRIDES.get(scene.stage).methods.afterEat(scene, this);
            }
            
            return 'valid';
        }
    },
    
    
    // #region move
    move: function (scene) {

        this.prevX = this.x;
        this.prevY = this.y;

        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = "empty";
        
        
        var validLocations = scene.validSpawnLocations();
        
        var pos = Phaser.Math.RND.pick(validLocations);

        this.setPosition(pos.x, pos.y );
        scene.foodHistory.push([(pos.x - X_OFFSET) / GRID, (pos.y - Y_OFFSET) / GRID, INPUT.moveCount]);
        //console.log(this.x,this.y)
        this.electrons.setPosition(pos.x, pos.y);
        this.electrons.visible = false;
        //console.log(this.electrons.x,this.electrons.y)


        this.respawnTimer = 20; // DecaSeconds
        scene.atomRespawnPool.add(this);

        scene.interactLayer[(this.x - X_OFFSET) / GRID][(this.y - Y_OFFSET) / GRID] = this;
       

        if (DEBUG) { // Reset Fruit Timer Text
            this.fruitTimerText.setPosition(this.x + GRID + 3 , this.y - 1); // Little Padding to like nice
        }

        if (STAGE_OVERRIDES.has(scene.stage) && "afterMoveFood" in STAGE_OVERRIDES.get(scene.stage).methods) {
            STAGE_OVERRIDES.get(scene.stage).methods.afterMoveFood(scene, this);
}
    },
});

export { Food };