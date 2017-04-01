Game.Preloader = function (game) {
    this.preloadBar = null;
};

Game.Preloader.prototype = {
    preload : function () {
        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
        
        this.preloadBar.anchor.setTo(0.5, 0.5);
        
        this.time.advancedTiming = true;
        
        this.load.setPreloadSprite(this.preloadBar);
        
        //Load all assets
        this.load.tilemap('map', 'assets/tileset/level1.csv');
        this.load.image('tileset', 'assets/img/tileset_map2.png');
        
        this.load.spritesheet('player', 'assets/img/player.png');
        this.load.spritesheet('phantom', 'assets/img/player.png');
        this.load.spritesheet('smallGum', 'assets/img/small_gum.png');
        this.load.spritesheet('bigGum', 'assets/img/big_gum.png');
    },
    
    create : function () {
        this.state.start('LevelSingle');
    }
};
