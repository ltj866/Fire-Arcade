class Snake extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('sky', 'assets/skies/pixelsky.png');
        this.load.spritesheet('blocks', 'assets/sprites/heartstar32.png', { frameWidth: 32, frameHeight: 32 });
    }

    create ()
    {
        
        
        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');
        // define keys
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.on('keydown', e => {
            this.updateDirection(e);
        })

        this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
            console.log(e.code+" unPress", this.time.now);
        }) 
        
        this.add.image(416, 320, 'sky');

        //  Create a series of sprites, with a block as the 'head'

        
        this.alive = true;
        this.lastMoveTime = 0
        const snake = [];
        const head = this.add.image(64 * 32, 128, 'blocks', 0).setOrigin(0); // 0 is head sprite and 1 is body
        
        snake.push(head)

        

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

        //  0 = left
        //  1 = right
        //  2 = up
        //  3 = down
        let direction = 3;
        let distance = 4;

        //  Create a movement timer - every 100ms we'll move the 'snake'

        this.time.addEvent({ delay: 85, loop: true, callback: () => {

            let x = head.x;
            let y = head.y;

            if (direction === 0)
            {
                x = Phaser.Math.Wrap(x - 32, 0, 800);
            }
            else if (direction === 1)
            {
                x = Phaser.Math.Wrap(x + 32, 0, 800);
            }
            else if (direction === 2)
            {
                y = Phaser.Math.Wrap(y - 32, 0, 576);
            }
            else if (direction === 3)
            {
                y = Phaser.Math.Wrap(y + 32, 0, 576);
            }

            Phaser.Actions.ShiftPosition(snake, x, y);

            distance--;

            if (distance === 0)
            {
                if (direction <= 1)
                {
                    direction = Phaser.Math.Between(2, 3);
                }
                else
                {
                    direction = Phaser.Math.Between(0, 1);
                }

                distance = 4;
            }

        }});
    }
    
    move ()
    {
        let x = head.x;
        let y = head.y;

        if (direction === 0)
            {
                x = Phaser.Math.Wrap(x - 32, 0, 832);
            }
            else if (direction === 1)
            {
                x = Phaser.Math.Wrap(x + 32, 0, 832);
            }
            else if (direction === 2)
            {
                y = Phaser.Math.Wrap(y - 32, 0, 640);
            }
            else if (direction === 3)
            {
                y = Phaser.Math.Wrap(y + 32, 0, 640);
            }

            Phaser.Actions.ShiftPosition(snake, x, y);

    }
    updateDirection(event) {
        // console.log(event.keyCode, this.time.now); // all keys
        switch (event.keyCode) {
            case 87: // w
            console.log(event.code, this.time.now);
            break;

            case 65: // a
            console.log(event.code, this.time.now);
            break;

            case 83: // s
            console.log(event.code, this.time.now);
            break;

            case 68: // d
            console.log(event.code, this.time.now);
            break;

            case 38: // UP
            console.log(event.code, this.time.now);
            break;

            case 37: // LEFT
            console.log(event.code, this.time.now);
            break;

            case 40: // DOWN
            console.log(event.code, this.time.now);
            break;

            case 39: // RIGHT
            console.log(event.code, this.time.now);
            break;

            case 32: // SPACE
            console.log(event.code, this.time.now);

        }
    
    }

    update (time, delta) {
    // console.log("update -- time=" + time + " delta=" + delta);
        if (!this.alive)
            {
                return;
            }
        
        if(time >= this.lastMoveTime + this.moveInterval){
            this.lastMoveTime = time;
            //this.move();
            //console.log(this.previousDirection)
        }
        if (!this.spaceBar.isDown){
            this.moveInterval = 96;} // Less is Faster
        else{
            this.moveInterval = 32;
        }
    }
}



const config = {
    type: Phaser.AUTO,
    width: 832,
    height: 640,
    parent: 'phaser-example',
    scene: Snake
};

const game = new Phaser.Game(config);
