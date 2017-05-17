Game.MainMenu = function (game) {
};

Game.MainMenu.prototype = {
    create : function () {

        // add a background image

        // add a title
        var title = this.add.text(this.world.centerX, 80, 'Pacman Battle Royale', {font: '50px Arial', fill: '#ffffff'});
        title.anchor.setTo(0.5, 0.5);

        // show the score
        var score = this.add.text(this.world.centerX, this.world.centerY, 'Score : ' + this.game.global.score , {font: '25px Arial', fill: '#ffffff'});
        score.anchor.setTo(0.5, 0.5);

        // explain how to start a game
        var comment = this.add.text(this.world.centerX, this.world.height-80, 'Press UP key to start ', {font: '25px Arial', fill: '#ffffff'});
        comment.anchor.setTo(0.5, 0.5);

        // create a new Phaser keyboard variable
        var upKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);

        // when the key UP is pressed, it will call the 'start' function once
        upKey.onDown.addOnce(this.start, this);
    },
    
    start : function () {
        // start the game
        this.state.start('LevelSingle');
    }
};
