class Example extends Phaser.Scene
{
    create ()
    {
        const style = {
            fontSize: '32px',
            fontFamily: 'Times New Roman',
            color: '#ffffff',
            backgroundColor: '#333333',  
            padding: "15px"
        };

        const selections = [];

        
        for (let i = 1; i <= 5; i++) {
            var voteText = this.add.dom(150, i*100, "div", style);
            var voteNumText = this.add.dom(250, i*100, "div", style);
            selections.push([voteText, voteNumText, 0]);

            voteText.setText(`Vote ${i}`);
            voteNumText.setText(0);
        }
        console.log(selections);

        var selected = selections[0];
        var index = 0;
        
        selected[0].node.style.color = "red";

        this.input.keyboard.on('keydown-SPACE', function() {
            selected[2] += 1;
            selected[1].setText(selected[2]);
        }, [], this);

        this.input.keyboard.on('keydown-DOWN', function() {
            selected[0].node.style.color = "white";
            index += 1;
            
            selected = selections[index];
            selected[0].node.style.color = "red";
        }, [], this);

        this.input.keyboard.on('keydown-UP', function() {
            selected[0].node.style.color = "white";
            index -= 1;
            
            selected = selections[index];
            selected[0].node.style.color = "red";
        }, [], this);


    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: Example,
    dom: {
        createContainer: true
        }
};

const game = new Phaser.Game(config);