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

const game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/skies/pixelsky.png');
    this.load.spritesheet('blocks', 'assets/sprites/heartstar32.png', { frameWidth: 32, frameHeight: 32 });
}

function create ()
{
    
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

        function Food (scene, x, y)
        {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('blocks', 1);
            this.setPosition(x * 32, y * 32);
            this.setOrigin(0);

            this.points = 100;

            scene.children.add(this);
        },

    });


    var Snake = new Phaser.Class({
        initialize:

        function Snake (scene, x, y)
        {
        
            this.alive = true;
            this.parts = scene.add.group();
            this.body = []
            this.head = scene.add.image(x * 32, y * 32, 'blocks', 0);
            this.head.setOrigin(0);
            this.body.push(this.head);

            // Trying to get one body part to follow correctly. WORKING HERE
            var part = scene.add.image((x-1) * 32, y * 32, 'blocks', 1);
            part.setOrigin(0);
            this.body.push(part)



            this.moveTime = 0;
            this.direction = LEFT;
        },
        
        update: function (time)
        {
            if (time >= this.moveTime)
            {
                return this.move(time);
            }
        },
        
        move: function (time)
        {

        let x = this.head.x;
        let y = this.head.y;

        if (this.direction === LEFT)
        {
            x = Phaser.Math.Wrap(x - 32, 0, 832);
        }
        else if (this.direction === RIGHT)
        {
            x = Phaser.Math.Wrap(x + 32, 0, 832);
        }
        else if (this.direction === UP)
        {
            y = Phaser.Math.Wrap(y - 32, 0, 640);
        }
        else if (this.direction === DOWN)
        {
            y = Phaser.Math.Wrap(y + 32, 0, 640);
        }
        Phaser.Actions.ShiftPosition(this.body, x, y);

        },
    });

    snake = new Snake(this, 8, 4);

    this.apples = [];
    var food = new Food(this, 0, 0);
    this.apples.push(food)

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
   
    if (snake.head.x === this.apples[0].x && snake.head.y === this.apples[0].y){
        console.log("HIT");
        snake.body.push(
            this.add.image(
                snake.head.x, snake.head.y, 'blocks', 1
            ).setOrigin(0)
        );
        this.apples[0].x = 5 * 32;
        this.apples[0].y = 5 * 32;
    }
}


