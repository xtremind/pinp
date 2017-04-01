window.onload = function () {
    //Initialise game variable
    var game = new Phaser.Game(800, 640, Phaser.CANVAS, 'gameContainer');
    
    //Declare states
    game.state.add('Boot', Game.Boot);
    game.state.add('Preloader', Game.Preloader);
    game.state.add('MainMenu', Game.MainMenu);
    game.state.add('LevelSingle', Game.LevelSingle);

    //Launch Boot state
    game.state.start('Boot');
};
