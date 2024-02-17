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
            this.moveTime = 0;
            this.direction = 3;
        },
        
        update: function (time)
        {
            if (time >= this.moveTime)
            {
                return this.move(time);
            }
        },
        move: function (time)
        //  0 = left
        //  1 = right
        //  2 = up
        //  3 = down
        {

        let x = this.head.x;
        let y = this.head.y;

        if (this.direction === 0)
        {
            x = Phaser.Math.Wrap(x - 32, 0, 832);
        }
        else if (this.direction === 1)
        {
            x = Phaser.Math.Wrap(x + 32, 0, 832);
        }
        else if (this.direction === 2)
        {
            y = Phaser.Math.Wrap(y - 32, 0, 640);
        }
        else if (this.direction === 3)
        {
            y = Phaser.Math.Wrap(y + 32, 0, 640);
        }
        Phaser.Actions.ShiftPosition(this.body, x, y);

        }
    });

    snake = new Snake(this, 5, 5);

    //  Create a series of sprites, with a block as the 'head'
    

    self.direction = 3

    

    /***
    for (let i = 0; i < 12; i++)
    {
        const part = this.add.image(64 + i * 32, 128, 'blocks', 1);

        part.setOrigin(0, 0);

        if (i === 11)
        {
            part.setFrame(0);

            head = part;
        }

        snake.push(part);
    }
    */


    let direction = 3;
}
    
function updateDirection(game, event) 
{
    // console.log(event.keyCode, this.time.now); // all keys
    switch (event.keyCode) {
        case 87: // w
        console.log(event.code, game.time.now);
        break;

        case 65: // a
        console.log(event.code, game.time.now);
        break;

        case 83: // s
        console.log(event.code, game.time.now);
        break;

        case 68: // d
        console.log(event.code, game.time.now);
        break;

        case 38: // UP
        console.log(event.code, game.time.now);
        break;

        case 37: // LEFT
        console.log(event.code, game.time.now);
        break;

        case 40: // DOWN
        console.log(event.code, game.time.now);
        break;

        case 39: // RIGHT
        console.log(event.code, game.time.now);
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
}


