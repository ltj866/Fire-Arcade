var config = {
    type: Phaser.WEBGL,
    width: 832,
    height: 640,
    parent: 'phaser-example',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var snake;

//  Direction consts
var LEFT = 0;
var RIGHT = 1;
var UP = 2;
var DOWN = 3;

var GRID = 32;


const game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/skies/pixelsky.png');
    this.load.spritesheet('blocks', 'assets/sprites/heartstar32.png', { frameWidth: GRID, frameHeight: GRID });
}

function create ()
{
    
    this.apples = [];
    this.walls = [];
    
    this.lastMoveTime = 0; // The last time we called move()
    this.moveInterval = 96;

    // define keys       
    this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown', e => {
        updateDirection(this, e);
    })

    this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
        console.log(e.code+" unPress", this.time.now);
    }) 
    
    // add background
    this.add.image(416, 320, 'sky');

    var Food = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Food (scene)
        {

            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 1);
            this.move();
            this.setOrigin(0);

            this.points = 100;

            scene.apples.push(this);

            scene.children.add(this); // make sense of this
        },
        
        move: function ()
        {
            let x;
            let y;

            x = Phaser.Math.RND.between(0,25); //TODO Only Spawn on Safe Spaces
            y = Phaser.Math.RND.between(0,19);

            this.setPosition(x * GRID, y * GRID);

        },    

    });

    var Wall = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Wall (scene, x, y)
        {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 0);
            this.setPosition(x * GRID, y * GRID);
            this.setOrigin(0);

            scene.walls.push(this);

            scene.children.add(this);
        },
    });


    var Snake = new Phaser.Class({
        initialize:

        function Snake (scene, x, y)
        {
        
            this.alive = true;
            this.body = []
            this.head = scene.add.image(x * GRID, y * GRID, 'blocks', 0);
            this.head.setOrigin(0);
            this.body.push(this.head);

            // Trying to get one body part to follow correctly.
            //var part = scene.add.image((x-1) * 32, y * 32, 'blocks', 1);
            //part.setOrigin(0);
            //this.body.push(part);



            this.moveTime = 0;
            this.direction = LEFT;
        },
        
        update: function (time)
        {
            
            //if (time >= this.moveTime) Why is this here, does it do anything?
            //{
            //    return this.move(time);
            //}
        },
        
        move: function (time)
        {

        let x = this.head.x;
        let y = this.head.y;

        if (this.direction === LEFT)
        {
            x = Phaser.Math.Wrap(x - GRID, 0, 832);
        }
        else if (this.direction === RIGHT)
        {
            x = Phaser.Math.Wrap(x + GRID, 0, 832);
        }
        else if (this.direction === UP)
        {
            y = Phaser.Math.Wrap(y - GRID, 0, 640);
        }
        else if (this.direction === DOWN)
        {
            y = Phaser.Math.Wrap(y + GRID, 0, 640);
        }
        Phaser.Actions.ShiftPosition(this.body, x, y);

        },
    });

    snake = new Snake(this, 8, 8);
    
    // x = width 25 grid
    // y width 19

    for (let i = 0; i <= 25; i++) {
        wall = new Wall(this, i, 0);
        wall = new Wall(this, i, 19);
      }
    
    var wall = new Wall(this, 10, 10);
    var wall = new Wall(this, 10, 11);
    var wall = new Wall(this, 10, 12);
    var wall = new Wall(this, 10, 13);
    var wall = new Wall(this, 10, 14);

    var food0 = new Food(this);
    var food1 = new Food(this, 14, 10);
    var food2 = new Food(this, 5, 13);

}
    
function updateDirection(game, event) 
{
    // console.log(event.keyCode, this.time.now); // all keys
    switch (event.keyCode) {
        case 87: // w
        //console.log(event.code, game.time.now);
        snake.direction = UP;
        break;

        case 65: // a
        //console.log(event.code, game.time.now);
        snake.direction = LEFT;
        break;

        case 83: // s
        //console.log(event.code, game.time.now);
        snake.direction = DOWN;
        break;

        case 68: // d
        //console.log(event.code, game.time.now);
        snake.direction = RIGHT;
        break;

        case 38: // UP
        //console.log(event.code, game.time.now);
        snake.direction = UP;
        break;

        case 37: // LEFT
        //console.log(event.code, game.time.now);
        snake.direction = LEFT;
        break;

        case 40: // DOWN
        //console.log(event.code, game.time.now);
        snake.direction = DOWN;
        break;

        case 39: // RIGHT
        //console.log(event.code, game.time.now);
        snake.direction = RIGHT;
        break;

        case 32: // SPACE
        console.log(event.code, game.time.now);

    }

}

    function update (time, delta) 
{
// console.log("update -- time=" + time + " delta=" + delta);
    if (!snake.alive)
        {
            // game.scene.scene.restart(); // This doesn't work correctly
            return;
        }
    
    if(time >= this.lastMoveTime + this.moveInterval){
        this.lastMoveTime = time;
        snake.move();
        //console.log(this.previousDirection)
    }
    if (!this.spaceBar.isDown){
        this.moveInterval = 96;} // Less is Faster
    else{
        this.moveInterval = 32;
    }
    //console.log(this.apples[0]);
   
    // Check collision for all Fruits
    this.apples.forEach(fruit => {
        if(snake.head.x === fruit.x && snake.head.y === fruit.y){
            console.log("EAT");
            fruit.move()
            return 'valid';
        }
    });

    this.walls.forEach(wall => {
        if(snake.head.x === wall.x && snake.head.y === wall.y){
            console.log("DEAD");
            snake.alive = false;
            return 'valid';
        }
    });
}


