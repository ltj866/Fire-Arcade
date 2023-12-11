
export default class Snake {
    constructor(scene){
        this.scene = scene;
        this.lastMoveTime = 0; // The last time we called move()
        this.moveInterval = 100;
        this.tileSize = 8;
        this.direction = Phaser.Math.Vector2.DOWN;
        this.body = []; // body will be a set of boxes

        //head of the snake
        this.body.push(this.scene.add.rectangle(
            this.scene.game.config.width -32, 
            this.scene.game.config.height/2, 
            this.tileSize, 
            this.tileSize, 
            0xff0000
            ).setOrigin(0));
        // setOrigin will show the full square at 0,0

        this.apple = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0x00ff00).setOrigin(0)
        this.wall = [];
        this.wall2 = [];
        this.wall3 = [];
        this.portal = [];
        this.color = [];
        this.color[0] = "0x0000ff";
        this.color[1] = "0xffff00"
        this.color[2] = "0xFFA500"
        this.color[3] = "0x8300ff"
        this.color[4] = "0xffc0cb"
        this.color[5] = "0x40e0d0"
        this.color[6] = "0xc90076"
        this.color[7] = "0x800080"
        this.map = [];
        this.map = this.randomSequence();
        console.log(this.map);

        this.positionApple();
        this.positionPortal();
        this.positionWall();
        

        scene.input.keyboard.on('keydown', e => {
            this.keydown(e);
        })
    }

    positionApple() {
        this.apple.x = Math.floor(
            (Math.random() * this.scene.game.config.width)/this.tileSize
            ) * this.tileSize;
        this.apple.y = Math.floor(
            (Math.random() * this.scene.game.config.height)/this.tileSize
            ) * this.tileSize;
        if (this.apple.x == 320 || this.apple.x == 640 || this.apple.x == 960) {
            this.apple.x += 16;
        }
    }
    positionPortal(){
        let j = 160;
        for (let i = 0; i < 8; i++) {
        this.portal[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, this.color[i]).setOrigin(0)
        this.portal[i].x = Math.floor(
            (Math.random() * ((j-159) - j) + j)/this.tileSize
            ) * this.tileSize;
        this.portal[i].y = Math.floor(
            (Math.random() * this.scene.game.config.height)/this.tileSize
            ) * this.tileSize;
            j +=160;
        }
    }
  
    positionWall(){
       for (let i = 0; i < this.scene.game.config.height; i++) {
        this.wall[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0);
        this.wall[i].x = 320;
        this.wall[i].y = i;
        this.wall2[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0);
        this.wall2[i].x = 640;
        this.wall2[i].y = i;
        this.wall3[i] = this.scene.add.rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff).setOrigin(0);
        this.wall3[i].x = 960;
        this.wall3[i].y = i;
       }
    }

    keydown(event){
        // console.log(event);
        switch(event.keyCode){
            case 37:    //left
                if(this.direction !== Phaser.Math.Vector2.RIGHT)    
                    this.direction = Phaser.Math.Vector2.LEFT;
                break;
            case 38:    //up
                if(this.direction !== Phaser.Math.Vector2.DOWN)
                    this.direction = Phaser.Math.Vector2.UP;
                break;
            case 39:    //right
                if(this.direction !== Phaser.Math.Vector2.LEFT)
                    this.direction = Phaser.Math.Vector2.RIGHT;
                break;
            case 40:    //down
                if(this.direction !== Phaser.Math.Vector2.UP)
                    this.direction = Phaser.Math.Vector2.DOWN;
                break;
        }
    }
    randomSequence() {
        let sequence = [4, 5, 6, 7];
        let newArray = [];
    
        // Randomly arrange the sequence and add it to the new array
        while (sequence.length > 0) {
            let randomIndex = Math.floor(Math.random() * sequence.length);
            newArray.push(sequence[randomIndex]);
            sequence = sequence.filter((_, index) => index !== randomIndex);
        }
    
        // Add the indices of the first half to the second half of the new array
        for (let i = 4; i < 8; i++) {
            newArray[i] = newArray.indexOf(i);
        }
    
        return newArray;
    }
    
    
    

    update(time){
        if(time >= this.lastMoveTime + this.moveInterval){
            this.lastMoveTime = time;
            this.move();
        }
    }

    move(){
        let x = this.body[0].x + this.direction.x * this.tileSize;
        let y = this.body[0].y + this.direction.y * this.tileSize;
       

        // if snakes eat the apple
        if(this.apple.x === x && this.apple.y === y){
            this.body.push(
                this.scene.add.
                rectangle(0, 0, this.tileSize, this.tileSize, 0xffffff)
                .setOrigin(0)
            );
            this.positionApple();

        }
        for (let i = 0; i < 8; i++) {
            if (this.portal[i].x == x && this.portal[i].y == y) {
                let j = this.map[i];
                if (this.direction.x == 1 && this.direction.y == 0) {
                    x = this.portal[j].x+8;
                    y = this.portal[j].y;
                } else if (this.direction.x == -1 && this.direction.y == 0) {
                    x = this.portal[j].x-8;
                    y = this.portal[j].y;
                } else if (this.direction.x == 0 && this.direction.y == -1) {
                    x = this.portal[j].x;
                    y = this.portal[j].y-8;
                } else if (this.direction.x == 0 && this.direction.y == 1) {
                    x = this.portal[j].x;
                    y = this.portal[j].y+8;
                }
            }
        }

        

        for (let index = this.body.length-1; index>0; index--){
            this.body[index].x = this.body[index-1].x;
            this.body[index].y = this.body[index-1].y;
        }

        this.body[0].x = x;
        this.body[0].y = y;

        // Death by hitting the wall
        if(
            this.body[0].x < 0 || 
            this.body[0].x >= this.scene.game.config.width ||
            this.body[0].y < 0 || 
            this.body[0].y >= this.scene.game.config.height ||
            this.body[0].x == 320 ||
            this.body[0].x == 640 ||
            this.body[0].x == 960
        ){
            this.scene.scene.restart();

        }

        // Death by eating itself
        let tail = this.body.slice(1);  // tail - headpos === any of tail positions

        // if any tailpos == headpos
        if(
            tail.some(
                section => section.x === this.body[0].x && 
                section.y === this.body[0].y
                ) 
                // arr.some() method checks whether 
                // at least one of the elements of the array 
                // satisfies the condition checked by the argument method 
        ){
            this.scene.scene.restart();
        }
        
    }
}