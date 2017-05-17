var Game = {};

Game.Boot = function (game) {
    
};

Game.Boot.prototype = {
    init : function () {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
		this.stage.backgroundColor = '#3A5963';
    },
    
    preload : function () {
        this.load.image('preloaderBar', 'assets/img/phaser.png');
        this.load.image('progressBar', 'assets/img/progressBar.png');
    },
    
    create: function () {
        this.state.start('Preloader');
    }
};